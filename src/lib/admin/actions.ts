"use server";

import { redirect } from "next/navigation";
import { NotAuthorisedError, requireOwnerAction } from "@/lib/auth/owner";
import { AdminDataError, getProject } from "./data";
import { friendlyDbError, NOT_AUTHORISED } from "./errors";
import { createUploadTarget, discardUpload, finalizeUpload } from "./media";
import { deleteProject, publishProject, saveDraft, unpublishProject, type PublishOutcome } from "./publish";
import { savePayloadSchema, uploadDescriptorSchema, uuidSchema, zodFieldErrors } from "./schemas";
import { statusKeyFor } from "./status";
import type { ActionFailure, ActionResult, FinalizedPhoto, StatusKey, UploadTarget } from "./types";

/**
 * Owner-only Server Actions for the project editor. Each one verifies the
 * owner FIRST (getUser + is_owner RPC), validates input with Zod, works only
 * through the cookie-bound user client (RLS + storage policies) and returns a
 * typed result with friendly messages; raw database errors never leave the server.
 */

async function owner() {
  try {
    return await requireOwnerAction();
  } catch (err) {
    if (err instanceof NotAuthorisedError) return null;
    throw err;
  }
}

function invalidId(): ActionFailure {
  return { ok: false, code: "not-found", message: "This project could not be found. Reload the page." };
}

function invalidPayload(error: Parameters<typeof zodFieldErrors>[0]): ActionFailure {
  return {
    ok: false,
    code: "invalid",
    message: "Some fields need attention before this can be saved.",
    fieldErrors: zodFieldErrors(error),
  };
}

// ---------------------------------------------------------------- projects

export async function createProjectAction(): Promise<void> {
  const auth = await owner();
  if (!auth) redirect("/admin/login");
  const { data, error } = await auth.supabase.rpc("create_project_draft");
  if (error || typeof data !== "string") {
    friendlyDbError("create project", error);
    redirect("/admin?error=create");
  }
  redirect(`/admin/projects/${data}`);
}

export async function saveDraftAction(
  projectId: string,
  payload: unknown,
): Promise<ActionResult<{ statusKey: StatusKey; savedAt: string }>> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(projectId);
  if (!id.success) return invalidId();
  const parsed = savePayloadSchema.safeParse(payload);
  if (!parsed.success) return invalidPayload(parsed.error);
  try {
    await saveDraft(auth.supabase, id.data, parsed.data);
    const project = await getProject(auth.supabase, id.data);
    if (!project) return invalidId();
    return {
      ok: true,
      data: { statusKey: statusKeyFor(project.status, project.draft_revision_id), savedAt: new Date().toISOString() },
    };
  } catch (err) {
    return err instanceof AdminDataError ? friendlyDbError(err.context, err.cause) : friendlyDbError("save", err);
  }
}

export async function publishAction(projectId: string, payload: unknown): Promise<ActionResult<PublishOutcome>> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(projectId);
  if (!id.success) return invalidId();
  const parsed = savePayloadSchema.safeParse(payload);
  if (!parsed.success) return invalidPayload(parsed.error);
  return publishProject(auth.supabase, id.data, parsed.data);
}

export async function unpublishAction(projectId: string): Promise<ActionResult<{ slug: string | null }>> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(projectId);
  if (!id.success) return invalidId();
  return unpublishProject(auth.supabase, id.data);
}

export async function deleteAction(projectId: string): Promise<ActionResult> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(projectId);
  if (!id.success) return invalidId();
  return deleteProject(auth.supabase, id.data);
}

// ---------------------------------------------------------------- photos

export async function createUploadTargetAction(projectId: string, descriptor: unknown): Promise<ActionResult<UploadTarget>> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(projectId);
  if (!id.success) return invalidId();
  const parsed = uploadDescriptorSchema.safeParse(descriptor);
  if (!parsed.success) {
    return { ok: false, code: "rejected", message: parsed.error.issues[0]?.message ?? "This photo cannot be uploaded." };
  }
  return createUploadTarget(auth.supabase, id.data, parsed.data);
}

export async function finalizeUploadAction(mediaId: string): Promise<ActionResult<FinalizedPhoto>> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(mediaId);
  if (!id.success) return { ok: false, code: "not-found", message: "This photo could not be found." };
  return finalizeUpload(auth.supabase, id.data);
}

export async function discardUploadAction(mediaId: string): Promise<ActionResult> {
  const auth = await owner();
  if (!auth) return NOT_AUTHORISED;
  const id = uuidSchema.safeParse(mediaId);
  if (!id.success) return { ok: true, data: null };
  return discardUpload(auth.supabase, id.data);
}
