import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PROJECT_SERVICE_CATEGORIES, PROPERTY_TYPES } from "@/config/services";
import type { ProjectServiceCategory, PropertyType } from "@/config/services";
import { toImage } from "@/lib/cms/public";
import type { MediaVariant, ProjectImage, PublicProject } from "@/lib/cms/types";
import { PRIVATE_MEDIA_BUCKET } from "@/lib/supabase/env";
import { SIGNED_URL_TTL } from "@/lib/media/limits";
import { logAdminError } from "./errors";
import { statusKeyFor } from "./status";
import type { AdminProjectRow, EditorFields, EditorPhoto, EditorProject, ProjectStatus } from "./types";

/**
 * Admin read layer. Every function takes the USER client returned by
 * requireOwnerPage()/requireOwnerAction(), so RLS (is_owner) applies to every
 * query. Never cached ("use cache" is never used for admin data).
 */

type Client = SupabaseClient;

export interface ProjectRow {
  id: string;
  slug: string | null;
  status: ProjectStatus;
  draft_revision_id: string | null;
  published_revision_id: string | null;
  updated_at: string;
  first_published_at: string | null;
  last_published_at: string | null;
}

export interface RevisionRow {
  id: string;
  project_id: string;
  title: string;
  summary: string;
  city: string | null;
  service: string | null;
  property_type: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  share_image_media_id: string | null;
  locked: boolean;
  updated_at: string;
  published_at: string | null;
}

export interface MediaRow {
  id: string;
  project_id: string;
  status: "pending" | "ready" | "failed";
  width: number | null;
  height: number | null;
  file_stem: string;
  variants: MediaVariant[] | null;
  public_variants: MediaVariant[] | null;
}

export interface GalleryRow {
  media_id: string;
  position: number;
  alt: string;
  is_cover: boolean;
  media: MediaRow | null;
}

const PROJECT_COLUMNS =
  "id, slug, status, draft_revision_id, published_revision_id, updated_at, first_published_at, last_published_at";
const REVISION_COLUMNS =
  "id, project_id, title, summary, city, service, property_type, featured, seo_title, seo_description, share_image_media_id, locked, updated_at, published_at";
export const MEDIA_COLUMNS = "id, project_id, status, width, height, file_stem, variants, public_variants";

export class AdminDataError extends Error {
  constructor(
    public readonly context: string,
    public readonly cause: unknown,
  ) {
    super(`admin data: ${context}`);
  }
}

function fail(context: string, error: unknown): never {
  throw new AdminDataError(context, error);
}

// ---------------------------------------------------------------- list

export async function listProjects(supabase: Client): Promise<AdminProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      `${PROJECT_COLUMNS},
       draft:project_revisions!projects_draft_fk(title, updated_at),
       published:project_revisions!projects_published_fk(title, updated_at)`,
    )
    .neq("status", "deleted")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (error) fail("list projects", error);

  type Row = ProjectRow & {
    draft: { title: string; updated_at: string } | null;
    published: { title: string; updated_at: string } | null;
  };
  return ((data ?? []) as unknown as Row[])
    .map((r) => {
      const rev = r.draft ?? r.published;
      const times = [r.updated_at, r.draft?.updated_at, r.published?.updated_at].filter(Boolean) as string[];
      const updatedAt = times.sort().at(-1) ?? r.updated_at;
      return {
        id: r.id,
        slug: r.slug,
        title: rev?.title?.trim() || "",
        statusKey: statusKeyFor(r.status, r.draft_revision_id),
        updatedAt,
      };
    })
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

// ---------------------------------------------------------------- single project

/** RLS-backed existence check for a client-provided project id. */
export async function getProject(supabase: Client, projectId: string): Promise<ProjectRow | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("id", projectId)
    .neq("status", "deleted")
    .maybeSingle();
  if (error) fail("get project", error);
  return (data as ProjectRow | null) ?? null;
}

export async function getRevision(supabase: Client, revisionId: string): Promise<RevisionRow | null> {
  const { data, error } = await supabase
    .from("project_revisions")
    .select(REVISION_COLUMNS)
    .eq("id", revisionId)
    .maybeSingle();
  if (error) fail("get revision", error);
  return (data as RevisionRow | null) ?? null;
}

export async function getGallery(supabase: Client, revisionId: string): Promise<GalleryRow[]> {
  const { data, error } = await supabase
    .from("revision_media")
    .select(`media_id, position, alt, is_cover, media:project_media(${MEDIA_COLUMNS})`)
    .eq("revision_id", revisionId)
    .order("position", { ascending: true });
  if (error) fail("get gallery", error);
  return (data ?? []) as unknown as GalleryRow[];
}

function smallestVariantPath(variants: MediaVariant[] | null | undefined): string | null {
  const list = (variants ?? []).filter((v) => v && v.path).sort((a, b) => a.w - b.w);
  return list[0]?.path ?? null;
}

/** Short-lived signed URLs for private objects (after the owner check). */
export async function signPrivatePaths(supabase: Client, paths: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter(Boolean))];
  const out = new Map<string, string>();
  if (!unique.length) return out;
  const { data, error } = await supabase.storage.from(PRIVATE_MEDIA_BUCKET).createSignedUrls(unique, SIGNED_URL_TTL);
  if (error) {
    // Thumbnails are a convenience; the editor still works without them.
    logAdminError("sign thumbnails", error);
    return out;
  }
  for (const item of data ?? []) {
    if (item.path && item.signedUrl && !item.error) out.set(item.path, item.signedUrl);
  }
  return out;
}

