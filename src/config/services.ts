/**
 * Service definitions — the approved scope of work. Scope lines are drawn from
 * the existing site's service pages (furnaces, air conditioning, water
 * heaters) and the documented project list. Detailed page copy (symptoms,
 * FAQs) lives in src/content/service-pages.ts and must stay within this scope.
 */

export const SERVICE_SLUGS = ["furnaces", "air-conditioning", "water-heaters", "heat-pumps"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Categories a project can be tagged with in the CMS. Each maps to the most
 * useful public destination via `servicePathForCategory`.
 */
export const PROJECT_SERVICE_CATEGORIES = [
  "furnaces",
  "air-conditioning",
  "water-heaters",
  "heat-pumps",
  "ductwork",
  "thermostats",
  "gas-lines",
] as const;
export type ProjectServiceCategory = (typeof PROJECT_SERVICE_CATEGORIES)[number];

export const PROPERTY_TYPES = ["residential", "commercial"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface ServiceSummary {
  slug: ServiceSlug;
  /** Short name for nav, chips and forms. */
  name: string;
  /** Equipment noun used in sentences ("your furnace"). */
  equipment: string;
  /** One sentence, plain and specific. */
  summary: string;
  /** Equipment types explicitly in scope. */
  equipmentTypes: string[];
  /** Which system the home-page cutaway highlights for this service. */
  cutawaySystem: "heating" | "cooling" | "hot-water";
}

export const services: Record<ServiceSlug, ServiceSummary> = {
  furnaces: {
    slug: "furnaces",
    name: "Furnaces",
    equipment: "furnace",
    summary: "Gas and electric furnace repair, maintenance and replacement for homes and businesses.",
    equipmentTypes: ["Gas furnaces", "Electric furnaces", "High-efficiency furnaces"],
    cutawaySystem: "heating",
  },
  "air-conditioning": {
    slug: "air-conditioning",
    name: "Air conditioning",
    equipment: "air conditioner",
    summary: "Central and ductless air conditioning installation, repair and seasonal maintenance.",
    equipmentTypes: ["Central air conditioners", "Ductless mini-splits", "Rooftop units (commercial)"],
    cutawaySystem: "cooling",
  },
  "water-heaters": {
    slug: "water-heaters",
    name: "Water heaters",
    equipment: "water heater",
    summary: "Tank, tankless and heat-pump water heater installation, repair and maintenance.",
    equipmentTypes: ["Tank water heaters", "Tankless water heaters", "Heat-pump water heaters"],
    cutawaySystem: "hot-water",
  },
  "heat-pumps": {
    slug: "heat-pumps",
    name: "Heat pumps",
    equipment: "heat pump",
    summary: "Air-source heat pumps for home heating and cooling, including pairing with an existing furnace.",
    equipmentTypes: ["Air-source heat pumps", "Heat pumps paired with a furnace"],
    cutawaySystem: "heating",
  },
};

export const serviceList: ServiceSummary[] = SERVICE_SLUGS.map((s) => services[s]);

export const serviceCategoryLabels: Record<ProjectServiceCategory, string> = {
  furnaces: "Furnace",
  "air-conditioning": "Air conditioning",
  "water-heaters": "Water heater",
  "heat-pumps": "Heat pump",
  ductwork: "Ductwork",
  thermostats: "Thermostat",
  "gas-lines": "Gas line",
};

export const propertyTypeLabels: Record<PropertyType, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

/** The single most useful public page for a project's category. */
export function servicePathForCategory(
  category: ProjectServiceCategory | null | undefined,
  propertyType?: PropertyType | null,
): { href: string; label: string } {
  if (propertyType === "commercial" && (category === "gas-lines" || category === "air-conditioning" || !category)) {
    return { href: "/commercial", label: "Commercial HVAC" };
  }
  switch (category) {
    case "furnaces":
    case "air-conditioning":
    case "water-heaters":
    case "heat-pumps":
      return { href: `/services/${category}`, label: services[category].name };
    case "ductwork":
      return { href: "/services/air-conditioning", label: "Air conditioning and airflow" };
    case "thermostats":
    case "gas-lines":
      return { href: "/services/furnaces", label: services.furnaces.name };
    default:
      return { href: "/services", label: "All services" };
  }
}

/** Service pages that should list a project with this category. */
export function servicePagesForCategory(category: ProjectServiceCategory | null): ServiceSlug[] {
  switch (category) {
    case "furnaces":
    case "air-conditioning":
    case "water-heaters":
    case "heat-pumps":
      return [category];
    case "ductwork":
      return ["air-conditioning", "furnaces"];
    case "thermostats":
      return ["furnaces", "air-conditioning"];
    case "gas-lines":
      return ["furnaces"];
    default:
      return [];
  }
}
