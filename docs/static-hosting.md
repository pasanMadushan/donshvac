# Static hosting (shared Apache/LiteSpeed + PHP)

`npm run build:static` builds a plain-files copy of the site into `dist-static/`.
The admin area, CMS and Server Actions stay in the codebase and keep working
with the normal `npm run build` / `npm start` (or Vercel) — the static build
runs in a temporary copy and never changes your working tree.

## Build

1. `cp .env.static.example .env.static` and fill in what you need (all optional for a first test).
2. `npm run build:static`
3. Optional local check (needs PHP): `npm run preview:static` → http://127.0.0.1:4000

## Upload

Upload the **contents** of `dist-static/` (including the hidden `.htaccess`) to `public_html`.
Re-upload everything after each build. `contact-config.php` is regenerated each build:
if you edit it on the server (e.g. a Resend key), either keep a copy or put the same
values in `.env.static` so every build produces the right file.

## What differs from the server build

| | Server build | Static build |
|---|---|---|
| Contact form | Server Action + Resend | `contact.php` (Resend API or `mail()`), no page redirect |
| Admin / CMS | yes | not included (seed projects are used) |
| Redirects, security headers, noindex | `proxy.ts` / `next.config.ts` | generated `.htaccess` |
| Image optimiser | Next.js | off (photos are pre-resized WebP, see `scripts/optimise-static-images.ts`) |

## Going live

Set in `.env.static`: `SITE_MODE=live`, `SITE_CANONICAL_ORIGIN=https://www.<domain>`,
`SITE_REDIRECT_HOSTS=<domain>`, `CONTACT_TO=<Don's inbox>`,
`CONTACT_FROM="Don's HVAC website <inquiries@<domain>>"` (a real mailbox on the domain
gives the best deliverability). Rebuild and upload. For Resend, verify the domain there
and set `CONTACT_RESEND_API_KEY`; otherwise the host's `mail()` is used.

## Moving back to a server later

Nothing to undo: deploy the repo normally (Vercel/Node), configure Supabase + Resend
as in `.env.example`, and the admin/CMS and server-side form are all there.
