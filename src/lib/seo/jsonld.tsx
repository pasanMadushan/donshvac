import { business, type BusinessConfig } from "@/config/business";
import { absoluteUrl, sitePolicy } from "@/config/site";
import type { ServiceSummary } from "@/config/services";

type Json = Record<string, unknown>;

/**
 * Serialise JSON-LD safely for an inline <script>. Escapes characters that
 * could terminate the script element or be parsed as HTML, so owner-entered
 * text (titles, summaries, alt text) can never break out.
 */
export function serializeJsonLd(data: Json | Json[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: { data: Json | Json[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}

export const businessId = () => `${sitePolicy.publicOrigin}/#business`;
export const websiteId = () => `${sitePolicy.publicOrigin}/#website`;

/**
 * HVACBusiness entity. Only approved, published facts. Address, hours,
 * coverage and profiles are included only when confirmed in config.
 * A past project location is never used as the business address.
 */
export function businessJsonLd(): Json {
  const data: Json = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    "@id": businessId(),
    name: business.displayName,
    url: absoluteUrl("/"),
    telephone: business.phone.e164,
    email: business.email,
    image: absoluteUrl("/opengraph-image"),
    logo: absoluteUrl("/icon.svg"),
    founder: { "@type": "Person", name: business.founder.name },
    description: `Residential and commercial heating, cooling and hot-water installation, repair and maintenance, with ${business.experienceClaim} of experience.`,
    knowsAbout: ["Furnaces", "Air conditioning", "Water heaters", "Heat pumps", "Ductwork", "Gas lines"],
  };
  const b: BusinessConfig = business;
  if (b.address) data.address = { "@type": "PostalAddress", ...b.address };
  if (b.openingHours?.length) data.openingHours = b.openingHours;
  if (b.confirmedServiceArea.length) {
    data.areaServed = b.confirmedServiceArea.map((name) => ({ "@type": "Place", name }));
  }
  if (b.socialProfiles.length) data.sameAs = b.socialProfiles.map((p) => p.url);
  return data;
}

export function websiteJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(),
    url: absoluteUrl("/"),
    name: business.displayName,
    inLanguage: "en-CA",
    publisher: { "@id": businessId() },
  };
}

export function serviceJsonLd(service: ServiceSummary, path: string, description: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name: `${service.name} services`,
    serviceType: service.name,
    description,
    url: absoluteUrl(path),
    provider: { "@id": businessId() },
  };
}

export interface Crumb {
  name: string;
  /** Site-relative path. The last crumb is the current page. */
  path: string;
}

/** Must be generated from the same array the visible <Breadcrumbs> renders. */
export function breadcrumbJsonLd(crumbs: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
