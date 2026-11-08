import { PRIVATE_PATH_PREFIXES, type SitePolicy } from "@/config/site";

/** Search and answer-engine crawlers that may fetch public pages. */
export const SEARCH_CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "DuckDuckBot",
  "Applebot",
] as const;

/** Model-training crawlers: blocked unless sitePolicy.allowAiTraining. */
export const TRAINING_CRAWLERS = [
  "GPTBot",
  "Google-Extended",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Bytespider",
] as const;

/** "/admin" blocks /admin and /admin/*; "/api/" blocks the API tree. */
const PRIVATE_DISALLOWS = PRIVATE_PATH_PREFIXES.map((p) => (p === "/api" ? "/api/" : p));

function group(agent: string, allow: boolean): string[] {
  if (!allow) return [`User-agent: ${agent}`, "Disallow: /"];
  return [`User-agent: ${agent}`, "Allow: /", ...PRIVATE_DISALLOWS.map((d) => `Disallow: ${d}`)];
}

/** Builds robots.txt for the build's site policy. Pure; mode is fixed per build. */
export function buildRobotsTxt(policy: SitePolicy): string {
  if (!policy.indexable || !policy.canonicalOrigin) {
    // Crawlers must be able to fetch pages to see their noindex signals.
    return [
      "# Demo deployment: pages send noindex.",
      ...group("*", true),
      "",
    ].join("\n");
  }

  const blocks: string[][] = [
    ["# Default rules for all crawlers.", ...group("*", true)],
    [
      "# Search and answer crawlers. Groups do not inherit \"*\", so private paths repeat.",
      ...SEARCH_CRAWLERS.flatMap((a, i) => (i === 0 ? group(a, true) : ["", ...group(a, true)])),
    ],
    [
      policy.allowAiTraining
        ? "# Model-training crawlers (allowed by site policy)."
        : "# Model-training crawlers (not allowed).",
      ...TRAINING_CRAWLERS.flatMap((a, i) => {
        const g = group(a, policy.allowAiTraining);
        return i === 0 ? g : ["", ...g];
      }),
    ],
    [`Sitemap: ${policy.canonicalOrigin}/sitemap.xml`],
  ];
  return blocks.map((b) => b.join("\n")).join("\n\n") + "\n";
}
