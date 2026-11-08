/**
 * Only same-site admin paths are allowed as post-auth redirect targets.
 * Rejects absolute URLs, protocol-relative ("//host"), backslash tricks and
 * anything outside /admin.
 */
export function safeAdminPath(raw: string | null | undefined, fallback = "/admin"): string {
  if (!raw || typeof raw !== "string" || raw.length > 200) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  // Control characters (including encoded newlines) are never valid here.
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback;
  let url: URL;
  try {
    url = new URL(raw, "http://admin.invalid");
  } catch {
    return fallback;
  }
  if (url.origin !== "http://admin.invalid") return fallback;
  if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) return fallback;
  return `${url.pathname}${url.search}`;
}
