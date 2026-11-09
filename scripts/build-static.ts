/**
 * Static build for plain shared hosting (Apache/LiteSpeed + PHP).
 *
 *   npm run build:static
 *
 * Produces dist-static/ — upload its contents to the web root (public_html).
 * Your working tree is never modified: the build runs in a temporary copy of
 * the project from which the admin/CMS server code is removed and the contact
 * form's Server Action is replaced by a call to contact.php
 * (static-host/overrides). The normal `npm run build` / `npm start` flow, the
 * admin area and the CMS are untouched.
 *
 * Settings come from the environment or an optional .env.static file
 * (see .env.static.example).
 */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { legacyRedirectRules } from "../src/config/legacy-redirects";
import { resolveSitePolicy } from "../src/config/site";

const root = process.cwd();
const tmp = path.join(os.tmpdir(), "dons-hvac-static-build");
const outDir = path.join(root, "dist-static");

function loadEnvFile(file: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (line.trim().startsWith("#")) continue;
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return env;
}

const fileEnv = loadEnvFile(path.join(root, ".env.static"));
const get = (k: string): string => (process.env[k] ?? fileEnv[k] ?? "").trim();

const siteEnv = {
  SITE_MODE: get("SITE_MODE") || "demo",
  SITE_CANONICAL_ORIGIN: get("SITE_CANONICAL_ORIGIN"),
  SITE_REDIRECT_HOSTS: get("SITE_REDIRECT_HOSTS"),
  SITE_DEMO_ORIGIN: get("SITE_DEMO_ORIGIN"),
  SITE_ALLOW_AI_TRAINING: get("SITE_ALLOW_AI_TRAINING"),
};
const policy = resolveSitePolicy({ ...process.env, ...siteEnv });
const formEndpoint = get("FORM_ENDPOINT") || "/contact.php";

function run(cmd: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env): void {
  const r = spawnSync(cmd, args, { cwd, env, stdio: "inherit" });
  if (r.status !== 0) {
    console.error(`\nFailed: ${cmd} ${args.join(" ")}`);
    process.exit(r.status ?? 1);
  }
}

