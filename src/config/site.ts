/**
 * Central site / indexing policy. THE ONLY place that decides whether the site
 * may be indexed and which origin is used for absolute URLs.
 *
 * Safe to import from Proxy, server and build code (no `server-only`, no Node
 * APIs). Never import from Client Components — use the values passed as props.
 *
 * Rules (see README "Indexing policy"):
 *  - Default mode is "demo". Demo = noindex everywhere.
 *  - VERCEL_ENV=production or NODE_ENV=production alone NEVER enables indexing.
 *  - Indexing needs ALL of: SITE_MODE=live, a valid approved HTTPS
 *    SITE_CANONICAL_ORIGIN, a non-preview Vercel environment, and (per request,
 *    enforced in src/proxy.ts) a request on the canonical host.
 *  - Hosts in SITE_REDIRECT_HOSTS get a one-hop 308 to the canonical origin.
 */

export type SiteMode = "demo" | "live";

export interface SitePolicy {
  /** Effective mode after all guards. */
  mode: SiteMode;
  /** True only when every build-level launch condition is met. */
  indexable: boolean;
  /** Approved canonical origin, e.g. "https://www.example.ca". Live only. */
  canonicalOrigin: string | null;
  canonicalHost: string | null;
  /** Alternate approved hosts that permanently redirect to canonicalHost. */
  redirectHosts: string[];
  /**
   * Origin used for absolute URLs (Open Graph images, JSON-LD ids).
   * Live: the canonical origin. Demo: the demo deployment origin, or
   * localhost in development. Never emitted as a canonical link in demo.
   */
  publicOrigin: string;
  /** Allow model-training crawlers (GPTBot, Google-Extended, CCBot…). */
  allowAiTraining: boolean;
  /** Human-readable reasons the site is not indexable (for logs/audit). */
  problems: string[];
}

type Env = Record<string, string | undefined>;

const FORBIDDEN_CANONICAL_HOST = [
  /^localhost$/,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /\.vercel\.app$/,
  /\.vercel\.sh$/,
  /\.local$/,
  /\.internal$/,
  /(^|\.)example\.(com|org|net)$/,
  /\.wixsite\.com$/,
];
// Reserved TLDs are only accepted for the automated launch simulation.
const TEST_ONLY_HOST = [/\.test$/, /\.invalid$/, /\.example$/, /\.localhost$/];

export function normaliseHost(host: string | null | undefined): string {
  return (host ?? "").trim().toLowerCase().replace(/\.$/, "");
}

function parseCanonical(raw: string | undefined, env: Env, problems: string[]) {
  if (!raw) {
    problems.push("SITE_CANONICAL_ORIGIN is not set");
    return null;
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    problems.push("SITE_CANONICAL_ORIGIN is not a valid URL");
    return null;
  }
  if (url.protocol !== "https:") problems.push("SITE_CANONICAL_ORIGIN must use https");
  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    problems.push("SITE_CANONICAL_ORIGIN must be a bare origin (no path, query or credentials)");
  }
  const host = normaliseHost(url.host);
  if (FORBIDDEN_CANONICAL_HOST.some((re) => re.test(host))) {
    problems.push(`SITE_CANONICAL_ORIGIN host "${host}" is not an approved public domain`);
  }
  if (TEST_ONLY_HOST.some((re) => re.test(host)) && env.SITE_ALLOW_TEST_CANONICAL !== "1") {
    problems.push(`SITE_CANONICAL_ORIGIN host "${host}" is a reserved test domain`);
  }
  return problems.length ? null : { origin: url.origin, host };
}

function demoOrigin(env: Env): string {
  const explicit = env.SITE_DEMO_ORIGIN?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      /* fall through */
    }
  }
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_BRANCH_URL) return `https://${env.VERCEL_BRANCH_URL}`;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return `http://localhost:${env.PORT || "3000"}`;
}

export function resolveSitePolicy(env: Env = process.env): SitePolicy {
  const problems: string[] = [];
  const requested: SiteMode = env.SITE_MODE?.trim().toLowerCase() === "live" ? "live" : "demo";
  if (requested !== "live") problems.push("SITE_MODE is not 'live' (default demo mode)");

  // Vercel preview / development deployments are always demo, whatever else is set.
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "production") {
    problems.push(`VERCEL_ENV=${env.VERCEL_ENV} is never indexable`);
  }

  const canonical = requested === "live" ? parseCanonical(env.SITE_CANONICAL_ORIGIN, env, problems) : null;
  const indexable = requested === "live" && canonical !== null && problems.length === 0;

  const redirectHosts = indexable
    ? (env.SITE_REDIRECT_HOSTS ?? "")
        .split(",")
        .map(normaliseHost)
        .filter((h) => h && h !== canonical!.host)
    : [];

  return {
    mode: indexable ? "live" : "demo",
    indexable,
    canonicalOrigin: indexable ? canonical!.origin : null,
    canonicalHost: indexable ? canonical!.host : null,
    redirectHosts,
    publicOrigin: indexable ? canonical!.origin : demoOrigin(env),
    allowAiTraining: env.SITE_ALLOW_AI_TRAINING === "true",
    problems: indexable ? [] : problems,
  };
}

export const sitePolicy: SitePolicy = resolveSitePolicy();

/** Paths that are never indexable, on any host, in any mode. */
export const PRIVATE_PATH_PREFIXES = ["/admin", "/api"] as const;

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export type RequestRouting =
  | { kind: "redirect"; location: string }
  | { kind: "serve"; indexable: boolean };

/**
 * Per-request decision used by src/proxy.ts. Pure function for testability.
 * Combines alternate-host and trailing-slash normalisation into ONE hop.
 */
export function routeRequest(
  policy: SitePolicy,
  rawHost: string | null,
  pathname: string,
  search: string,
): RequestRouting {
  const host = normaliseHost(rawHost);
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith("/");
  const cleanPath = hasTrailingSlash ? pathname.replace(/\/+$/, "") || "/" : pathname;

  if (policy.indexable && policy.redirectHosts.includes(host)) {
    return { kind: "redirect", location: `${policy.canonicalOrigin}${cleanPath}${search}` };
  }
  if (hasTrailingSlash) {
    return { kind: "redirect", location: `${cleanPath}${search}` };
  }
  const indexable = policy.indexable && host === policy.canonicalHost && !isPrivatePath(pathname);
  return { kind: "serve", indexable };
}

export const NOINDEX_HEADER_VALUE = "noindex, nofollow";

/** Absolute URL on the public origin for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, sitePolicy.publicOrigin).toString();
}

/** Canonical URL — only in live mode. Demo pages emit no canonical. */
export function canonicalUrl(path: string): string | null {
  if (!sitePolicy.indexable || !sitePolicy.canonicalOrigin) return null;
  const clean = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${sitePolicy.canonicalOrigin}${clean}`;
}
