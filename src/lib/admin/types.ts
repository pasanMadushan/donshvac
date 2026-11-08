import type { ProjectServiceCategory, PropertyType } from "@/config/services";

/** Client-safe shapes shared by admin server code and the editor. */

export type ProjectStatus = "draft" | "published" | "unpublished" | "deleted";

export type StatusKey = "draft" | "published" | "unpublished" | "published-changes";

export const STATUS_LABELS: Record<StatusKey, string> = {
  draft: "Draft",
  published: "Published",
  unpublished: "Unpublished",
  "published-changes": "Published with unpublished changes",
};

export interface EditorFields {
  title: string;
  summary: string;
  city: string;
  service: ProjectServiceCategory | "";
  propertyType: PropertyType | "";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  shareImageMediaId: string;
}

export interface EditorPhoto {
  mediaId: string;
  alt: string;
  isCover: boolean;
  width: number | null;
  height: number | null;
  /** Short-lived signed URL of the private 480 px derivative. */
  thumbUrl: string | null;
}

export interface EditorProject {
  id: string;
  slug: string | null;
  statusKey: StatusKey;
  updatedAt: string;
  fields: EditorFields;
  gallery: EditorPhoto[];
  /** Ready photos of this project that are not in the current gallery. */
  unattached: EditorPhoto[];
}

export interface AdminProjectRow {
  id: string;
  title: string;
  slug: string | null;
  statusKey: StatusKey;
  updatedAt: string;
}

export type FieldErrors = Partial<Record<string, string>>;

export interface ActionFailure {
  ok: false;
  message: string;
  fieldErrors?: FieldErrors;
  /** Stable machine code for client handling, e.g. "stale", "rejected". */
  code?: string;
}

export type ActionResult<T = null> = { ok: true; data: T } | ActionFailure;

export interface SavePayload {
  fields: EditorFields;
  gallery: Array<{ mediaId: string; alt: string; isCover: boolean }>;
}

export interface UploadTarget {
  mediaId: string;
  signedUrl: string;
  /** Publishable (public) key the storage gateway expects alongside the token. */
  apiKey: string;
}

export interface FinalizedPhoto {
  mediaId: string;
  width: number;
  height: number;
  thumbUrl: string | null;
}
