import type { ProjectServiceCategory, PropertyType } from "@/config/services";

/**
 * The nine projects documented on the existing site ("Below are a few jobs we
 * have completed all across Southern Ontario"). Summaries state only what the
 * original captions support — no dates, equipment brands, sizes or outcomes.
 *
 * Used by `npm run db:seed` (inserted once per seedKey; owner edits,
 * unpublishing and deletions are never overwritten) and as a read-only
 * fallback when no CMS is configured.
 *
 * Photos: the existing site's images are not confirmed as client-approved
 * job photos (several appear to be stock or generated), so seeds are
 * text-only. Don adds real photos through /admin.
 */
export interface SeedProject {
  seedKey: string;
  slug: string;
  title: string;
  summary: string;
  city: string;
  service: ProjectServiceCategory;
  propertyType: PropertyType;
  featured: boolean;
  /** Original caption on the Wix site, for traceability. */
  legacyCaption: string;
  /** Display order (lower first) for the initial portfolio. */
  order: number;
}

export const seedProjects: SeedProject[] = [
  {
    seedKey: "oshawa-rooftop-ac",
    slug: "oshawa-commercial-rooftop-air-conditioner",
    title: "Rooftop air conditioning unit for an Oshawa building",
    summary:
      "Don’s HVAC Services completed rooftop air-conditioning work for a commercial building in Oshawa. Rooftop units serve the building from above, so the work involves roof access and coordinating with the people who manage the property.",
    city: "Oshawa",
    service: "air-conditioning",
    propertyType: "commercial",
    featured: true,
    legacyCaption: "Rooftop A/C unit for a building in Oshawa",
    order: 1,
  },
  {
    seedKey: "brampton-heat-pump",
    slug: "brampton-home-heat-pump-installation",
    title: "Heat pump installation in a Brampton home",
    summary:
      "A heat pump was installed in a Brampton home. A heat pump moves heat into the house in cold weather and out of it in warm weather, so one system covers both heating and cooling.",
    city: "Brampton",
    service: "heat-pumps",
    propertyType: "residential",
    featured: true,
    legacyCaption: "Heat pump installation in Brampton home",
    order: 2,
  },
  {
    seedKey: "etobicoke-tankless",
    slug: "etobicoke-home-tankless-water-heater",
    title: "Tankless water heater in an Etobicoke home",
    summary:
      "A tankless water heater was installed in an Etobicoke home. Tankless units heat water as it is used instead of keeping a full tank hot, and they mount on the wall.",
    city: "Etobicoke",
    service: "water-heaters",
    propertyType: "residential",
    featured: true,
    legacyCaption: "Tankless water-heater in a Etobicoke home",
    order: 3,
  },
  {
    seedKey: "mississauga-ac-repair",
    slug: "mississauga-home-air-conditioner-repair",
    title: "Air conditioner repair in a Mississauga home",
    summary: "Don repaired a central air conditioner for a home in Mississauga.",
    city: "Mississauga",
    service: "air-conditioning",
    propertyType: "residential",
    featured: false,
    legacyCaption: "A/C unit repair in a Mississauga home",
    order: 4,
  },
  {
    seedKey: "richmond-hill-nest",
    slug: "richmond-hill-home-nest-thermostat",
    title: "Google Nest thermostat in a Richmond Hill home",
    summary:
      "A Google Nest smart thermostat was set up in a Richmond Hill home. A smart thermostat controls the home’s heating and cooling equipment and can be adjusted from a phone.",
    city: "Richmond Hill",
    service: "thermostats",
    propertyType: "residential",
    featured: false,
    legacyCaption: "Google Nest thermostat in Richmond Hill home",
    order: 5,
  },
  {
    seedKey: "hamilton-office-gas-line",
    slug: "hamilton-office-gas-line-installation",
    title: "Gas line installation for a Hamilton office",
    summary: "Don’s HVAC Services installed a gas line for an office in Hamilton.",
    city: "Hamilton",
    service: "gas-lines",
    propertyType: "commercial",
    featured: false,
    legacyCaption: "Gas line installation for a Hamilton office",
    order: 6,
  },
  {
    seedKey: "north-york-ducts",
    slug: "north-york-home-duct-installation",
    title: "Duct installation in a North York home",
    summary:
      "Ductwork was installed in a North York home. Ducts carry heated and cooled air from the furnace or air handler to each room.",
    city: "North York",
    service: "ductwork",
    propertyType: "residential",
    featured: false,
    legacyCaption: "Duct installation in North York home",
    order: 7,
  },
  {
    seedKey: "bradford-ac-install",
    slug: "bradford-home-air-conditioner-installation",
    title: "Air conditioner installation in a Bradford home",
    summary: "A central air conditioner was installed at a home in Bradford.",
    city: "Bradford",
    service: "air-conditioning",
    propertyType: "residential",
    featured: false,
    legacyCaption: "A/C unit Installed in Bradford home",
    order: 8,
  },
  {
    seedKey: "waterloo-wall-ac",
    slug: "waterloo-home-wall-mounted-air-conditioner",
    title: "Wall-mounted air conditioning unit at a Waterloo home",
    summary: "An air-conditioning unit was mounted on the wall of a home in Waterloo.",
    city: "Waterloo",
    service: "air-conditioning",
    propertyType: "residential",
    featured: false,
    legacyCaption: "Wall Hanging A/C unit in Waterloo home",
    order: 9,
  },
];
