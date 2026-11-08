import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MediaVariant } from "@/lib/cms/types";
import { PUBLIC_CACHE_SECONDS } from "@/lib/media/limits";
import { originalPath, variantPath } from "@/lib/media/paths";
import { inspectPhoto, makeDerivatives, PhotoRejectedError } from "@/lib/media/process";
import { PRIVATE_MEDIA_BUCKET, supabasePublicEnv } from "@/lib/supabase/env";
import { AdminDataError, getProject, getRevision, MEDIA_COLUMNS, signedThumb, type MediaRow } from "./data";
import { friendlyDbError, logAdminError } from "./errors";
import { fileStemFor } from "./slug";
import type { ActionResult, FinalizedPhoto, UploadTarget } from "./types";

/**
 * Photo upload pipeline (user client only; storage policies require is_owner):
 *   1. createUploadTarget: pending project_media row + signed upload URL for
 *      the PRIVATE bucket. The browser uploads directly to storage.
 *   2. finalizeUpload: download the original, validate the real content with
 *      sharp, write private WebP derivatives, mark the photo ready.
 */
type Client = SupabaseClient;

const MAX_PENDING_PER_PROJECT = 24;
const MAX_MEDIA_PER_PROJECT = 300;

export async function createUploadTarget(
  supabase: Client,
  projectId: string,
  input: { name: string; size: number; type: string; titleHint?: string },
): Promise<ActionResult<UploadTarget>> {
  try {
    const env = supabasePublicEnv();
    if (!env) return { ok: false, code: "unavailable", message: "Photo uploads are not set up yet." };
    const project = await getProject(supabase, projectId);
    if (!project) return { ok: false, code: "not-found", message: "This project could not be found. Reload the page." };

    const [{ count: pending, error: pendingError }, { count: total, error: totalError }] = await Promise.all([
      supabase.from("project_media").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("status", "pending"),
      supabase.from("project_media").select("id", { count: "exact", head: true }).eq("project_id", projectId),
    ]);
    if (pendingError) throw new AdminDataError("count pending media", pendingError);
    if (totalError) throw new AdminDataError("count media", totalError);
    if ((pending ?? 0) >= MAX_PENDING_PER_PROJECT) {
      return { ok: false, code: "limit", message: "Too many uploads are unfinished. Wait for them to finish or remove them, then try again." };
    }
    if ((total ?? 0) >= MAX_MEDIA_PER_PROJECT) {
      return { ok: false, code: "limit", message: "This project has reached its photo storage limit. Ask the site operator for help." };
    }

    let stemSource = input.titleHint?.trim() ?? "";
    if (!stemSource) {
      const revId = project.draft_revision_id ?? project.published_revision_id;
      stemSource = revId ? ((await getRevision(supabase, revId))?.title ?? "") : "";
    }

    const mediaId = crypto.randomUUID();
    const path = originalPath(projectId, mediaId);
    const { error: insertError } = await supabase.from("project_media").insert({
      id: mediaId,
      project_id: projectId,
      status: "pending",
      original_path: path,
      original_name: input.name || null,
      declared_type: input.type,
      declared_bytes: input.size,
      file_stem: fileStemFor(stemSource),
    });
    if (insertError) throw new AdminDataError("create media", insertError);

    const { data, error } = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      await supabase.from("project_media").delete().eq("id", mediaId).eq("status", "pending");
      throw new AdminDataError("signed upload url", error);
    }
    return { ok: true, data: { mediaId, signedUrl: data.signedUrl, apiKey: env.key } };
  } catch (err) {
    return err instanceof AdminDataError ? friendlyDbError(err.context, err.cause) : friendlyDbError("upload target", err);
  }
}

async function getMedia(supabase: Client, mediaId: string) {
  const { data, error } = await supabase
    .from("project_media")
    .select(`${MEDIA_COLUMNS}, original_path`)
    .eq("id", mediaId)
    .maybeSingle();
  if (error) throw new AdminDataError("get media", error);
  return (data as (MediaRow & { original_path: string }) | null) ?? null;
}

async function markFailed(supabase: Client, media: MediaRow & { original_path: string }, message: string) {
  const removed = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).remove([media.original_path]);
  if (removed.error) logAdminError("remove rejected original", removed.error);
  const { error } = await supabase
    .from("project_media")
    .update({ status: "failed", error: message.slice(0, 300), variants: null })
    .eq("id", media.id);
  if (error) logAdminError("mark media failed", error);
}

export async function finalizeUpload(supabase: Client, mediaId: string): Promise<ActionResult<FinalizedPhoto>> {
  try {
    const media = await getMedia(supabase, mediaId);
    if (!media) return { ok: false, code: "not-found", message: "This photo could not be found. Remove it and upload it again." };
    if (media.status === "ready" && media.variants?.length && media.width && media.height) {
      return {
        ok: true,
        data: { mediaId, width: media.width, height: media.height, thumbUrl: await signedThumb(supabase, media.variants) },
      };
    }
    if (media.status === "failed") {
      return { ok: false, code: "rejected", message: "This photo was not accepted. Remove it and choose another photo." };
    }

    const downloaded = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).download(media.original_path);
    if (downloaded.error || !downloaded.data) {
      return { ok: false, code: "upload-missing", message: "The upload did not finish. Retry to upload it again." };
    }
    const input = Buffer.from(await downloaded.data.arrayBuffer());

    let inspected;
    let derivatives;
    try {
      inspected = await inspectPhoto(input);
      derivatives = await makeDerivatives(input);
    } catch (err) {
      if (err instanceof PhotoRejectedError) {
        await markFailed(supabase, media, err.userMessage);
        return { ok: false, code: "rejected", message: err.userMessage };
      }
      throw err;
    }

    const variants: MediaVariant[] = [];
    for (const d of derivatives) {
      const path = variantPath(media.project_id, media.id, d.width);
      const { error } = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).upload(path, d.buffer, {
        contentType: "image/webp",
        cacheControl: PUBLIC_CACHE_SECONDS,
        upsert: true,
      });
      if (error) throw new AdminDataError("store derivative", error);
      variants.push({ w: d.width, h: d.height, path });
    }

    const { error: updateError } = await supabase
      .from("project_media")
      .update({
        status: "ready",
        mime: inspected.mime,
        bytes: inspected.bytes,
        width: inspected.width,
        height: inspected.height,
        variants,
        error: null,
      })
      .eq("id", media.id);
    if (updateError) throw new AdminDataError("mark media ready", updateError);

    return {
      ok: true,
      data: { mediaId, width: inspected.width, height: inspected.height, thumbUrl: await signedThumb(supabase, variants) },
    };
  } catch (err) {
    const failure =
      err instanceof AdminDataError ? friendlyDbError(err.context, err.cause) : friendlyDbError("finalize upload", err);
    return { ...failure, code: "retry", message: "The photo uploaded but could not be prepared. Retry in a moment." };
  }
}

/** Discards an unfinished or rejected upload (never a ready photo used by any revision). */
export async function discardUpload(supabase: Client, mediaId: string): Promise<ActionResult> {
  try {
    const media = await getMedia(supabase, mediaId);
    if (!media || media.status === "ready") return { ok: true, data: null };
    const paths = [media.original_path, ...(media.variants ?? []).map((v) => v.path)];
    const removed = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).remove(paths);
    if (removed.error) logAdminError("discard media objects", removed.error);
    const { error } = await supabase.from("project_media").delete().eq("id", media.id).neq("status", "ready");
    if (error) logAdminError("discard media row", error);
    return { ok: true, data: null };
  } catch (err) {
    logAdminError("discard upload", err);
    return { ok: true, data: null };
  }
}