/* ---------------------------------------------------------- 1. temp copy */
console.log(`\n▸ Preparing a temporary copy in ${tmp}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const SKIP = new Set([
  "node_modules", ".next", ".git", ".data", "dist-static", "static-host", "out", ".vercel",
  "test-results", "playwright-report", ".claude", ".DS_Store", "tsconfig.tsbuildinfo",
]);
for (const name of readdirSync(root)) {
  if (SKIP.has(name) || name.startsWith(".env")) continue;
  cpSync(path.join(root, name), path.join(tmp, name), { recursive: true });
}

// node_modules: copy-on-write clone where the filesystem supports it (instant,
// no extra disk space on macOS/APFS), else a regular copy.
function cloneModules(): void {
  const src = path.join(root, "node_modules");
  const dst = path.join(tmp, "node_modules");
  const attempts: string[][] =
    process.platform === "darwin"
      ? [["-cR", src, dst]]
      : process.platform === "linux"
        ? [["-R", "--reflink=auto", src, dst]]
        : [];
  for (const args of attempts) {
    rmSync(dst, { recursive: true, force: true });
    if (spawnSync("cp", args, { stdio: "ignore" }).status === 0) return;
  }
  console.log("  (cloning not available — copying node_modules, this can take a minute)");
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}
cloneModules();

/* ------------------------------------------- 2. remove server-only parts */
for (const rel of ["src/app/(admin)", "src/proxy.ts"]) {
  rmSync(path.join(tmp, rel), { recursive: true, force: true });
}
cpSync(path.join(root, "static-host", "overrides"), tmp, { recursive: true });

// Cache Components ("use cache") need a server runtime. The static export
// prerenders every page once, so the cache directives are simply removed from
// the copy (and the build fails loudly if the code ever changes shape).
{
  const file = path.join(tmp, "src/lib/cms/public.ts");
  let code = readFileSync(file, "utf8");
  const before = code;
  code = code
    .replace(/^import \{ cacheLife, cacheTag \} from "next\/cache";\n/m, "")
    .replace(/^\s*"use cache";\n/gm, "")
    .replace(/^\s*cacheTag\(.*\);\n/gm, "")
    .replace(/^\s*cacheLife\(.*\);\n/gm, "");
  if (code === before || /use cache|cacheTag|cacheLife/.test(code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, ""))) {
    console.error("Could not strip cache directives from src/lib/cms/public.ts — update scripts/build-static.ts.");
    process.exit(1);
  }
  writeFileSync(file, code);
}

// `ensureStatic` is a Cache Components option (see above); drop it from the copy.
{
  const file = path.join(tmp, "src/app/(site)/layout.tsx");
  const code = readFileSync(file, "utf8");
  const next = code.replace(/^export const ensureStatic = .*;\n/m, "");
  if (next === code) {
    console.error('Could not remove `ensureStatic` from src/app/(site)/layout.tsx — update scripts/build-static.ts.');
    process.exit(1);
  }
  writeFileSync(file, next);
}

// `output: "export"` requires GET route handlers to declare themselves static.
for (const rel of [
  "src/app/robots.txt/route.ts",
  "src/app/sitemap.xml/route.ts",
  "src/app/llms.txt/route.ts",
  "src/app/manifest.ts",
  "src/app/opengraph-image.tsx",
  "src/app/(site)/our-work/[slug]/opengraph-image.tsx",
]) {
  const file = path.join(tmp, rel);
  writeFileSync(file, `${readFileSync(file, "utf8")}\nexport const dynamic = "force-static";\n`);
}

/* ------------------------------------------------------------- 3. build */
console.log("\n▸ Building (static export)…");
const buildEnv: NodeJS.ProcessEnv = {
  ...process.env,
  ...siteEnv,
  STATIC_EXPORT: "1",
  NEXT_PUBLIC_FORM_ENDPOINT: formEndpoint,
  NEXT_PUBLIC_SITE_DEMO: policy.indexable ? "0" : "1",
  // No CMS / no database in the static build: seed content is used.
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
  SUPABASE_SECRET_KEY: "",
  SUPABASE_DB_URL: "",
  RESEND_API_KEY: "",
  NEXT_DIST_DIR: ".next",
};
run(path.join(tmp, "node_modules", ".bin", "next"), ["build"], tmp, buildEnv);

const built = path.join(tmp, "out");
if (!existsSync(path.join(built, "index.html"))) {
  console.error("Build finished but no static output was produced.");
  process.exit(1);
}

/* ---------------------------------------------------------- 4. dist-static */
console.log("\n▸ Writing dist-static/");
rmSync(outDir, { recursive: true, force: true });
cpSync(built, outDir, { recursive: true });
cpSync(path.join(root, "static-host", "contact.php"), path.join(outDir, "contact.php"));

// Don't upload what the site never references: macOS junk and the full-size
// JPG originals (pages use the resized WebP copies generated next to them).
function prune(dir: string): void {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) prune(p);
    else if (e.name === ".DS_Store") rmSync(p);
  }
}
prune(outDir);
for (const sub of ["projects", "services"]) {
  const dir = path.join(outDir, sub);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    const m = /^(.*)\.jpe?g$/i.exec(f);
    if (m && existsSync(path.join(dir, `${m[1]}-480.webp`))) rmSync(path.join(dir, f));
  }
}

const host = policy.canonicalHost;
const to = get("CONTACT_TO") || "donshvac2008@gmail.com";
const from =
  get("CONTACT_FROM") ||
  (host
    ? `Don's HVAC website <inquiries@${host.replace(/^www\./, "")}>`
    : "Don's HVAC website <inquiries@YOUR-DOMAIN.ca>");
const resendKey = get("CONTACT_RESEND_API_KEY");
const phpString = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
writeFileSync(
  path.join(outDir, "contact-config.php"),
  `<?php
// Settings for contact.php. Safe to edit on the server.
return [
    // Where requests are emailed.
    'to' => ${phpString(to)},
    // Sender shown on the email. Use an address on YOUR domain (a mailbox that
    // exists in your hosting account is best) so it is not marked as spam.
    'from' => ${phpString(from)},
    // Optional: a Resend API key (resend.com) to send through Resend instead of
    // the server's mail(). Requires a domain verified in Resend. Leave empty to use mail().
    'resend_api_key' => ${phpString(resendKey)},
    // Anti-spam: seconds a form must be open, and max sends per visitor per window.
    'min_seconds' => 2,
    'rate_max' => 5,
    'rate_window_seconds' => 600,
];
`,
);

