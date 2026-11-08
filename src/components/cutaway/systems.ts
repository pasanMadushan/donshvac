/**
 * The three systems shown in the home-page cutaway drawing. Shared by the
 * server-rendered drawing (numbered tags) and the client controls (key,
 * descriptions and links), so the numbering can never drift.
 */
export type CutawaySystemId = "heating" | "cooling" | "hot-water";

export interface CutawayKeyItem {
  /** Number shown on the drawing tag. */
  n: number;
  label: string;
}

export interface CutawaySystem {
  id: CutawaySystemId;
  label: string;
  description: string;
  href: string;
  linkText: string;
  /** Optional second destination (heat pumps share the cooling equipment). */
  secondary?: { href: string; linkText: string };
  key: CutawayKeyItem[];
}

export const cutawaySystems: CutawaySystem[] = [
  {
    id: "heating",
    label: "Heating",
    description:
      "The furnace in the basement heats air and a blower pushes it through supply ducts to each room. Return ducts bring cooler air back to the furnace. The thermostat tells it when to run.",
    href: "/services/furnaces",
    linkText: "Furnace repair, maintenance and replacement",
    key: [
      { n: 1, label: "Furnace" },
      { n: 2, label: "Supply and return ducts" },
      { n: 3, label: "Thermostat" },
    ],
  },
  {
    id: "cooling",
    label: "Cooling",
    description:
      "The outdoor condenser and the indoor coil on top of the furnace are joined by a refrigerant line set. The furnace blower moves the cooled air through the same ducts. A heat pump uses the same layout to heat as well as cool.",
    href: "/services/air-conditioning",
    linkText: "Air conditioning installation and repair",
    secondary: { href: "/services/heat-pumps", linkText: "Heat pumps for heating and cooling" },
    key: [
      { n: 4, label: "Outdoor condenser or heat pump" },
      { n: 5, label: "Refrigerant line set" },
      { n: 6, label: "Indoor coil above the furnace" },
    ],
  },
  {
    id: "hot-water",
    label: "Hot water",
    description:
      "The water heater keeps hot water ready, or heats it on demand if it is a tankless unit. Hot-water lines carry it up to the kitchen sink and the bathroom.",
    href: "/services/water-heaters",
    linkText: "Water heater installation and repair",
    key: [
      { n: 7, label: "Water heater" },
      { n: 8, label: "Hot-water lines to kitchen and bathroom" },
    ],
  },
];
