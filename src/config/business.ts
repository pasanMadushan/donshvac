/**
 * Approved business facts. Every public claim about the business comes from
 * this file. Do not add hours, prices, certifications, response times,
 * reviews, totals, savings or rankings unless the owner supplies and approves
 * them.
 *
 * Source: https://donshvac.wixsite.com/don-heating-and-co-1 (existing site),
 * reviewed 2026-11-08.
 */

export interface PhoneNumber {
  /** Human-readable, as published. */
  display: string;
  /** E.164 for schema.org and tel: links. */
  e164: string;
  href: `tel:${string}`;
}

export interface BusinessConfig {
  /** Editable display name pending owner approval. */
  displayName: string;
  shortName: string;
  founder: { name: string; firstName: string; role: string };
  phone: PhoneNumber;
  email: string;
  /** The experience claim exactly as supported by the existing site. */
  experienceClaim: string;
  sectors: ReadonlyArray<"residential" | "commercial">;
  workTypes: ReadonlyArray<string>;
  /** Region where completed projects are documented. Not a service-area claim. */
  documentedRegion: string;
  /**
   * Confirmed present-day service area. Empty until the owner confirms it.
   * When populated, it is shown on /service-area and in JSON-LD areaServed.
   */
  confirmedServiceArea: ReadonlyArray<string>;
  /** Published business address. null = not confirmed for publication. */
  address: null | {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: "CA";
  };
  /** Opening hours. null = not confirmed for publication. */
  openingHours: null | ReadonlyArray<string>;
  /**
   * Verified business social profiles only. The existing Wix site links to
   * Wix's own template profiles, so none are verified yet.
   */
  socialProfiles: ReadonlyArray<{ label: string; url: string }>;
  legacySiteUrl: string;
}

export const business = {
  displayName: "Don’s HVAC Services",
  shortName: "Don’s HVAC",
  founder: { name: "Don Dematagoda", firstName: "Don", role: "Founder" },
  phone: {
    display: "647-719-7319",
    e164: "+16477197319",
    href: "tel:+16477197319",
  },
  email: "donshvac2008@gmail.com",
  experienceClaim: "over 20 years",
  sectors: ["residential", "commercial"],
  workTypes: ["installation", "repair", "maintenance", "energy-efficiency upgrades"],
  documentedRegion: "Southern Ontario",
  confirmedServiceArea: [],
  address: null,
  openingHours: null,
  socialProfiles: [],
  legacySiteUrl: "https://donshvac.wixsite.com/don-heating-and-co-1",
} as const satisfies BusinessConfig;

export const callLabel = `Call ${business.founder.firstName}`;

export function mailtoHref(subject?: string, body?: string, to: string = business.email): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  // URLSearchParams encodes spaces as "+", which some mail clients show
  // literally. Use %20 instead.
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${to}${query ? `?${query}` : ""}`;
}