/* ----------------------------------------------------------- 5. .htaccess */
const rules: string[] = [];
rules.push("# Generated by `npm run build:static`. Re-generated on every build.");
rules.push("Options -Indexes");
rules.push("DirectorySlash Off");
rules.push("DirectoryIndex index.html");
rules.push("AddDefaultCharset UTF-8");
rules.push("ErrorDocument 404 /404.html");
rules.push("AddType application/manifest+json .webmanifest");
rules.push("# Share images are written without a file extension");
rules.push('<FilesMatch "^opengraph-image(-[a-z0-9]+)?$">');
rules.push("  ForceType image/png");
rules.push("</FilesMatch>");
rules.push("");
rules.push("<IfModule mod_rewrite.c>");
rules.push("RewriteEngine On");
if (policy.indexable && policy.canonicalHost) {
  const esc = policy.canonicalHost.replace(/\./g, "\\.");
  rules.push("# One hop to the canonical https host");
  rules.push("RewriteCond %{HTTP_HOST} !^" + esc + "$ [NC]");
  rules.push(`RewriteRule ^ ${policy.canonicalOrigin}%{REQUEST_URI} [R=308,L]`);
  rules.push("RewriteCond %{HTTPS} !=on");
  rules.push("RewriteCond %{HTTP:X-Forwarded-Proto} !https");
  rules.push(`RewriteRule ^ ${policy.canonicalOrigin}%{REQUEST_URI} [R=308,L]`);
}
rules.push("# Old Wix addresses");
for (const [fromPath, toPath] of legacyRedirectRules()) {
  const src = fromPath.replace(/^\//, "").replace(/\/$/, "").replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  rules.push(`RewriteRule ^${src}/?$ ${toPath} [R=301,L]`);
}
rules.push("# /about/ → /about");
rules.push("RewriteCond %{REQUEST_URI} ^/(.+)/$");
rules.push("RewriteRule ^ /%1 [R=308,L]");
rules.push("# /about → about.html");
rules.push("RewriteCond %{REQUEST_FILENAME} !-f");
rules.push("RewriteCond %{REQUEST_FILENAME}.html -f");
rules.push("RewriteRule ^(.+)$ $1.html [L]");
rules.push("</IfModule>");
rules.push("");
rules.push("<IfModule mod_headers.c>");
rules.push('Header always set X-Content-Type-Options "nosniff"');
rules.push('Header always set Referrer-Policy "strict-origin-when-cross-origin"');
rules.push('Header always set X-Frame-Options "SAMEORIGIN"');
rules.push('Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), interest-cohort=()"');
if (!policy.indexable) {
  rules.push("# Demo / not-yet-live: keep search engines out");
  rules.push('Header always set X-Robots-Tag "noindex, nofollow"');
}
rules.push('<FilesMatch "\\.(html|txt|xml|webmanifest)$">');
rules.push('  Header set Cache-Control "public, max-age=0, must-revalidate"');
rules.push("</FilesMatch>");
rules.push('<FilesMatch "\\.(png|jpe?g|webp|avif|svg|ico|woff2?)$">');
rules.push('  Header set Cache-Control "public, max-age=2592000"');
rules.push("</FilesMatch>");
rules.push('SetEnvIf Request_URI "^/_next/static/" next_static=1');
rules.push('Header set Cache-Control "public, max-age=31536000, immutable" env=next_static');
rules.push("</IfModule>");
rules.push("");
rules.push("<IfModule mod_deflate.c>");
rules.push(
  "AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml application/xml application/javascript text/javascript application/json image/svg+xml application/manifest+json",
);
rules.push("</IfModule>");
rules.push("");
rules.push('<FilesMatch "^contact-config\\.php$">');
rules.push("  Require all denied");
rules.push("</FilesMatch>");
writeFileSync(path.join(outDir, ".htaccess"), rules.join("\n") + "\n");

/* -------------------------------------------------------------- 6. report */
function size(dir: string): number {
  let total = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? size(p) : statSync(p).size;
  }
  return total;
}
rmSync(tmp, { recursive: true, force: true });
console.log(`
✔ Static site ready: dist-static/  (${(size(outDir) / 1024 / 1024).toFixed(1)} MB)
  Mode:        ${policy.indexable ? "LIVE (indexable) → " + policy.canonicalOrigin : "DEMO (hidden from search engines)"}
  Form emails: ${to}${resendKey ? " via Resend" : " via the server's mail()"}
  Upload the CONTENTS of dist-static/ (including .htaccess) to public_html.
  Preview locally: npm run preview:static
`);
