<?php
/**
 * Contact-form handler for the static build (shared PHP hosting).
 *
 * Receives JSON from the website's request form, applies basic spam
 * protection, and emails the business. Settings live in contact-config.php
 * (generated on first build, safe to edit on the server; later uploads do not
 * overwrite it unless you choose to).
 *
 * Delivery: Resend HTTPS API when `resend_api_key` is set, otherwise PHP's
 * mail() through the hosting account. If Resend fails, mail() is tried.
 */
declare(strict_types=1);

// Never let PHP warnings/notices leak into the JSON response (they are logged instead).
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');

function respond(int $status, array $data): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$config = [
    'to' => '',
    'from' => '',
    'resend_api_key' => '',
    'min_seconds' => 2,
    'rate_max' => 5,
    'rate_window_seconds' => 600,
];
$configFile = __DIR__ . '/contact-config.php';
if (is_file($configFile)) {
    $loaded = require $configFile;
    if (is_array($loaded)) {
        $config = array_merge($config, $loaded);
    }
}

$to = trim((string) $config['to']);
$from = trim(preg_replace('/[\r\n]+/', ' ', (string) $config['from']));
if (!filter_var($to, FILTER_VALIDATE_EMAIL) || $from === '') {
    error_log('contact.php: contact-config.php is missing a valid "to" or "from".');
    respond(500, ['ok' => false, 'error' => 'not_configured']);
}

// Same-site posts only (browsers always send Origin on cross-site POSTs).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $normalise = static fn (string $h): string => preg_replace('/^www\./i', '', strtolower($h));
    $originHost = $normalise((string) parse_url($origin, PHP_URL_HOST));
    $thisHost = $normalise(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
    if ($originHost !== $thisHost) {
        respond(403, ['ok' => false, 'error' => 'forbidden']);
    }
}

$raw = file_get_contents('php://input', false, null, 0, 20001);
if ($raw === false || strlen($raw) > 20000) {
    respond(413, ['ok' => false, 'error' => 'too_large']);
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'bad_request']);
}

// Honeypot: bots fill the hidden field. Pretend success.
if (trim((string) ($data['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}

$name = trim((string) ($data['name'] ?? ''));
$subject = trim(preg_replace('/[\r\n]+/', ' ', (string) ($data['subject'] ?? '')));
$body = str_replace(["\r\n", "\r"], "\n", trim((string) ($data['body'] ?? '')));
$replyTo = trim((string) ($data['replyTo'] ?? ''));
$submissionId = (string) ($data['submissionId'] ?? '');

if ($name === '' || mb_strlen($name) > 120 || $subject === '' || $body === '' || mb_strlen($body) > 12000) {
    respond(422, ['ok' => false, 'error' => 'invalid']);
}
$subject = mb_substr($subject, 0, 200);
if ($replyTo !== '' && (!filter_var($replyTo, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $replyTo))) {
    $replyTo = '';
}

// Instant submissions are bots. The browser sends when the form was opened.
$started = (int) ($data['started'] ?? 0);
if ($started > 0 && (microtime(true) * 1000 - $started) < ((int) $config['min_seconds']) * 1000) {
    respond(422, ['ok' => false, 'error' => 'too_fast']);
}

// File-based state (rate limit + de-duplication) in a private temp directory.
$stateDir = sys_get_temp_dir() . '/dons-hvac-contact-' . substr(hash('sha256', __DIR__), 0, 12);
if (!is_dir($stateDir)) {
    @mkdir($stateDir, 0700, true);
}

// De-duplicate double submits / retries of the same form.
if (preg_match('/^[A-Za-z0-9-]{16,64}$/', $submissionId) && is_dir($stateDir)) {
    $marker = $stateDir . '/sub-' . $submissionId;
    if (is_file($marker) && time() - (int) filemtime($marker) < 600) {
        respond(200, ['ok' => true]);
    }
}

// Rate limit per visitor address.
if (is_dir($stateDir)) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateFile = $stateDir . '/rate-' . hash('sha256', $ip . __DIR__);
    $window = (int) $config['rate_window_seconds'];
    $now = time();
    $fh = @fopen($rateFile, 'c+');
    if ($fh && flock($fh, LOCK_EX)) {
        $hits = json_decode((string) stream_get_contents($fh), true);
        $hits = array_values(array_filter(is_array($hits) ? $hits : [], static fn ($t) => $now - (int) $t < $window));
        if (count($hits) >= (int) $config['rate_max']) {
            flock($fh, LOCK_UN);
            fclose($fh);
            respond(429, ['ok' => false, 'error' => 'rate_limited']);
        }
        $hits[] = $now;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($hits));
        flock($fh, LOCK_UN);
    }
    if ($fh) {
        fclose($fh);
    }
}

function send_with_resend(string $key, string $from, string $to, string $subject, string $body, string $replyTo): bool
{
    if (!function_exists('curl_init')) {
        return false;
    }
    $payload = ['from' => $from, 'to' => [$to], 'subject' => $subject, 'text' => $body];
    if ($replyTo !== '') {
        $payload['reply_to'] = $replyTo;
    }
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $key, 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload),
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if (PHP_VERSION_ID < 80000) {
        curl_close($ch); // no effect (and deprecated) since PHP 8.0
    }
    if ($status !== 200 || !is_string($response)) {
        error_log('contact.php: Resend rejected the message (HTTP ' . $status . '): ' . substr((string) $response, 0, 300));
        return false;
    }
    return true;
}

function send_with_mail(string $from, string $to, string $subject, string $body, string $replyTo): bool
{
    $headers = [
        'From' => $from,
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => '8bit',
    ];
    if ($replyTo !== '') {
        $headers['Reply-To'] = $replyTo;
    }
    $encodedSubject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
    // -f sets the envelope sender, which improves deliverability on most hosts.
    $params = preg_match('/<([^<>@\s]+@[^<>\s]+)>/', $from, $m) ? '-f' . $m[1] : (filter_var($from, FILTER_VALIDATE_EMAIL) ? '-f' . $from : '');
    return $params !== ''
        ? @mail($to, $encodedSubject, $body, $headers, $params)
        : @mail($to, $encodedSubject, $body, $headers);
}

$sent = false;
$key = trim((string) $config['resend_api_key']);
if ($key !== '') {
    $sent = send_with_resend($key, $from, $to, $subject, $body, $replyTo);
}
if (!$sent) {
    $sent = send_with_mail($from, $to, $subject, $body, $replyTo);
}

if (!$sent) {
    error_log('contact.php: message could not be sent.');
    respond(502, ['ok' => false, 'error' => 'send_failed']);
}

if (isset($marker) && is_dir($stateDir)) {
    @touch($marker);
}
respond(200, ['ok' => true]);
