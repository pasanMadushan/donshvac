import type { ProjectServiceCategory, PropertyType } from "@/config/services";

export interface MediaVariant {
  /** Pixel width of this derivative. */
  w: number;
  h: number;
  /** Object path inside the bucket. */
  path: string;
}

export interface ProjectImage {
  id: string;
  /** Largest derivative URL. */
  src: string;
  /** "url 480w, url 960w, …" */
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  isCover: boolean;
}

export interface PublicProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  city: string | null;
  service: ProjectServiceCategory | null;
  propertyType: PropertyType | null;
  featured: boolean;
  images: ProjectImage[];
  cover: ProjectImage | null;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Share image chosen in advanced settings, else the cover. */
  shareImage: ProjectImage | null;
  /** ISO — first publication of the project. */
  publishedAt: string | null;
  /** ISO — publication of the current revision (meaningful modification). */
  modifiedAt: string | null;
  source: "cms" | "seed";
}

/** Draft shape used by admin preview (same rendering as public). */
export type PreviewProject = PublicProject & { isPreview: true };
