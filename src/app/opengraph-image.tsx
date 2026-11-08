import { ImageResponse } from "next/og";
import { business } from "@/config/business";
import { OG_SIZE, OgCard, ogFonts } from "@/lib/og/brand";

export const alt = `${business.displayName}: heating, cooling and hot water for homes and businesses. Call ${business.phone.display}.`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgCard title={business.displayName} subtitle="Heating, cooling and hot water for homes and businesses" />,
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
