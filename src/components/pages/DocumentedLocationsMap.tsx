/**
 * Stylised, not-to-scale schematic of places where completed projects are
 * documented, drawn around the western end of Lake Ontario. Positions are
 * approximate (projected from rough longitude/latitude). It is NOT a
 * service-area map: the HTML list beside it carries the same information.
 */

type Anchor = "start" | "end" | "middle";
interface Place {
  lon: number;
  lat: number;
  /** Label offset from the dot, in viewBox units. */
  dx: number;
  dy: number;
  anchor: Anchor;
}

/** Approximate positions for documented project cities. */
const PLACES: Record<string, Place> = {
  Waterloo: { lon: -80.52, lat: 43.46, dx: 0, dy: 30, anchor: "middle" },
  Hamilton: { lon: -79.87, lat: 43.26, dx: -14, dy: 6, anchor: "end" },
  Brampton: { lon: -79.76, lat: 43.73, dx: -14, dy: 6, anchor: "end" },
  Mississauga: { lon: -79.64, lat: 43.59, dx: -14, dy: 18, anchor: "end" },
  Etobicoke: { lon: -79.55, lat: 43.65, dx: 14, dy: 22, anchor: "start" },
  "North York": { lon: -79.42, lat: 43.77, dx: 14, dy: 6, anchor: "start" },
  "Richmond Hill": { lon: -79.44, lat: 43.88, dx: 14, dy: 0, anchor: "start" },
  Bradford: { lon: -79.56, lat: 44.11, dx: 14, dy: 6, anchor: "start" },
  Oshawa: { lon: -78.86, lat: 43.9, dx: 0, dy: -18, anchor: "middle" },
};

// Simple equirectangular projection with a cos(lat) correction.
const LON0 = -80.7;
const LAT0 = 44.2;
const SX = 300;
const SY = 417;
const px = (lon: number) => Math.round((lon - LON0) * SX);
const py = (lat: number) => Math.round((LAT0 - lat) * SY);
const pathFrom = (pts: Array<[number, number]>) =>
  pts.map(([lon, lat], i) => `${i ? "L" : "M"}${px(lon)} ${py(lat)}`).join("");

const NORTH_SHORE: Array<[number, number]> = [
  [-79.88, 43.27],
  [-79.8, 43.32],
  [-79.67, 43.44],
  [-79.58, 43.55],
  [-79.47, 43.6],
  [-79.38, 43.63],
  [-79.2, 43.7],
  [-79.08, 43.81],
  [-78.86, 43.86],
  [-78.5, 43.92],
];
const SOUTH_SHORE: Array<[number, number]> = [
  [-79.88, 43.25],
  [-79.56, 43.2],
  [-79.24, 43.18],
  [-79.06, 43.26],
  [-78.8, 43.33],
  [-78.5, 43.36],
];

export function hasSchematicPosition(city: string): boolean {
  return city in PLACES;
}

export function DocumentedLocationsMap({ cities, className = "" }: { cities: string[]; className?: string }) {
  const shown = cities.filter(hasSchematicPosition);
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 640 450"
        className="drawing h-auto w-full"
        role="img"
        aria-labelledby="locations-map-title locations-map-desc"
      >
        <title id="locations-map-title">Schematic of documented project locations, not to scale</title>
        <desc id="locations-map-desc">
          {`A stylised line drawing of the western end of Lake Ontario with dots for places where completed projects are documented: ${shown.join(", ")}. Positions are approximate. The same places are listed as text on this page.`}
        </desc>
        {/* lake: water hatching between the two shorelines */}
        <defs>
          <pattern id="lake-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 0V10" stroke="var(--hatch)" strokeWidth="1" />
          </pattern>
        </defs>
        <path
          d={`${pathFrom(NORTH_SHORE)}L${px(-78.5)} ${py(43.36)}${pathFrom([...SOUTH_SHORE].reverse()).replace(/^M/, "L")}Z`}
          fill="url(#lake-hatch)"
          stroke="none"
        />
        <path d={pathFrom(NORTH_SHORE)} className="ln" />
        <path d={pathFrom(SOUTH_SHORE)} className="ln" />
        <text
          x={px(-79.0)}
          y={py(43.5)}
          textAnchor="middle"
          className="fill-midnight-700 font-display text-[22px] tracking-[0.2em] uppercase"
        >
          Lake Ontario
        </text>

        {/* north arrow */}
        <g transform="translate(600 46)">
          <path className="ln" d="M0 22V-16M-7 -6 0 -18 7 -6" />
          <text y="40" textAnchor="middle" className="fill-ink-muted font-sans text-[13px] font-semibold">
            N
          </text>
        </g>

        {shown.map((city) => {
          const p = PLACES[city];
          const x = px(p.lon);
          const y = py(p.lat);
          return (
            <g key={city}>
              <circle cx={x} cy={y} r="9" className="ln-soft" />
              <circle cx={x} cy={y} r="4.5" className="fill-copper-700" />
              <text
                x={x + p.dx}
                y={y + p.dy}
                textAnchor={p.anchor}
                className="fill-ink font-sans text-[17px] font-semibold"
                paintOrder="stroke"
                stroke="var(--color-limestone-100)"
                strokeWidth="5"
                strokeLinejoin="round"
              >
                {city}
              </text>
            </g>
          );
        })}

        <text x="16" y="436" className="fill-ink-muted font-sans text-[13px] font-semibold tracking-[0.12em] uppercase">
          Schematic, not to scale
        </text>
      </svg>
      <figcaption className="mt-3 text-sm text-ink-muted">
        Schematic, not to scale. Dots mark places where completed projects are documented. They are not a map of
        where Don currently works.
      </figcaption>
    </figure>
  );
}
