import type { Metadata } from "next";
import { business } from "@/config/business";
import { NOINDEX_HEADER_VALUE, canonicalUrl, sitePolicy } from "@/config/site";

export const SITE_NAME = business.displayName;

/** Robots metadata that always matches the proxy's X-Robots-Tag policy. */
export function robotsMeta(forceNoindex = false): Metadata["robots"] {
  if (!sitePolicy.indexable || forceNoindex) {
    return { index: false, follow: false, googleBot: { index: false, follow: false } };
  }
  return { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } };
}
export { NOINDEX_HEADER_VALUE };

export interface PageMetaInput {
  /** Page title WITHOUT the site name (the layout template appends it). */
  title: string;
  /** Use the title verbatim (home page). */
  absoluteTitle?: boolean;
  description: string;
  /** Clean site-relative path, e.g. "/services/furnaces". */
  path: string;
  /** Absolute or site-relative share image; defaults to the route's opengraph-image. */
  image?: { url: string; width?: number; height?: number; alt: string };
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noindex?: boolean;
}

/**
 * One builder for every public page: unique title/description, canonical
 * (live only, from trusted config — never from the request), Open Graph and
 * Twitter cards. Query strings are never part of the canonical.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const canonical = canonicalUrl(input.path);
  const title = input.absoluteTitle ? { absolute: input.title } : input.title;
  const ogTitle = input.absoluteTitle ? input.title : `${input.title} | ${SITE_NAME}`;
  return {
    title,
    description: input.description,
    alternates: canonical ? { canonical } : undefined,
    robots: robotsMeta(input.noindex),
    openGraph: {
      type: input.type ?? "website",
      siteName: SITE_NAME,
      locale: "en_CA",
      title: ogTitle,
      description: input.description,
      ...(canonical ? { url: canonical } : {}),
      ...(input.image ? { images: [input.image] } : {}),
      ...(input.type === "article" && input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.type === "article" && input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
      ...(input.image ? { images: [input.image.url] } : {}),
    },
  };
}

/** Trim to a sentence boundary for meta descriptions. */
export function toDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return stop > 80 ? cut.slice(0, stop + 1) : `${cut.replace(/\s+\S*$/, "")}…`;
}
