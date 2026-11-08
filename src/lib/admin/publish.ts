import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PROJECT_SERVICE_CATEGORIES, PROPERTY_TYPES } from "@/config/services";
import type { ProjectServiceCategory, PropertyType } from "@/config/services";
import type { MediaVariant } from "@/lib/cms/types";
import { PUBLIC_CACHE_SECONDS } from "@/lib/media/limits";
import { publicVariantPath } from "@/lib/media/paths";
import { PRIVATE_MEDIA_BUCKET, PUBLIC_MEDIA_BUCKET } from "@/lib/supabase/env";
import { AdminDataError, getGallery, getProject, getRevision, type GalleryRow } from "./data";
import { friendlyDbError, logAdminError } from "./errors";
import type { ParsedSavePayload } from "./schemas";
import { refreshPublicProject } from "./revalidate";
import type { ActionResult, FieldErrors } from "./types";

/**
 * CMS write side. Every function receives the USER client from
 * requireOwnerAction(), so database RLS and storage policies (is_owner)
 * apply to every read, write, copy and delete. The service-role client is
 * never used here.
 */
type Client = SupabaseClient;

// ---------------------------------------------------------------- save

/** Saves fields + the complete ordered gallery into the draft revision. Returns the draft revision id. */
export async function saveDraft(supabase: Client, projectId: string, payload: ParsedSavePayload): Promise<string> {
  const { fields } = payload;
  const galleryIds = new Set(payload.gallery.map((g) => g.mediaId));
  const shareImage = fields.shareImageMediaId && galleryIds.has(fields.shareImageMediaId) ? fields.shareImageMediaId : "";
  const hasCover = payload.gallery.some((g) => g.isCover);
  const gallery = payload.gallery.map((g, i) => ({
    media_id: g.mediaId,
    alt: g.alt,
    is_cover: hasCover ? g.isCover : i === 0,
  }));
  const { data, error } = await supabase.rpc("save_project_draft", {
    p_project_id: projectId,
    p_fields: {
      title: fields.title,
      summary: fields.summary,
      city: fields.city,
      service: fields.service,
      property_type: fields.propertyType,
      featured: fields.featured,
      seo_title: fields.seoTitle,
      seo_description: fields.seoDescription,
      share_image_media_id: shareImage,
    },
    p_gallery: gallery,
  });
  if (error) throw new AdminDataError("save draft", error);
  return data as string;
}

// ---------------------------------------------------------------- public copies

function isAlreadyExists(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { statusCode?: string | number; status?: number; message?: string; error?: string };
  return (
    String(e.statusCode ?? "") === "409" ||
    e.status === 409 ||
    /already exists|duplicate/i.test(`${e.message ?? ""} ${e.error ?? ""}`)
  );
}

/** Copies one private derivative to the public bucket. Existing destination = success. */
async function copyToPublic(supabase: Client, from: string, to: string): Promise<void> {
  const copied = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).copy(from, to, { destinationBucket: PUBLIC_MEDIA_BUCKET });
  if (!copied.error || isAlreadyExists(copied.error)) return;

  // Cross-bucket copy unsupported or failed: download and upload (upsert).
  const downloaded = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).download(from);
  if (downloaded.error || !downloaded.data) throw new AdminDataError("download derivative", downloaded.error);
  const body = Buffer.from(await downloaded.data.arrayBuffer());
  const uploaded = await supabase.storage.from(PUBLIC_MEDIA_BUCKET).upload(to, body, {
    contentType: "image/webp",
    cacheControl: PUBLIC_CACHE_SECONDS,
    upsert: true,
  });
  if (uploaded.error && !isAlreadyExists(uploaded.error)) throw new AdminDataError("upload public copy", uploaded.error);
}

function sameVariants(a: MediaVariant[] | null, b: MediaVariant[]): boolean {
  if (!a || a.length !== b.length) return false;
  return a.every((v, i) => v.path === b[i].path && v.w === b[i].w && v.h === b[i].h);
}

