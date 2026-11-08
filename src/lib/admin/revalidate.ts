import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import { servicePagesForCategory, servicePathForCategory } from "@/config/services";
import type { ProjectServiceCategory, PropertyType } from "@/config/services";
import { PROJECTS_TAG, projectTag } from "@/lib/cms/public";

/**
 * Refreshes every public surface that shows projects after a publish,
 * unpublish or delete. Must run inside a Server Action (updateTag gives
 * read-your-own-writes: the next request waits for fresh data).
 *
 * Route patterns are passed both with and without the (site) route group:
 * Next derives a page's implicit tags from its file path (which includes the
 * group), while literal paths match the URL.
 */
export function refreshPublicProject(
  slug: string | null,
  service: ProjectServiceCategory | null,
  propertyType: PropertyType | null,
): void {
  updateTag(PROJECTS_TAG);
  if (slug) updateTag(projectTag(slug));

  const literal = new Set<string>(["/", "/our-work", "/commercial", "/service-area", "/sitemap.xml", "/llms.txt"]);
  if (slug) {
    literal.add(`/our-work/${slug}`);
    literal.add(`/our-work/${slug}/opengraph-image`);
  }
  literal.add(servicePathForCategory(service, propertyType).href);
  for (const s of servicePagesForCategory(service)) literal.add(`/services/${s}`);
  for (const path of literal) revalidatePath(path);

  for (const pattern of [
    "/our-work/[slug]",
    "/(site)/our-work/[slug]",
    "/our-work/page/[page]",
    "/(site)/our-work/page/[page]",
    "/services/[service]",
    "/(site)/services/[service]",
  ]) {
    revalidatePath(pattern, "page");
  }

  // The footer and other shared chrome list projects: refresh from the root layout.
  revalidatePath("/", "layout");
}
