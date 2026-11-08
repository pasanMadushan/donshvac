import "server-only";
import { SERVICE_SLUGS } from "@/config/services";
import {
  getCommercialProjects,
  getFeaturedProjects,
  getPortfolioPage,
  getProjectsForService,
  getPublishedProjects,
} from "@/lib/cms/public";
import type { PublicProject } from "@/lib/cms/types";
import { CONTENT_UPDATED, latestDate } from "./content-dates";

export interface IndexableUrl {
  /** Clean site-relative path (no trailing slash, no query). */
  path: string;
  /** ISO date or timestamp of the last meaningful change; null if unknown. */
  lastmod: string | null;
}

/** Number of projects the home page features (keep in sync with the home page). */
export const HOME_FEATURED_COUNT = 3;
/** Number of projects each service page lists (getProjectsForService default). */
export const SERVICE_PAGE_PROJECT_COUNT = 6;

/** Static, always-indexable public pages that do not list projects. */
export const STATIC_INDEXABLE_PATHS = ["/about", "/contact", "/privacy"] as const;

function withProjects(projects: PublicProject[]): string {
  return latestDate(CONTENT_UPDATED, ...projects.map((p) => p.modifiedAt)) ?? CONTENT_UPDATED;
}

/**
 * THE single source of truth for which public paths are indexable. Used by
 * sitemap.xml and the SEO audit. Reads only cached CMS functions, so it
 * refreshes when the "projects" tag is updated on publish/unpublish.
 *
 * This list does not depend on site mode; callers decide whether to expose
 * it (sitemap.xml is 404 in demo).
 */
export async function listIndexableUrls(): Promise<IndexableUrl[]> {
  const all = await getPublishedProjects();
  const [featured, commercial, firstPage] = await Promise.all([
    getFeaturedProjects(HOME_FEATURED_COUNT),
    getCommercialProjects(),
    getPortfolioPage(1),
  ]);
  const servicePages = await Promise.all(
    SERVICE_SLUGS.map(async (slug) => ({
      slug,
      projects: await getProjectsForService(slug, SERVICE_PAGE_PROJECT_COUNT),
    })),
  );

  const urls: IndexableUrl[] = [
    { path: "/", lastmod: withProjects(featured) },
    { path: "/services", lastmod: withProjects(servicePages.flatMap((s) => s.projects)) },
    ...servicePages.map((s) => ({ path: `/services/${s.slug}`, lastmod: withProjects(s.projects) })),
    { path: "/commercial", lastmod: withProjects(commercial) },
    { path: "/our-work", lastmod: withProjects(firstPage.projects) },
  ];

  for (let page = 2; page <= firstPage.totalPages; page++) {
    const { projects } = await getPortfolioPage(page);
    urls.push({ path: `/our-work/page/${page}`, lastmod: withProjects(projects) });
  }

  for (const p of all) {
    // Seed projects carry no publication dates; they date from the content set.
    urls.push({
      path: `/our-work/${p.slug}`,
      lastmod: p.modifiedAt ?? (p.source === "seed" ? CONTENT_UPDATED : null),
    });
  }

  urls.push({ path: "/about", lastmod: CONTENT_UPDATED });
  // The service area page lists documented locations from every project.
  urls.push({ path: "/service-area", lastmod: withProjects(all) });
  urls.push({ path: "/contact", lastmod: CONTENT_UPDATED });
  urls.push({ path: "/privacy", lastmod: CONTENT_UPDATED });

  return urls;
}
