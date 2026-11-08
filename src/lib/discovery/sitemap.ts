import type { IndexableUrl } from "./urls";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** W3C datetime: keep full timestamps (as UTC), pass plain dates through. */
function w3cDate(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

export function buildSitemapXml(origin: string, urls: IndexableUrl[]): string {
  const base = origin.replace(/\/+$/, "");
  const entries = urls.map(({ path, lastmod }) => {
    const loc = path === "/" ? `${base}/` : `${base}${path}`;
    const mod = lastmod ? w3cDate(lastmod) : null;
    return [
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      ...(mod ? [`    <lastmod>${escapeXml(mod)}</lastmod>`] : []),
      "  </url>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}
