import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Timing token for the static /contact page. The client fetches a token from
 * a Server Action on mount; the token is HMAC-SHA256(FORM_TOKEN_SECRET,
 * "inquiry:" + issuedAt). Submissions faster than MIN_AGE or with tokens older
 * than MAX_AGE are rejected with a friendly retry message.
 */

export const TOKEN_MIN_AGE_MS = 3_000;
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

let processSecret: string | null = null;

/** The configured secret, or null when FORM_TOKEN_SECRET is unset/too short. */
export function configuredSecret(): string | null {
  const s = process.env.FORM_TOKEN_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

/**
 * Secret for keyed hashes. Falls back to a random per-process secret so IPs
 * are never stored or compared in the clear (only stable within one process,
 * which is all the in-memory limiter needs).
 */
export function hashingSecret(): string {
  const configured = configuredSecret();
  if (configured) return configured;
  processSecret ??= randomBytes(32).toString("hex");
  return processSecret;
}

function sign(issuedAt: number, secret: string): string {
  return createHmac("sha256", secret).update(`inquiry:${issuedAt}`).digest("base64url");
}

/** Returns null when no FORM_TOKEN_SECRET is configured (timing check off). */
export function issueToken(now = Date.now()): string | null {
  const secret = configuredSecret();
  if (!secret) return null;
  return `${now}.${sign(now, secret)}`;
}

export type TokenCheck = "ok" | "missing" | "too_fast" | "expired" | "invalid" | "unchecked";

export function checkToken(token: string, now = Date.now()): TokenCheck {
  const secret = configuredSecret();
  if (!secret) return "unchecked";
  if (!token) return "missing";
  const match = /^(\d{10,16})\.([A-Za-z0-9_-]{20,100})$/.exec(token);
  if (!match) return "invalid";
  const issuedAt = Number(match[1]);
  const expected = Buffer.from(sign(issuedAt, secret));
  const given = Buffer.from(match[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const age = now - issuedAt;
  if (age < -60_000) return "invalid";
  if (age < TOKEN_MIN_AGE_MS) return "too_fast";
  if (age > TOKEN_MAX_AGE_MS) return "expired";
  return "ok";
}

export function keyedHash(value: string): string {
  return createHmac("sha256", hashingSecret()).update(`ip:${value}`).digest("hex");
}
