import type { ProjectServiceCategory, ServiceSlug } from "@/config/services";

/**
 * System colour coding used across the site:
 *   heat  = flame orange (furnaces, gas lines)
 *   cool  = ice blue (air conditioning, ductwork)
 *   water = amber (water heaters)
 *   dual  = heat + cool (heat pumps, thermostats)
 */
export type Tone = "heat" | "cool" | "water" | "dual";

export function toneFor(category: ProjectServiceCategory | ServiceSlug | null | undefined): Tone {
  switch (category) {
    case "furnaces":
    case "gas-lines":
      return "heat";
    case "air-conditioning":
    case "ductwork":
      return "cool";
    case "water-heaters":
      return "water";
    case "heat-pumps":
    case "thermostats":
    default:
      return "dual";
  }
}

/** Class sets for each tone on LIGHT surfaces (text colours meet AA). */
export const toneClasses: Record<Tone, { text: string; chip: string; bar: string; dot: string; ring: string }> = {
  heat: {
    text: "text-copper-700",
    chip: "bg-copper-100 text-copper-800 ring-1 ring-copper-500/30",
    bar: "bg-gradient-to-r from-copper-500 to-ember-500",
    dot: "bg-copper-500 shadow-[0_0_10px_2px_rgb(250_84_33/0.55)]",
    ring: "hover:ring-copper-500/40",
  },
  cool: {
    text: "text-ice-700",
    chip: "bg-ice-100 text-ice-700 ring-1 ring-ice-500/30",
    bar: "bg-gradient-to-r from-ice-500 to-midnight-500",
    dot: "bg-ice-500 shadow-[0_0_10px_2px_rgb(25_180_242/0.55)]",
    ring: "hover:ring-ice-500/40",
  },
  water: {
    text: "text-ember-700",
    chip: "bg-ember-100 text-ember-700 ring-1 ring-ember-500/40",
    bar: "bg-gradient-to-r from-ember-500 to-copper-500",
    dot: "bg-ember-500 shadow-[0_0_10px_2px_rgb(255_178_31/0.6)]",
    ring: "hover:ring-ember-500/40",
  },
  dual: {
    text: "text-midnight-700",
    chip: "bg-midnight-100 text-midnight-800 ring-1 ring-midnight-500/30",
    bar: "bg-gradient-to-r from-copper-500 via-ember-500 to-ice-500",
    dot: "bg-gradient-to-br from-copper-500 to-ice-500 shadow-[0_0_10px_2px_rgb(25_180_242/0.45)]",
    ring: "hover:ring-midnight-500/40",
  },
};
