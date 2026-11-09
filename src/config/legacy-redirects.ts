/**
 * Legacy Wix paths. The old site lived under /don-heating-and-co-1 on
 * donshvac.wixsite.com. These rules only take effect for requests that reach
 * this deployment (for example if the approved domain was previously pointed
 * at Wix). Redirects on the wixsite.com host itself need Wix access — see
 * docs/wix-migration.md.
 *
 * Note: the bare legacy "/services" (air conditioning) is deliberately NOT
 * redirected here, because /services is the new services directory.
 *
 * Shared by next.config.ts (server build) and scripts/build-static.ts
 * (generates the .htaccess for the static build).
 */
export const legacyBase = "/don-heating-and-co-1";

export const legacyMap: Array<[string, string]> = [
  ["/services", "/services/air-conditioning"],
  ["/copy-of-air-conditioners", "/services/furnaces"],
  ["/copy-of-air-conditioners-1", "/services/water-heaters"],
  ["/projects", "/our-work"],
  ["/about-us", "/contact"],
];

/** Flat list of permanent redirects: [from, to]. */
export function legacyRedirectRules(): Array<[string, string]> {
  const rules: Array<[string, string]> = [
    [legacyBase, "/"],
    [`${legacyBase}/`, "/"],
  ];
  for (const [from, to] of legacyMap) {
    rules.push([`${legacyBase}${from}`, to]);
    if (from !== "/services") rules.push([from, to]);
  }
  return rules;
}