/** Ensures every derivative of a gallery photo exists publicly and records public_variants. */
async function publishPhoto(supabase: Client, row: GalleryRow): Promise<void> {
  const media = row.media;
  if (!media || !media.variants?.length) throw new AdminDataError("photo not ready", null);
  const publicVariants: MediaVariant[] = [];
  for (const v of [...media.variants].sort((a, b) => a.w - b.w)) {
    const dest = publicVariantPath(media.id, media.file_stem || "project-photo", v.w);
    // Always (re)copy: cheap when it already exists, and repairs a copy that
    // an earlier cleanup removed.
    await copyToPublic(supabase, v.path, dest);
    publicVariants.push({ w: v.w, h: v.h, path: dest });
  }
  if (!sameVariants(media.public_variants, publicVariants)) {
    const { error } = await supabase
      .from("project_media")
      .update({ public_variants: publicVariants })
      .eq("id", media.id)
      .eq("project_id", media.project_id);
    if (error) throw new AdminDataError("record public variants", error);
  }
}

/**
 * Removes public copies no published revision references (best effort).
 * Objects are removed before public_variants is cleared, so a failure is
 * simply retried on the next publish/unpublish.
 */
export async function cleanupOrphanedPublicMedia(supabase: Client, projectId: string): Promise<void> {
  try {
    const { data, error } = await supabase.rpc("orphaned_public_media", { p_project_id: projectId });
    if (error) {
      logAdminError("list orphaned public media", error);
      return;
    }
    for (const row of (data ?? []) as Array<{ media_id: string; public_variants: MediaVariant[] | null }>) {
      const paths = (row.public_variants ?? []).map((v) => v.path).filter((p) => p && p.startsWith("p/"));
      if (paths.length) {
        const removed = await supabase.storage.from(PUBLIC_MEDIA_BUCKET).remove(paths);
        if (removed.error) {
          logAdminError("remove public media", removed.error);
          continue;
        }
      }
      const { error: updError } = await supabase
        .from("project_media")
        .update({ public_variants: null })
        .eq("id", row.media_id)
        .eq("project_id", projectId);
      if (updError) logAdminError("clear public variants", updError);
    }
  } catch (err) {
    logAdminError("cleanup public media", err);
  }
}

// ---------------------------------------------------------------- validation

function validateForPublish(title: string, gallery: GalleryRow[]): FieldErrors | null {
  const errors: FieldErrors = {};
  if (title.trim().length < 3) errors["fields.title"] = "Add a title of at least 3 characters before publishing.";
  for (const g of gallery) {
    if (!g.media || g.media.status !== "ready" || !g.media.variants?.length) {
      errors[`gallery.${g.media_id}`] = "This photo is not ready. Wait for it to finish or remove it.";
    }
    if (!g.alt.trim()) {
      errors[`gallery.${g.media_id}.alt`] = "Describe this photo before publishing.";
    }
  }
  return Object.keys(errors).length ? errors : null;
}

function asCategory(v: string | null): ProjectServiceCategory | null {
  return (PROJECT_SERVICE_CATEGORIES as readonly string[]).includes(v ?? "") ? (v as ProjectServiceCategory) : null;
}
function asPropertyType(v: string | null): PropertyType | null {
  return (PROPERTY_TYPES as readonly string[]).includes(v ?? "") ? (v as PropertyType) : null;
}

function toFailure(context: string, err: unknown) {
  return err instanceof AdminDataError ? friendlyDbError(err.context, err.cause) : friendlyDbError(context, err);
}

// ---------------------------------------------------------------- publish

export interface PublishOutcome {
  slug: string;
}

/**
 * Save → ensure draft → validate → copy public derivatives → atomic
 * publish_project RPC → revalidate → cleanup. Retrying after any failure is
 * safe: copies are idempotent and the RPC is idempotent for the same revision.
 */
