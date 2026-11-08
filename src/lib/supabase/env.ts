/**
 * Supabase configuration. Accepts the current key names
 * (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY) and the legacy
 * ones (NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY).
 */
export function supabasePublicEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

export function isCmsConfigured(): boolean {
  return supabasePublicEnv() !== null;
}

export const PUBLIC_MEDIA_BUCKET = "project-media-public";
export const PRIVATE_MEDIA_BUCKET = "project-media-private";

export function publicMediaUrl(path: string): string {
  const env = supabasePublicEnv();
  if (!env) throw new Error("Supabase is not configured");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${env.url}/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/${encoded}`;
}
