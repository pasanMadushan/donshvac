<?php
/**
 * Local preview of dist-static/ that behaves like the .htaccess on the real
 * host (extensionless pages, no trailing slash, 404 page) while running
 * contact.php for real.   npm run preview:static   →  http://127.0.0.1:4000
 */
$root = $_SERVER['DOCUMENT_ROOT'];
$path = urldecode((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if ($path !== '/' && substr($path, -1) === '/') {
    header('Location: ' . rtrim($path, '/'), true, 308);
    exit;
}
if ($path === '/') {
    header('Content-Type: text/html; charset=utf-8');
    readfile($root . '/index.html');
    return true;
}
$file = $root . $path;
if (preg_match('#/opengraph-image(-[a-z0-9]+)?$#', $path) && is_file($file)) {
    header('Content-Type: image/png');
    readfile($file);
    return true;
}
if (is_file($file)) {
    return false; // let PHP serve the file (and run *.php)
}
if (is_file($file . '.html')) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($file . '.html');
    return true;
}
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
readfile($root . '/404.html');
return true;
