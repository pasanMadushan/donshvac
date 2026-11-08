/**
 * Original architectural line drawings for the commercial and about pages.
 * Decorative: adjacent text already says what they show.
 */

/** Section through a flat-roofed building with a rooftop unit and gas line. */
export function RooftopSectionDrawing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 360" className={`drawing h-auto w-full ${className}`} aria-hidden="true" focusable="false">
      {/* ground */}
      <path className="ln" d="M10 330H470" />
      <path className="ln-soft" d="M10 338h460" strokeDasharray="2 6" />
      {/* building */}
      <path className="ln" d="M60 330V150H400V330" />
      <path className="ln" d="M52 150H408" />
      <path className="ln-soft" d="M60 210H400M60 270H400" />
      {/* windows */}
      {[90, 160, 230, 300].map((x) => (
        <g key={x}>
          <rect x={x} y={170} width="44" height="26" className="ln-soft" />
          <rect x={x} y={230} width="44" height="26" className="ln-soft" />
        </g>
      ))}
      <rect x="196" y="286" width="56" height="44" className="ln" />
      {/* rooftop unit */}
      <rect x="250" y="96" width="120" height="54" className="ln" />
      <path className="ln-soft" d="M258 106h40M258 114h40M258 122h40M258 130h40M258 138h40" />
      <circle cx="338" cy="123" r="18" className="ln" />
      <path className="ln-soft" d="M338 105v36M320 123h36M325 110l26 26M351 110l-26 26" />
      <path className="ln" d="M262 150v-4M358 150v-4" />
      {/* supply and return ducts into the building */}
      <path className="ln" d="M276 150v48h-40v12M300 150v30h60v30" />
      {/* roof hatch and ladder */}
      <rect x="110" y="140" width="32" height="10" className="ln" />
      <path className="ln-soft" d="M114 150v60M138 150v60M114 162h24M114 174h24M114 186h24M114 198h24" />
      {/* gas line from meter, along wall, up to unit */}
      <rect x="410" y="290" width="22" height="28" className="ln" />
      <path className="ln" d="M421 290V136H370" />
      <path className="ln-soft" d="M421 300v30" />
      {/* dimension callouts */}
      <path className="ln-soft" d="M250 80h120M250 76v8M370 76v8" />
      <path className="ln-soft" d="M30 150v180M26 150h8M26 330h8" />
      <text x="310" y="72" textAnchor="middle" className="fill-ink-muted font-sans text-[11px] tracking-[0.12em]">
        ROOFTOP UNIT
      </text>
      <text x="440" y="280" textAnchor="end" className="fill-ink-muted font-sans text-[11px] tracking-[0.12em]">
        GAS
      </text>
      <text x="126" y="132" textAnchor="middle" className="fill-ink-muted font-sans text-[11px] tracking-[0.12em]">
        ACCESS
      </text>
    </svg>
  );
}

/** Monogram plate used in place of a portrait (no approved photo of Don). */
export function MonogramDrawing({ initials, className = "" }: { initials: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 400" className={`drawing h-auto w-full ${className}`} aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="296" height="376" className="ln" />
      <rect x="28" y="28" width="264" height="344" className="ln-soft" />
      {/* construction lines */}
      <path className="ln-soft" d="M160 28v344M28 200h264" strokeDasharray="3 7" />
      <circle cx="160" cy="200" r="104" className="ln-soft" />
      <circle cx="160" cy="200" r="118" className="ln-soft" strokeDasharray="2 5" />
      <text
        x="160"
        y="236"
        textAnchor="middle"
        className="fill-midnight-900 font-display text-[104px] font-semibold tracking-[0.04em]"
      >
        {initials}
      </text>
      <path className="ln" d="M92 262h136" />
      <text x="160" y="290" textAnchor="middle" className="fill-copper-700 font-sans text-[12px] font-semibold tracking-[0.3em]">
        FOUNDER
      </text>
      {/* corner ticks */}
      <path className="ln" d="M28 52V28h24M268 28h24v24M292 348v24h-24M52 372H28v-24" />
    </svg>
  );
}
