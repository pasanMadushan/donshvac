import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { business } from "@/config/business";

/** Share-image palette (mirrors src/app/globals.css @theme tokens). */
export const ogColors = {
  midnight950: "#0a1526",
  midnight900: "#0f1e33",
  midnight700: "#1f3a63",
  midnight300: "#9fb3cf",
  limestone100: "#f4efe6",
  limestone300: "#d8ccb6",
  copper300: "#e8a877",
  copper500: "#c26a32",
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;

type OgFont = {
  name: string;
  data: ArrayBuffer | Buffer;
  weight: 500 | 700;
  style: "normal";
};

const FONT_DIR = join(process.cwd(), "src/lib/og/fonts");

// Started at module evaluation (not during render) so prerendering treats the
// font bytes as a predictable value rather than request-time I/O.
const fontsPromise: Promise<OgFont[]> = Promise.all([
  readFile(join(FONT_DIR, "barlow-condensed-latin-700-normal.woff")),
  readFile(join(FONT_DIR, "instrument-sans-latin-500-normal.woff")),
]).then(([display, body]) => [
  { name: "Barlow Condensed", data: display, weight: 700, style: "normal" },
  { name: "Instrument Sans", data: body, weight: 500, style: "normal" },
]);

/** Fonts for ImageResponse (satori needs woff/ttf, not woff2). Local files only. */
export function ogFonts(): Promise<OgFont[]> {
  return fontsPromise;
}

/** Copper hairline drawing of a house section with furnace, ducts and tank. */
export function OgHouseSection({ width = 420, height = 420 }: { width?: number; height?: number }) {
  const c = ogColors.copper300;
  const soft = "rgba(232,168,119,0.45)";
  return (
    <svg width={width} height={height} viewBox="0 0 420 420" fill="none">
      {/* ground line */}
      <path d="M10 380 H410" stroke={soft} strokeWidth={1.5} />
      {/* roof and walls */}
      <path d="M40 180 L210 50 L380 180" stroke={c} strokeWidth={3} />
      <path d="M70 160 V380 M350 160 V380" stroke={c} strokeWidth={2} />
      {/* chimney / flue */}
      <path d="M290 105 V60 H315 V125" stroke={c} strokeWidth={2} />
      {/* floors */}
      <path d="M70 270 H350" stroke={c} strokeWidth={1.5} />
      <path d="M70 300 H350" stroke={soft} strokeWidth={1} strokeDasharray="6 6" />
      {/* furnace in basement */}
      <rect x="110" y="310" width="60" height="70" stroke={c} strokeWidth={2} />
      <path d="M120 330 H160 M120 345 H160" stroke={soft} strokeWidth={1.5} />
      {/* supply duct up to the main floor */}
      <path d="M140 310 V285 H260 V255" stroke={c} strokeWidth={1.5} />
      <path d="M200 285 V255" stroke={c} strokeWidth={1.5} />
      <path d="M190 255 H210 M250 255 H270" stroke={c} strokeWidth={2} />
      {/* vent from furnace to flue */}
      <path d="M160 310 V295 H302 V125" stroke={soft} strokeWidth={1.5} strokeDasharray="4 5" />
      {/* water heater */}
      <rect x="230" y="320" width="40" height="60" rx="18" stroke={c} strokeWidth={2} />
      {/* outdoor condenser */}
      <rect x="366" y="340" width="34" height="40" stroke={c} strokeWidth={1.5} />
      <circle cx="383" cy="360" r="11" stroke={soft} strokeWidth={1.5} />
      {/* main-floor window */}
      <rect x="95" y="190" width="50" height="55" stroke={soft} strokeWidth={1.5} />
      <path d="M120 190 V245" stroke={soft} strokeWidth={1} />
      {/* dimension callout */}
      <path d="M30 270 V380 M24 270 H36 M24 380 H36" stroke={soft} strokeWidth={1} />
    </svg>
  );
}

export interface OgCardProps {
  /** Small uppercase line above the title, e.g. "Completed project". */
  eyebrow?: string;
  /** Main heading (rendered uppercase in Barlow Condensed). */
  title: string;
  /** Supporting line in Instrument Sans. */
  subtitle?: string;
  /** Replace the default house-section drawing (null hides it). */
  drawing?: ReactNode | null;
  /** Show the brand name + phone footer (default true). */
  showContact?: boolean;
}

/**
 * Reusable 1200x630 share card. Use inside `new ImageResponse(<OgCard …/>,
 * { ...OG_SIZE, fonts: await ogFonts() })`. Every element with several
 * children uses display:flex, as satori requires.
 */
export function OgCard({ eyebrow, title, subtitle, drawing, showContact = true }: OgCardProps) {
  const titleSize = title.length > 60 ? 64 : title.length > 36 ? 80 : 96;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: ogColors.midnight900,
        backgroundImage: `linear-gradient(to right, rgba(159,179,207,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(159,179,207,0.08) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        color: ogColors.limestone100,
        fontFamily: "Instrument Sans",
        padding: "56px 64px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 96, height: 3, background: ogColors.copper300, marginBottom: 28 }} />
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: ogColors.copper300,
                marginBottom: 18,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: titleSize,
              lineHeight: 0.95,
              textTransform: "uppercase",
              maxWidth: 700,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                fontSize: 32,
                lineHeight: 1.3,
                color: ogColors.limestone300,
                marginTop: 28,
                maxWidth: 660,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        {showContact ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderTop: `1px solid rgba(232,168,119,0.45)`,
              paddingTop: 22,
              fontSize: 28,
              maxWidth: 700,
            }}
          >
            <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              {business.displayName}
            </div>
            <div style={{ display: "flex", marginLeft: 28, color: ogColors.copper300 }}>{business.phone.display}</div>
          </div>
        ) : null}
      </div>
      {drawing === null ? null : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 420 }}>
          {drawing ?? <OgHouseSection />}
        </div>
      )}
    </div>
  );
}
