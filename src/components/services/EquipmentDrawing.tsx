import type { ServiceSlug } from "@/config/services";

/**
 * Original architectural line drawings of each service's equipment.
 * Decorative (aria-hidden): the surrounding text names the equipment.
 */
export function EquipmentDrawing({ slug, className = "" }: { slug: ServiceSlug | "commercial"; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 300"
      className={`drawing ${className}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Ground line and hatch shared by every drawing */}
      <line x1="12" y1="272" x2="228" y2="272" className="ln" />
      {[24, 48, 72, 96, 120, 144, 168, 192, 216].map((x) => (
        <line key={x} x1={x} y1="272" x2={x - 10} y2="284" className="ln-soft" />
      ))}
      {slug === "furnaces" ? <Furnace /> : null}
      {slug === "air-conditioning" ? <Condenser /> : null}
      {slug === "water-heaters" ? <WaterTank /> : null}
      {slug === "heat-pumps" ? <HeatPump /> : null}
      {slug === "commercial" ? <Rooftop /> : null}
    </svg>
  );
}

function Dimension({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} className="ln-soft" />
      <line x1={x - 4} y1={y1} x2={x + 4} y2={y1} className="ln-soft" />
      <line x1={x - 4} y1={y2} x2={x + 4} y2={y2} className="ln-soft" />
    </g>
  );
}

function Furnace() {
  return (
    <g>
      {/* Supply plenum and duct */}
      <path d="M78 70 V40 H162 V70" className="ln" />
      <path d="M162 48 H212 M162 62 H212" className="ln-soft" />
      {/* Cabinet */}
      <rect x="70" y="70" width="100" height="202" className="ln" />
      <line x1="70" y1="150" x2="170" y2="150" className="ln" />
      {/* Burner door louvres */}
      {[88, 98, 108, 118, 128].map((y) => (
        <line key={y} x1="86" y1={y} x2="154" y2={y} className="ln-soft" />
      ))}
      {/* Blower compartment */}
      <circle cx="120" cy="210" r="34" className="ln" />
      <circle cx="120" cy="210" r="10" className="ln-soft" />
      {[0, 45, 90, 135].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={120 + Math.cos(r) * 12}
            y1={210 + Math.sin(r) * 12}
            x2={120 + Math.cos(r) * 32}
            y2={210 + Math.sin(r) * 32}
            className="ln-soft"
          />
        );
      })}
      {/* Vent pipe */}
      <path d="M150 70 V20" className="ln" />
      <path d="M158 70 V20" className="ln" />
      <Dimension x={44} y1={70} y2={272} />
      {/* Filter slot */}
      <rect x="62" y="252" width="8" height="16" className="ln-soft" />
    </g>
  );
}

function Condenser() {
  return (
    <g>
      <rect x="48" y="112" width="144" height="152" className="ln" />
      <rect x="40" y="264" width="160" height="8" className="ln-soft" />
      {/* Coil fins */}
      {Array.from({ length: 14 }, (_, i) => 58 + i * 9.5).map((x) => (
        <line key={x} x1={x} y1="126" x2={x} y2="252" className="ln-soft" />
      ))}
      {/* Fan grille on top (in elevation, a shallow ellipse) */}
      <ellipse cx="120" cy="112" rx="56" ry="10" className="ln" />
      <ellipse cx="120" cy="112" rx="18" ry="4" className="ln-soft" />
      {/* Refrigerant lines to the house */}
      <path d="M192 230 H214 V60" className="ln" />
      <path d="M192 240 H222 V60" className="ln-soft" />
      {/* Airflow arrows */}
      <path d="M100 92 L100 60 M94 68 L100 60 L106 68" className="ln-soft" />
      <path d="M140 92 L140 60 M134 68 L140 60 L146 68" className="ln-soft" />
      <Dimension x={26} y1={112} y2={264} />
    </g>
  );
}

function WaterTank() {
  return (
    <g>
      {/* Tank body */}
      <path d="M78 70 Q78 56 120 56 Q162 56 162 70 V258 Q162 266 120 266 Q78 266 78 258 Z" className="ln" />
      <line x1="78" y1="80" x2="162" y2="80" className="ln-soft" />
      <line x1="78" y1="246" x2="162" y2="246" className="ln-soft" />
      {/* Anode rod and dip tube (dashed, inside) */}
      <line x1="108" y1="56" x2="108" y2="220" className="ln-soft" strokeDasharray="4 4" />
      <line x1="132" y1="56" x2="132" y2="236" className="ln-soft" strokeDasharray="2 5" />
      {/* Cold in, hot out */}
      <path d="M108 56 V30 H70" className="ln" />
      <path d="M132 56 V30 H200" className="ln" />
      {/* Relief valve and discharge pipe */}
      <path d="M162 100 H176 V240" className="ln" />
      <rect x="160" y="94" width="10" height="12" className="ln-soft" />
      {/* Drain valve */}
      <path d="M100 250 H88 V258" className="ln-soft" />
      {/* Stand */}
      <line x1="84" y1="266" x2="84" y2="272" className="ln" />
      <line x1="156" y1="266" x2="156" y2="272" className="ln" />
      <Dimension x={50} y1={56} y2={266} />
    </g>
  );
}

function HeatPump() {
  return (
    <g>
      {/* House wall */}
      <line x1="196" y1="20" x2="196" y2="272" className="ln" />
      {[40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260].map((y) => (
        <line key={y} x1="196" y1={y} x2="208" y2={y - 10} className="ln-soft" />
      ))}
      {/* Outdoor unit, front-discharge */}
      <rect x="30" y="150" width="140" height="104" className="ln" />
      <circle cx="84" cy="202" r="38" className="ln" />
      <circle cx="84" cy="202" r="26" className="ln-soft" />
      <circle cx="84" cy="202" r="6" className="ln-soft" />
      <line x1="84" y1="164" x2="84" y2="240" className="ln-soft" />
      <line x1="46" y1="202" x2="122" y2="202" className="ln-soft" />
      {/* Side coil */}
      {[136, 144, 152, 160].map((x) => (
        <line key={x} x1={x} y1="162" x2={x} y2="242" className="ln-soft" />
      ))}
      {/* Raised stand above snow line */}
      <line x1="40" y1="254" x2="40" y2="272" className="ln" />
      <line x1="160" y1="254" x2="160" y2="272" className="ln" />
      <line x1="20" y1="262" x2="176" y2="262" className="ln-soft" strokeDasharray="3 4" />
      {/* Line set into the house */}
      <path d="M170 176 H184 V96 H196" className="ln" />
      {/* Heat flow arrows: in and out */}
      <path d="M60 120 C 100 96, 140 96, 180 108" className="ln-soft" />
      <path d="M172 100 L182 108 L170 112" className="ln-soft" />
      <path d="M180 132 C 140 140, 100 140, 60 128" className="ln-soft" />
      <path d="M70 122 L58 128 L68 136" className="ln-soft" />
    </g>
  );
}

function Rooftop() {
  return (
    <g>
      {/* Building parapet and roof */}
      <path d="M12 200 H228" className="ln" />
      <path d="M12 192 H228" className="ln-soft" />
      {/* Building facade below */}
      {[36, 84, 132, 180].map((x) => (
        <rect key={x} x={x} y="214" width="28" height="40" className="ln-soft" />
      ))}
      {/* Rooftop unit */}
      <rect x="54" y="110" width="132" height="82" className="ln" />
      <line x1="54" y1="130" x2="186" y2="130" className="ln-soft" />
      {Array.from({ length: 10 }, (_, i) => 66 + i * 12).map((x) => (
        <line key={x} x1={x} y1="138" x2={x} y2="184" className="ln-soft" />
      ))}
      <ellipse cx="90" cy="110" rx="22" ry="5" className="ln" />
      <ellipse cx="150" cy="110" rx="22" ry="5" className="ln" />
      {/* Curb */}
      <rect x="62" y="192" width="116" height="8" className="ln-soft" />
      <Dimension x={34} y1={110} y2={200} />
    </g>
  );
}