export async function publishProject(
  supabase: Client,
  projectId: string,
  payload: ParsedSavePayload,
): Promise<ActionResult<PublishOutcome>> {
  let revisionId: string;
  let gallery: GalleryRow[];
  let service: ProjectServiceCategory | null = null;
  let propertyType: PropertyType | null = null;

  try {
    await saveDraft(supabase, projectId, payload);
    const { data: rid, error: ensureError } = await supabase.rpc("ensure_draft_revision", { p_project_id: projectId });
    if (ensureError) throw new AdminDataError("ensure draft", ensureError);
    revisionId = rid as string;

    const revision = await getRevision(supabase, revisionId);
    if (!revision || revision.project_id !== projectId) {
      return { ok: false, code: "not-found", message: "This project could not be found. Reload the page." };
    }
    gallery = await getGallery(supabase, revisionId);
    service = asCategory(revision.service);
    propertyType = asPropertyType(revision.property_type);

    const problems = validateForPublish(revision.title, gallery);
    if (problems) {
      return {
        ok: false,
        code: "needs-fixes",
        message: "Your changes are saved as a draft, but a few things need fixing before this can go live.",
        fieldErrors: problems,
      };
    }
  } catch (err) {
    return toFailure("publish (prepare)", err);
  }

  // Copy derivatives to the public bucket. On failure, roll back copies that
  // the live revision does not use, so draft photos never stay public.
  try {
    for (const row of gallery) await publishPhoto(supabase, row);
  } catch (err) {
    await cleanupOrphanedPublicMedia(supabase, projectId);
    const failure = toFailure("publish (copy photos)", err);
    return {
      ...failure,
      message: "The photos could not be prepared for the public site. Nothing was published; your draft is saved. Try Publish again.",
    };
  }

  let slug: string;
  try {
    const { data, error } = await supabase.rpc("publish_project", {
      p_project_id: projectId,
      p_revision_id: revisionId,
    });
    if (error) throw new AdminDataError("publish project", error);
    const row = (Array.isArray(data) ? data[0] : data) as { slug: string | null } | null;
    if (!row?.slug) throw new AdminDataError("publish project", { code: "no-slug" });
    slug = row.slug;
  } catch (err) {
    await cleanupOrphanedPublicMedia(supabase, projectId);
    return toFailure("publish (rpc)", err);
  }

  try {
    refreshPublicProject(slug, service, propertyType);
  } catch (err) {
    logAdminError("revalidate after publish", err);
  }
  await cleanupOrphanedPublicMedia(supabase, projectId);
  return { ok: true, data: { slug } };
}

// ---------------------------------------------------------------- unpublish / delete

async function liveContext(supabase: Client, projectId: string) {
  const project = await getProject(supabase, projectId);
  if (!project) return null;
  const live = project.published_revision_id ? await getRevision(supabase, project.published_revision_id) : null;
  return {
    project,
    service: asCategory(live?.service ?? null),
    propertyType: asPropertyType(live?.property_type ?? null),
  };
}

export async function unpublishProject(supabase: Client, projectId: string): Promise<ActionResult<{ slug: string | null }>> {
  try {
    const ctx = await liveContext(supabase, projectId);
    if (!ctx) return { ok: false, code: "not-found", message: "This project could not be found. Reload the page." };
    const { data, error } = await supabase.rpc("unpublish_project", { p_project_id: projectId });
    if (error) throw new AdminDataError("unpublish project", error);
    const slug = (data as string | null) ?? ctx.project.slug;
    try {
      refreshPublicProject(slug, ctx.service, ctx.propertyType);
    } catch (err) {
      logAdminError("revalidate after unpublish", err);
    }
    await cleanupOrphanedPublicMedia(supabase, projectId);
    return { ok: true, data: { slug } };
  } catch (err) {
    return toFailure("unpublish", err);
  }
}

export async function deleteProject(supabase: Client, projectId: string): Promise<ActionResult> {
  try {
    const ctx = await liveContext(supabase, projectId);
    if (!ctx) return { ok: false, code: "not-found", message: "This project could not be found. It may already be deleted." };
    const { error } = await supabase.rpc("delete_project", { p_project_id: projectId });
    if (error) throw new AdminDataError("delete project", error);
    if (ctx.project.status === "published") {
      try {
        refreshPublicProject(ctx.project.slug, ctx.service, ctx.propertyType);
      } catch (err) {
        logAdminError("revalidate after delete", err);
      }
    }
    await cleanupOrphanedPublicMedia(supabase, projectId);
    return { ok: true, data: null };
  } catch (err) {
    return toFailure("delete", err);
  }
}
