import "server-only";
import { createServiceClient } from "@/lib/supabase/admin";
import { configuredSecret, keyedHash } from "./token";

/**
 * Abuse controls for the inquiry Server Action: a per-IP rate limit and an
 * in-memory de-duplication map keyed by the client-generated submission id.
 * Neither stores personal data: IPs are reduced to a keyed HMAC.
 */

export const RATE_LIMIT_MAX = 5;
export const RATE_LIMIT_WINDOW_SECONDS = 10 * 60;

/* ---------------------------------------------------------- rate limiting */

const memoryHits = new Map<string, { windowStart: number; hits: number }>();

function memoryRateHit(key: string, now = Date.now()): boolean {
  const windowMs = RATE_LIMIT_WINDOW_SECONDS * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const entry = memoryHits.get(key);
  if (!entry || entry.windowStart !== windowStart) {
    memoryHits.set(key, { windowStart, hits: 1 });
    if (memoryHits.size > 5000) {
      for (const [k, v] of memoryHits) if (v.windowStart !== windowStart) memoryHits.delete(k);
    }
    return true;
  }
  entry.hits += 1;
  return entry.hits <= RATE_LIMIT_MAX;
}

/** Client IP from proxy headers (first x-forwarded-for entry, else x-real-ip). */
export function clientIp(h: Headers): string {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = h.get("x-real-ip")?.trim();
  return (forwarded || real || "unknown").slice(0, 100);
}

export type RateResult = { allowed: boolean; store: "supabase" | "memory" };

/** Records one attempt; returns allowed=false when the limit is exceeded. */
export async function rateLimitHit(ip: string): Promise<RateResult> {
  const key = keyedHash(ip);
  // A shared store is only meaningful with a stable secret across instances.
  const client = configuredSecret() ? createServiceClient() : null;
  if (client) {
    try {
      const { data, error } = await client.rpc("inquiry_rate_hit", {
        p_key_hash: key,
        p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
        p_max: RATE_LIMIT_MAX,
      });
      if (!error && typeof data === "boolean") return { allowed: data, store: "supabase" };
    } catch {
      /* fall back to memory */
    }
  }
  return { allowed: memoryRateHit(key), store: "memory" };
}

/* --------------------------------------------------------- de-duplication */

const DEDUPE_TTL_MS = 10 * 60 * 1000;
const dedupe = new Map<string, { expires: number; result: Promise<unknown> }>();

export const SUBMISSION_ID = /^[A-Za-z0-9-]{16,64}$/;

/**
 * Runs `work` once per submission id for a few minutes. Repeated ids (double
 * submits, retries after a dropped connection) get the same result.
 * `shouldCache` lets the caller avoid caching results that should be retried
 * (e.g. rate-limit rejections).
 */
export async function onceForSubmission<T>(
  submissionId: string,
  work: () => Promise<T>,
  shouldCache: (result: T) => boolean = () => true,
): Promise<T> {
  if (!SUBMISSION_ID.test(submissionId)) return work();
  const now = Date.now();
  for (const [k, v] of dedupe) if (v.expires < now) dedupe.delete(k);
  const existing = dedupe.get(submissionId);
  if (existing) return existing.result as Promise<T>;
  const result = work();
  dedupe.set(submissionId, { expires: now + DEDUPE_TTL_MS, result });
  try {
    const value = await result;
    if (!shouldCache(value)) dedupe.delete(submissionId);
    return value;
  } catch (err) {
    dedupe.delete(submissionId);
    throw err;
  }
}
