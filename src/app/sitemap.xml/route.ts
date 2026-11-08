import { sitePolicy } from "@/config/site";
import { buildSitemapXml } from "@/lib/discovery/sitemap";
import { listIndexableUrls } from "@/lib/discovery/urls";

// Prerendered: reads only sitePolicy and cached CMS functions (tag
// "projects"), so it refreshes when a project is published or unpublished.
export async function GET() {
  if (!sitePolicy.indexable || !sitePolicy.canonicalOrigin) {
    // The demo never advertises a sitemap.
    return new Response("Not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const xml = buildSitemapXml(sitePolicy.canonicalOrigin, await listIndexableUrls());
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