export async function signedThumb(supabase: Client, variants: MediaVariant[] | null): Promise<string | null> {
  const path = smallestVariantPath(variants);
  if (!path) return null;
  const map = await signPrivatePaths(supabase, [path]);
  return map.get(path) ?? null;
}

function asCategory(v: string | null): ProjectServiceCategory | "" {
  return (PROJECT_SERVICE_CATEGORIES as readonly string[]).includes(v ?? "") ? (v as ProjectServiceCategory) : "";
}
function asPropertyType(v: string | null): PropertyType | "" {
  return (PROPERTY_TYPES as readonly string[]).includes(v ?? "") ? (v as PropertyType) : "";
}

function fieldsFromRevision(r: RevisionRow | null): EditorFields {
  return {
    title: r?.title ?? "",
    summary: r?.summary ?? "",
    city: r?.city ?? "",
    service: asCategory(r?.service ?? null),
    propertyType: asPropertyType(r?.property_type ?? null),
    featured: r?.featured ?? false,
    seoTitle: r?.seo_title ?? "",
    seoDescription: r?.seo_description ?? "",
    shareImageMediaId: r?.share_image_media_id ?? "",
  };
}

/**
 * Editor state: the draft revision if one exists, otherwise the published
 * one (opening the editor never creates a draft; saving does).
 */
export async function loadEditorProject(supabase: Client, projectId: string): Promise<EditorProject | null> {
  const project = await getProject(supabase, projectId);
  if (!project) return null;
  const revisionId = project.draft_revision_id ?? project.published_revision_id;
  const revision = revisionId ? await getRevision(supabase, revisionId) : null;
  const gallery = revisionId ? await getGallery(supabase, revisionId) : [];

  const { data: mediaData, error: mediaError } = await supabase
    .from("project_media")
    .select(MEDIA_COLUMNS)
    .eq("project_id", project.id)
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(60);
  if (mediaError) fail("list media", mediaError);
  const inGallery = new Set(gallery.map((g) => g.media_id));
  const unattachedRows = ((mediaData ?? []) as MediaRow[]).filter((m) => !inGallery.has(m.id));

  const paths = [
    ...gallery.map((g) => smallestVariantPath(g.media?.variants)),
    ...unattachedRows.map((m) => smallestVariantPath(m.variants)),
  ].filter((p): p is string => Boolean(p));
  const signed = await signPrivatePaths(supabase, paths);
  const thumbFor = (v: MediaVariant[] | null | undefined) => {
    const p = smallestVariantPath(v);
    return p ? (signed.get(p) ?? null) : null;
  };

  const photos: EditorPhoto[] = gallery.map((g) => ({
    mediaId: g.media_id,
    alt: g.alt ?? "",
    isCover: g.is_cover,
    width: g.media?.width ?? null,
    height: g.media?.height ?? null,
    thumbUrl: thumbFor(g.media?.variants),
  }));
  const unattached: EditorPhoto[] = unattachedRows.map((m) => ({
    mediaId: m.id,
    alt: "",
    isCover: false,
    width: m.width,
    height: m.height,
    thumbUrl: thumbFor(m.variants),
  }));

  const times = [project.updated_at, revision?.updated_at].filter(Boolean) as string[];
  return {
    id: project.id,
    slug: project.slug,
    statusKey: statusKeyFor(project.status, project.draft_revision_id),
    updatedAt: times.sort().at(-1) ?? project.updated_at,
    fields: fieldsFromRevision(revision),
    gallery: photos,
    unattached,
  };
}

/**
 * Draft preview in the public project shape, with every image served from
 * short-lived signed URLs of the PRIVATE derivatives.
 */
export async function loadPreviewProject(supabase: Client, projectId: string): Promise<PublicProject | null> {
  const project = await getProject(supabase, projectId);
  if (!project) return null;
  const revisionId = project.draft_revision_id ?? project.published_revision_id;
  if (!revisionId) return null;
  const revision = await getRevision(supabase, revisionId);
  if (!revision) return null;
  const gallery = (await getGallery(supabase, revisionId)).filter(
    (g) => g.media && g.media.status === "ready" && g.media.variants?.length,
  );
  const signed = await signPrivatePaths(
    supabase,
    gallery.flatMap((g) => (g.media?.variants ?? []).map((v) => v.path)),
  );
  const images = gallery
    .map((g) =>
      toImage(
        {
          id: g.media_id,
          alt: g.alt,
          is_cover: g.is_cover,
          width: g.media?.width ?? null,
          height: g.media?.height ?? null,
          variants: (g.media?.variants ?? []).filter((v) => signed.has(v.path)),
        },
        (path) => signed.get(path) ?? "",
      ),
    )
    .filter((i): i is ProjectImage => i !== null);
  const cover = images.find((i) => i.isCover) ?? images[0] ?? null;
  const shareImage =
    (revision.share_image_media_id && images.find((i) => i.id === revision.share_image_media_id)) || cover;
  const fields = fieldsFromRevision(revision);
  return {
    id: project.id,
    slug: project.slug ?? "",
    title: fields.title,
    summary: fields.summary,
    city: fields.city || null,
    service: fields.service || null,
    propertyType: fields.propertyType || null,
    featured: fields.featured,
    images,
    cover,
    seoTitle: revision.seo_title,
    seoDescription: revision.seo_description,
    shareImage,
    publishedAt: project.first_published_at,
    modifiedAt: revision.published_at ?? revision.updated_at,
    source: "cms",
  };
}
