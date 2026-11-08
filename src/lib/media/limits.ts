/**
 * Photo upload limits. Client-safe (no Node APIs): the editor pre-checks with
 * these and the server re-validates the REAL file with sharp.
 */
export const PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
export type PhotoMime = (typeof PHOTO_ACCEPT)[number];

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MIN_SHORT_SIDE = 600;
export const MAX_SIDE = 12000;
export const MAX_MEGAPIXELS = 50;
export const MAX_PHOTOS = 12;

/** Derivative widths (WebP). Never enlarged beyond the original. */
export const DERIVATIVE_WIDTHS = [480, 960, 1600] as const;
export const WEBP_QUALITY = 80;

/** Signed thumbnail lifetime for the admin (seconds). */
export const SIGNED_URL_TTL = 600;

/** Public derivative cache lifetime (seconds). Paths are content-stable per media id. */
export const PUBLIC_CACHE_SECONDS = "31536000";

export const PHOTO_LIMITS_TEXT =
  "JPEG, PNG or WebP, up to 15 MB each, at least 600 px on the shortest side, up to 12 photos.";

export function isAcceptedType(type: string): type is PhotoMime {
  return (PHOTO_ACCEPT as readonly string[]).includes(type);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Client pre-check of a picked file. Returns a friendly problem or null. */
export function precheckFile(file: { name: string; size: number; type: string }): string | null {
  if (!isAcceptedType(file.type)) {
    return `“${file.name}” is not a JPEG, PNG or WebP photo.`;
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return `“${file.name}” is ${formatBytes(file.size)}. Photos must be 15 MB or smaller.`;
  }
  if (file.size === 0) return `“${file.name}” is empty.`;
  return null;
}
