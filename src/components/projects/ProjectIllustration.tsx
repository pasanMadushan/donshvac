import type { ReactNode } from "react";
import type { ProjectServiceCategory, PropertyType } from "@/config/services";

/**
 * Original architectural line drawings, one per project category, used where
 * no approved photo exists. Callers caption them as illustrations when they
 * accompany a specific project. Informative only when `title` is given;
 * otherwise decorative (aria-hidden).
 *
 * All drawings share a 400 × 300 viewBox and scale to their container.
 */

type DrawingKey = ProjectServiceCategory | "air-conditioning-rooftop" | "general";

function Ground({ y = 262 }: { y?: number }) {
  return (
    <g>
      <line x1="24" y1={y} x2="376" y2={y} className="ln" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={30 + i * 16} y1={y + 2} x2={22 + i * 16} y2={y + 10} className="ln-soft" />
      ))}
    </g>
  );
}

function Dimension({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} className="ln-soft" />
      <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} className="ln-soft" />
      <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} className="ln-soft" />
      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize="9" letterSpacing="1.5" fill="var(--line-soft)">
        {label}
      </text>
    </g>
  );
}

function Callout({ x, y, tx, ty, n }: { x: number; y: number; tx: number; ty: number; n: string }) {
  return (
    <g>
      <line x1={x} y1={y} x2={tx} y2={ty} className="ln-soft" />
      <circle cx={x} cy={y} r="2" fill="var(--line)" />
      <circle cx={tx} cy={ty} r="9" className="ln" />
      <text x={tx} y={ty + 3.5} textAnchor="middle" fontSize="10" fill="var(--line)">
        {n}
      </text>
    </g>
  );
}

