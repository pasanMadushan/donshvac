import type { MetadataRoute } from "next";
import { business } from "@/config/business";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: business.displayName,
    short_name: business.shortName,
    description: "Heating, cooling and hot water for homes and businesses.",
    start_url: "/",
    scope: "/",
    display: "browser",
    lang: "en-CA",
    theme_color: "#0f1e33",
    background_color: "#f4efe6",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
