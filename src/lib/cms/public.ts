import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  PROJECT_SERVICE_CATEGORIES,
  PROPERTY_TYPES,
  servicePagesForCategory,
  type ProjectServiceCategory,
  type PropertyType,
  type ServiceSlug,
} from "@/config/services";
import { seedProjects } from "@/content/projects.seed";
import { projectCoverFallbacks } from "@/content/static-images";
import { createPublicClient } from "@/lib/supabase/public";
import { publicMediaUrl } from "@/lib/supabase/env";
import type { MediaVariant, ProjectImage, PublicProject } from "./types";

/**
 * Public, cached read layer for published projects. Every public page reads
 * projects through these functions so a single `updateTag(PROJECTS_TAG)` on
 * publish/unpublish refreshes home, portfolio, project, service, service-area,
 * sitemap, llms.txt and share images together.
 */
export const PROJECTS_TAG = "projects";
export const projectTag = (slug: string) => `project:${slug}`;
export const PORTFOLIO_PAGE_SIZE = 12;

interface RawImage {
  id: string;
  alt: string | null;
  is_cover: boolean;
  width: number | null;
  height: number | null;
  variants: MediaVariant[] | null;
}
interface RawProject {
  id: string;
  slug: string;
  first_published_at: string | null;
  revision_published_at: string | null;
  title: string;
  summary: string;
  city: string | null;
  service: string | null;
  property_type: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  share_image_media_id: string | null;
  images: RawImage[];
}

export function toImage(raw: RawImage, urlFor: (path: string) => string = publicMediaUrl): ProjectImage | null {
  const variants = (raw.variants ?? []).filter((v) => v && v.path && v.w > 0).sort((a, b) => a.w - b.w);
  if (!variants.length) return null;
  const largest = variants[variants.length - 1];
  return {
    id: raw.id,
    src: urlFor(largest.path),
    srcSet: variants.map((v) => `${urlFor(v.path)} ${v.w}w`).join(", "),
    width: largest.w,
    height: largest.h,
    alt: raw.alt ?? "",
    isCover: raw.is_cover,
  };
}

function asCategory(v: string | null): ProjectServiceCategory | null {
  return (PROJECT_SERVICE_CATEGORIES as readonly string[]).includes(v ?? "") ? (v as ProjectServiceCategory) : null;
}
function asPropertyType(v: string | null): PropertyType | null {
  return (PROPERTY_TYPES as readonly string[]).includes(v ?? "") ? (v as PropertyType) : null;
}

export function mapRawProject(raw: RawProject, urlFor?: (path: string) => string): PublicProject {
  const images = raw.images.map((i) => toImage(i, urlFor)).filter((i): i is ProjectImage => i !== null);
  const cover = images.find((i) => i.isCover) ?? images[0] ?? projectCoverFallbacks[raw.slug] ?? null;
  const shareImage = (raw.share_image_media_id && images.find((i) => i.id === raw.share_image_media_id)) || cover;
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary,
    city: raw.city,
    service: asCategory(raw.service),
    propertyType: asPropertyType(raw.property_type),
    featured: raw.featured,
    images,
    cover,
    seoTitle: raw.seo_title,
    seoDescription: raw.seo_description,
    shareImage,
    publishedAt: raw.first_published_at,
    modifiedAt: raw.revision_published_at ?? raw.first_published_at,
    source: "cms",
  };
}

function seedFallback(): PublicProject[] {
  return [...seedProjects]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      id: `seed:${s.seedKey}`,
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      city: s.city,
      service: s.service,
      propertyType: s.propertyType,
      featured: s.featured,
      images: [],
      cover: projectCoverFallbacks[s.slug] ?? null,
      seoTitle: null,
      seoDescription: null,
      shareImage: null,
      publishedAt: null,
      modifiedAt: null,
      source: "seed" as const,
    }));
}

/** All published projects in display order. */
export async function getPublishedProjects(): Promise<PublicProject[]> {
  "use cache";
  cacheTag(PROJECTS_TAG);
  cacheLife("max");

  const client = createPublicClient();
  if (!client) {
    // No CMS configured (zero-config local run): show the documented projects
    // from the typed seed, read-only.
    return seedFallback();
  }
  const { data, error } = await client.rpc("get_published_projects");
  if (error) {
    // Fail the render (and keep the last good cached page) rather than
    // publishing an empty portfolio.
    throw new Error(`Could not load published projects (${error.code ?? "unknown"})`);
  }
  return ((data ?? []) as RawProject[]).map((r) => mapRawProject(r));
}

export async function getProjectBySlug(slug: string): Promise<PublicProject | null> {
  "use cache";
  cacheTag(PROJECTS_TAG, projectTag(slug));
  cacheLife("max");
  const all = await getPublishedProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(limit = 3): Promise<PublicProject[]> {
  const all = await getPublishedProjects();
  const featured = all.filter((p) => p.featured);
  const rest = all.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export async function getProjectsForService(slug: ServiceSlug, limit = 6): Promise<PublicProject[]> {
  const all = await getPublishedProjects();
  return all.filter((p) => servicePagesForCategory(p.service).includes(slug)).slice(0, limit);
}

export async function getCommercialProjects(): Promise<PublicProject[]> {
  const all = await getPublishedProjects();
  return all.filter((p) => p.propertyType === "commercial");
}

export async function getPortfolioPage(page: number) {
  const all = await getPublishedProjects();
  const totalPages = Math.max(1, Math.ceil(all.length / PORTFOLIO_PAGE_SIZE));
  const start = (page - 1) * PORTFOLIO_PAGE_SIZE;
  return { projects: all.slice(start, start + PORTFOLIO_PAGE_SIZE), page, totalPages, total: all.length };
}

/** Distinct documented project locations, for /service-area. */
export async function getDocumentedLocations(): Promise<Array<{ city: string; projects: PublicProject[] }>> {
  const all = await getPublishedProjects();
  const byCity = new Map<string, PublicProject[]>();
  for (const p of all) {
    if (!p.city) continue;
    byCity.set(p.city, [...(byCity.get(p.city) ?? []), p]);
  }
  return [...byCity.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "en-CA"))
    .map(([city, projects]) => ({ city, projects }));
}