const drawings: Record<DrawingKey, () => ReactNode> = {
  furnaces: () => (
    <g>
      <Ground />
      {/* Cabinet */}
      <rect x="140" y="60" width="120" height="202" className="ln" />
      <line x1="140" y1="150" x2="260" y2="150" className="ln" />
      {/* Burner door louvres */}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1="160" y1={78 + i * 9} x2="240" y2={78 + i * 9} className="ln-soft" />
      ))}
      {/* Blower door + filter slot */}
      <rect x="158" y="166" width="84" height="80" className="ln-soft" />
      <circle cx="200" cy="206" r="26" className="ln-soft" />
      <circle cx="200" cy="206" r="6" className="ln-soft" />
      <rect x="140" y="250" width="120" height="8" className="ln-soft" />
      {/* Supply plenum + venting */}
      <path d="M150 60 V34 H250 V60" className="ln" />
      <path d="M250 44 H320 V24" className="ln-soft" />
      <path d="M232 34 V14 M244 34 V14" className="ln" />
      {/* Gas supply with shut-off */}
      <path d="M260 120 H330 V262" className="ln" />
      <rect x="292" y="114" width="12" height="12" className="ln" />
      <Callout x={200} y={206} tx={84} ty={200} n="1" />
      <Callout x={242} y={24} tx={330} ty={70} n="2" />
      <Dimension x1={140} x2={260} y={284} label="FURNACE" />
    </g>
  ),
  "air-conditioning": () => (
    <g>
      <Ground />
      {/* Pad */}
      <rect x="110" y="250" width="180" height="12" className="ln-soft" />
      {/* Condenser cabinet with coil grille */}
      <rect x="122" y="100" width="156" height="150" className="ln" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={132 + i * 11.3} y1="114" x2={132 + i * 11.3} y2="240" className="ln-soft" />
      ))}
      {/* Fan top */}
      <ellipse cx="200" cy="100" rx="70" ry="12" className="ln" />
      <ellipse cx="200" cy="100" rx="40" ry="6" className="ln-soft" />
      <path d="M160 100 L240 100 M200 94 L200 106" className="ln-soft" />
      {/* Line set into the wall */}
      <path d="M278 200 H318 V150 H352" className="ln" />
      <path d="M278 212 H326 V160 H352" className="ln-soft" />
      <line x1="352" y1="40" x2="352" y2="262" className="ln" />
      {/* Disconnect */}
      <rect x="330" y="96" width="16" height="24" className="ln" />
      <Callout x={200} y={100} tx={90} ty={60} n="1" />
      <Callout x={318} y={170} tx={300} ty={60} n="2" />
      <Dimension x1={122} x2={278} y={284} label="CONDENSER" />
    </g>
  ),
  "air-conditioning-rooftop": () => (
    <g>
      {/* Roof deck and parapet */}
      <line x1="24" y1="240" x2="376" y2="240" className="ln" />
      <path d="M24 240 V220 H40 V240" className="ln-soft" />
      <path d="M360 240 V220 H376 V240" className="ln-soft" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={30 + i * 16} y1="242" x2={22 + i * 16} y2="250" className="ln-soft" />
      ))}
      {/* Curb */}
      <rect x="86" y="222" width="228" height="18" className="ln-soft" />
      {/* Packaged unit */}
      <rect x="92" y="120" width="216" height="102" className="ln" />
      <line x1="200" y1="120" x2="200" y2="222" className="ln" />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="104" y1={132 + i * 11} x2="190" y2={132 + i * 11} className="ln-soft" />
      ))}
      {/* Condenser fans */}
      <ellipse cx="236" cy="120" rx="24" ry="5" className="ln" />
      <ellipse cx="282" cy="120" rx="20" ry="4" className="ln" />
      {/* Access panels */}
      <rect x="212" y="140" width="40" height="64" className="ln-soft" />
      <rect x="260" y="140" width="38" height="64" className="ln-soft" />
      {/* Duct drop through the roof */}
      <path d="M130 240 V280 M170 240 V280" className="ln" />
      <Callout x={148} y={160} tx={70} ty={90} n="1" />
      <Callout x={236} y={118} tx={300} ty={70} n="2" />
      <Dimension x1={92} x2={308} y={104} label="ROOFTOP UNIT" />
    </g>
  ),
  "water-heaters": () => (
    <g>
      {/* Wall */}
      <line x1="40" y1="20" x2="40" y2="280" className="ln" />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1="40" y1={26 + i * 16} x2="30" y2={34 + i * 16} className="ln-soft" />
      ))}
      {/* Tankless unit */}
      <rect x="150" y="70" width="100" height="140" rx="4" className="ln" />
      <rect x="170" y="96" width="60" height="22" className="ln-soft" />
      <line x1="170" y1="140" x2="230" y2="140" className="ln-soft" />
      <line x1="170" y1="150" x2="230" y2="150" className="ln-soft" />
      {/* Vent */}
      <path d="M190 70 V40 H90 M210 70 V30 H90" className="ln" />
      {/* Piping below: gas, cold in, hot out */}
      <path d="M170 210 V264" className="ln" />
      <path d="M200 210 V246 H300" className="ln" />
      <path d="M230 210 V230 H300" className="ln" />
      <rect x="164" y="232" width="12" height="12" className="ln" />
      <text x="306" y="249" fontSize="9" letterSpacing="1.5" fill="var(--line-soft)">COLD</text>
      <text x="306" y="233" fontSize="9" letterSpacing="1.5" fill="var(--line-soft)">HOT</text>
      <Callout x={200} y={107} tx={320} ty={90} n="1" />
      <Callout x={170} y={238} tx={90} ty={250} n="2" />
      <Dimension x1={150} x2={250} y={56} label="TANKLESS" />
    </g>
  ),
  "heat-pumps": () => (
    <g>
      <Ground />
      {/* Exterior wall */}
      <line x1="220" y1="20" x2="220" y2="262" className="ln" />
      <line x1="228" y1="20" x2="228" y2="262" className="ln-soft" />
      {/* Outdoor unit */}
      <rect x="40" y="150" width="150" height="104" className="ln" />
      <circle cx="98" cy="202" r="38" className="ln" />
      <circle cx="98" cy="202" r="26" className="ln-soft" />
      <path d="M98 176 V228 M72 202 H124 M80 184 L116 220 M116 184 L80 220" className="ln-soft" />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1="150" y1={164 + i * 14} x2="180" y2={164 + i * 14} className="ln-soft" />
      ))}
      <line x1="48" y1="254" x2="48" y2="262" className="ln" />
      <line x1="182" y1="254" x2="182" y2="262" className="ln" />
      {/* Line set through wall */}
      <path d="M190 170 H210 V120 H290" className="ln" />
      <path d="M190 182 H214 V130 H290" className="ln-soft" />
      {/* Indoor air handler */}
      <rect x="290" y="70" width="70" height="170" className="ln" />
      <line x1="290" y1="140" x2="360" y2="140" className="ln-soft" />
      <path d="M300 150 L350 150 L300 170 L350 170 L300 190 L350 190" className="ln-soft" />
      <path d="M296 70 V40 H354 V70" className="ln" />
      <Callout x={98} y={202} tx={70} ty={100} n="1" />
      <Callout x={325} y={160} tx={325} ty={20} n="2" />
      <Dimension x1={40} x2={190} y={284} label="OUTDOOR" />
      <Dimension x1={290} x2={360} y={284} label="INDOOR" />
    </g>
  ),
  ductwork: () => (
    <g>
      {/* Joists */}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={40 + i * 46} y="30" width="6" height="40" className="ln-soft" />
      ))}
      <line x1="24" y1="30" x2="376" y2="30" className="ln" />
      {/* Furnace / plenum */}
      <rect x="40" y="150" width="70" height="112" className="ln" />
      <path d="M48 150 V110 H102 V150" className="ln" />
      {/* Main trunk */}
      <path d="M102 112 H360 V140 H102" className="ln" />
      <path d="M150 112 V140 M210 112 V140 M270 112 V140 M330 112 V140" className="ln-soft" />
      {/* Branches up to registers */}
      {[160, 230, 300].map((x) => (
        <g key={x}>
          <path d={`M${x} 112 V84 M${x + 14} 112 V84`} className="ln" />
          <rect x={x - 6} y="76" width="26" height="8" className="ln" />
        </g>
      ))}
      {/* Branch down */}
      <path d="M340 140 V200 M352 140 V200" className="ln" />
      <rect x="334" y="200" width="24" height="8" className="ln" />
      <line x1="24" y1="262" x2="376" y2="262" className="ln" />
      <Callout x={240} y={126} tx={240} ty={210} n="1" />
      <Callout x={167} y={80} tx={120} ty={56} n="2" />
      <Dimension x1={102} x2={360} y={240} label="SUPPLY TRUNK" />
    </g>
  ),
  thermostats: () => (
    <g>
      {/* Wall panel with skirting */}
      <rect x="40" y="20" width="320" height="250" className="ln-soft" />
      <line x1="40" y1="250" x2="360" y2="250" className="ln-soft" />
      {/* Round thermostat */}
      <circle cx="200" cy="130" r="64" className="ln" />
      <circle cx="200" cy="130" r="52" className="ln-soft" />
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const r1 = 56;
        const r2 = i % 3 === 0 ? 62 : 59;
        return (
          <line
            key={i}
            x1={200 + r1 * Math.cos(a)}
            y1={130 + r1 * Math.sin(a)}
            x2={200 + r2 * Math.cos(a)}
            y2={130 + r2 * Math.sin(a)}
            className="ln-soft"
          />
        );
      })}
      <text x="200" y="142" textAnchor="middle" fontSize="34" fill="var(--line)" letterSpacing="1">
        21°
      </text>
      {/* Wire run */}
      <path d="M200 194 V250" className="ln-soft" strokeDasharray="4 4" />
      <Callout x={200} y={66} tx={300} ty={50} n="1" />
      <Callout x={200} y={230} tx={110} ty={220} n="2" />
      <Dimension x1={136} x2={264} y={30} label="THERMOSTAT" />
    </g>
  ),
  "gas-lines": () => (
    <g>
      <Ground />
      {/* Wall */}
      <line x1="60" y1="20" x2="60" y2="262" className="ln" />
      {/* Meter */}
      <rect x="76" y="120" width="70" height="80" rx="4" className="ln" />
      <circle cx="98" cy="146" r="10" className="ln-soft" />
      <circle cx="124" cy="146" r="10" className="ln-soft" />
      <rect x="90" y="172" width="42" height="14" className="ln-soft" />
      <path d="M100 200 V262 M122 200 V230" className="ln" />
      {/* Run along the wall to the appliance */}
      <path d="M122 120 V90 H330 V160" className="ln" />
      <path d="M122 114 V84 H336 V160" className="ln-soft" />
      {/* Fittings */}
      {[170, 230, 290].map((x) => (
        <rect key={x} x={x - 3} y="82" width="6" height="12" className="ln" />
      ))}
      {/* Shut-off valve */}
      <path d="M322 130 L340 142 L340 130 L322 142 Z" className="ln" />
      <path d="M331 136 V120 H346" className="ln" />
      {/* Appliance stub */}
      <rect x="290" y="160" width="80" height="102" className="ln-soft" />
      <Callout x={111} y={160} tx={190} ty={200} n="1" />
      <Callout x={331} y={136} tx={250} ty={140} n="2" />
      <Dimension x1={122} x2={333} y={60} label="GAS RUN" />
    </g>
  ),
  general: () => (
    <g>
      <Ground />
      {/* House section */}
      <path d="M80 262 V130 L200 50 L320 130 V262" className="ln" />
      <line x1="80" y1="190" x2="320" y2="190" className="ln-soft" />
      {/* Equipment in basement */}
      <rect x="110" y="206" width="40" height="56" className="ln" />
      <path d="M130 206 V160 H280" className="ln-soft" />
      <rect x="250" y="216" width="28" height="46" rx="3" className="ln" />
      {/* Registers */}
      <rect x="180" y="180" width="24" height="6" className="ln-soft" />
      <rect x="240" y="120" width="24" height="6" className="ln-soft" />
      <path d="M252 160 V126" className="ln-soft" />
      <Callout x={130} y={230} tx={50} ty={200} n="1" />
      <Callout x={264} y={240} tx={350} ty={200} n="2" />
    </g>
  ),
};

export function illustrationKey(
  category: ProjectServiceCategory | null | undefined,
  variant: "default" | "rooftop" = "default",
): DrawingKey {
  if (!category) return "general";
  if (category === "air-conditioning" && variant === "rooftop") return "air-conditioning-rooftop";
  return category;
}

export function ProjectIllustration({
  category,
  className = "",
  title,
  variant,
  propertyType,
}: {
  category: ProjectServiceCategory | null;
  className?: string;
  /** Accessible name; omit (decorative) when adjacent text already describes it. */
  title?: string;
  /** "rooftop" draws a packaged rooftop unit for air-conditioning. */
  variant?: "default" | "rooftop";
  /** When commercial and no variant is given, air-conditioning uses the rooftop drawing. */
  propertyType?: PropertyType | null;
}) {
  const resolved = variant ?? (propertyType === "commercial" ? "rooftop" : "default");
  const key = illustrationKey(category, resolved);
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid meet"
      className={`drawing block h-auto w-full ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      data-category={key}
      fontFamily="var(--font-sans)"
    >
      {title ? <title>{title}</title> : null}
      {drawings[key]()}
    </svg>
  );
}
