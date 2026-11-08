/**
 * Date the static page copy was last meaningfully updated (YYYY-MM-DD).
 * Bump this when page content changes; it feeds sitemap <lastmod>.
 * Never replace with the current time.
 */
export const CONTENT_UPDATED = "2026-11-08";

/** The later of two ISO dates/timestamps; nulls are ignored. */
export function latestDate(...dates: Array<string | null | undefined>): string | null {
  let best: string | null = null;
  let bestMs = -Infinity;
  for (const d of dates) {
    if (!d) continue;
    const ms = Date.parse(d);
    if (Number.isNaN(ms)) continue;
    if (ms > bestMs) {
      bestMs = ms;
      best = d;
    }
  }
  return best;
}
