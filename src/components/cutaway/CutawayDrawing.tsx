import type { ReactNode } from "react";
import s from "./cutaway.module.css";

/**
 * Original architectural cutaway of a two-storey Ontario house: basement
 * furnace with supply and return ducts, outdoor condenser with refrigerant
 * line set, and a water heater with hot-water lines to the kitchen and
 * bathroom. Server-rendered and fully readable without JavaScript. Numbered
 * tags match the key in `systems.ts`.
 *
 * Groups carry `data-system` (space-separated) so the client controls can
 * highlight one system by setting `data-active` on the wrapping frame.
 */

function Tag({ n, x, y, to }: { n: number; x: number; y: number; to: [number, number] }) {
  return (
    <g>
      <path d={`M${x} ${y} L${to[0]} ${to[1]}`} className={s.leader} />
      <circle cx={to[0]} cy={to[1]} r={2.2} className={s.cut} />
      <circle cx={x} cy={y} r={13} className={s.tag} />
      <text x={x} y={y + 5} textAnchor="middle" className={s.tagText}>
        {n}
      </text>
    </g>
  );
}

function Sys({ system, children }: { system: string; children: ReactNode }) {
  return <g data-system={system}>{children}</g>;
}

export function CutawayDrawing() {
  return (
    <svg
      viewBox="0 0 800 620"
      className={`drawing ${s.svg}`}
      role="img"
      aria-labelledby="cutaway-title cutaway-desc"
      focusable="false"
    >
      <title id="cutaway-title">Cutaway illustration of a two-storey house and its heating, cooling and hot-water systems</title>
      <desc id="cutaway-desc">
        A section through a two-storey house with a pitched roof and a basement. In the basement, a furnace (1) sends
        warm air through supply ducts (2) up to the kitchen and an upstairs bedroom, and a return duct brings air back
        from the living room. A thermostat (3) is on the living-room wall. Outside, an air conditioner condenser or heat
        pump (4) sits on a pad beside the house, and a refrigerant line set (5) runs through the wall to the indoor coil
        (6) on top of the furnace. A water heater (7) in the basement sends hot water through pipes (8) up to the kitchen
        sink and the bathroom.
      </desc>

      <defs>
        <pattern id="cw-earth" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V9" className={s.hatchLine} />
        </pattern>
        <pattern id="cw-framing" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <path d="M0 0 V6" className={s.hatchLine} />
        </pattern>
      </defs>

      {/* ---------- Structure ---------- */}
      <g data-structure="">
        <text x="24" y="34" className={s.note}>SECTION A–A</text>
        <path d="M24 44 H130" className="ln-soft" />

        {/* Earth outside the foundation */}
        <path d="M20 455 H176 V600 H20 Z" fill="url(#cw-earth)" />
        <path d="M584 455 H780 V600 H584 Z" fill="url(#cw-earth)" />
        <path d="M20 455 H176 M584 455 H618 M722 455 H780" className="ln" />

        {/* Basement */}
        <rect x="190" y="445" width="380" height="130" className={s.basement} />
        <path d="M176 445 V585 H584 V445 M190 445 V575 H570 V445" className="ln" />
        <path d="M176 445 H190 V575 H176 M570 445 H584 V585 H570" fill="url(#cw-framing)" />

        {/* Rooms */}
        <rect x="186" y="302" width="388" height="123" className={s.room} />
        <rect x="186" y="180" width="388" height="110" className={s.room} />

        {/* Exterior walls */}
        <path d="M176 180 V445 M186 180 V425 M574 180 V425 M584 180 V445" className="ln" />
        {/* Windows (breaks in the wall, drawn as glazing lines) */}
        <path d="M176 336 H186 M176 384 H186 M181 336 V384" className="ln-soft" />
        <path d="M574 210 H584 M574 252 H584 M579 210 V252" className="ln-soft" />
        <path d="M176 210 H186 M176 252 H186 M181 210 V252" className="ln-soft" />

        {/* Floors */}
        <rect x="176" y="425" width="408" height="20" fill="url(#cw-framing)" />
        <path d="M176 425 H584 M176 445 H584" className="ln" />
        <rect x="186" y="290" width="388" height="12" fill="url(#cw-framing)" />
        <path d="M186 290 H574 M186 302 H574" className="ln" />
        <rect x="176" y="168" width="408" height="12" fill="url(#cw-framing)" />
        <path d="M176 168 H584 M176 180 H584" className="ln" />

        {/* Partitions */}
        <path d="M385 302 V425 M397 302 V425" className="ln" />
        <path d="M420 180 V290 M430 180 V290" className="ln" />
        {/* Door openings */}
        <path d="M385 340 H397 M420 230 H430" className="ln-soft" />

        {/* Roof */}
        <path d="M140 188 L380 50 L620 188 L604 188 L380 66 L156 188 Z" fill="url(#cw-framing)" />
        <path d="M140 188 L380 50 L620 188 M156 188 L380 66 L604 188 M140 188 H156 M604 188 H620" className="ln" />
        <path d="M380 66 V168 M280 168 L380 96 L480 168" className="ln-soft" />

        {/* Furniture hints */}
        <path d="M212 425 V398 H304 V425 M212 408 H304 M220 398 V388 H296 V398" className="ln-soft" />
        <path d="M466 425 V385 H574 M466 391 H574 M500 320 H574 V346 H500 Z M500 385 V378 H534 V385" className="ln-soft" />
        <path d="M228 290 V264 H334 V290 M228 274 H334 M228 264 V248" className="ln-soft" />
        <path d="M440 290 V268 H508 V290 M446 268 V274 H502 V268" className="ln-soft" />
        <path d="M520 290 V256 H570 M530 256 V250 H562 V256" className="ln-soft" />

        <text x="200" y="326" className={s.note}>LIVING</text>
        <text x="410" y="326" className={s.note}>KITCHEN</text>
        <text x="200" y="204" className={s.note}>BEDROOM</text>
        <text x="444" y="204" className={s.note}>BATH</text>
        <text x="350" y="566" className={s.note}>BASEMENT</text>
        <text x="726" y="474" className={s.note}>GRADE</text>
      </g>

      {/* ---------- Heating + cooling: ducts and thermostat ---------- */}
      <Sys system="heating cooling">
        {/* Supply plenum and trunk */}
        <rect x="268" y="466" width="56" height="12" className={`ln ${s.eq}`} />
        <rect x="324" y="450" width="212" height="16" className={`ln ${s.eq}`} />
        {/* Kitchen floor register branch */}
        <rect x="516" y="425" width="16" height="25" className={`ln ${s.eq}`} />
        <path d="M512 425 H536" className="ln" />
        {/* Riser in the partition to the bedroom */}
        <rect x="388" y="302" width="8" height="148" className={`ln ${s.eq}`} />
        <rect x="384" y="290" width="16" height="12" className={`ln ${s.eq}`} />
        <path d="M380 290 H404" className="ln" />
        {/* Return: grille in living room, down the wall cavity, into the furnace */}
        <path d="M188 396 H200 V420 H188 Z M188 402 H200 M188 408 H200 M188 414 H200" className="ln" />
        <path d="M190 420 V450 H246 V520 H262 M202 420 V466 H230 V540 H262" className="ln-soft" />
        {/* Thermostat */}
        <rect x="368" y="350" width="14" height="18" className={`ln ${s.eq}`} />
        <circle cx="375" cy="359" r="3.5" className="ln" />

        <path d="M296 476 V458 H526 V432" className={s.flow} />
        <path d="M392 458 V300" className={s.flow} />
        <path d="M195 412 V444 H238 V530 H262" className={`${s.flow} ${s.flowReturn}`} />

        <Tag n={2} x={362} y={238} to={[392, 292]} />
        <Tag n={3} x={330} y={346} to={[368, 358]} />
      </Sys>

      {/* ---------- Heating: furnace and gas supply ---------- */}
      <Sys system="heating">
        <rect x="262" y="498" width="68" height="77" className={`ln ${s.eq}`} />
        <path d="M268 506 H324 V540 H268 Z M274 548 H318 M274 554 H318 M274 560 H318 M274 566 H318" className="ln-soft" />
        <path d="M282 528 q4 -10 8 0 q4 -10 8 0 q4 -10 8 0" className="ln-soft" />
        {/* Gas supply from the meter */}
        <rect x="146" y="420" width="18" height="24" className={`ln ${s.eq}`} />
        <path d="M164 438 H214 V570 H262" className="ln-soft" strokeDasharray="5 3" />
        <Tag n={1} x={112} y={520} to={[262, 520]} />
      </Sys>

      {/* ---------- Cooling: condenser, line set, indoor coil ---------- */}
      <Sys system="cooling">
        {/* Pad and condenser */}
        <rect x="618" y="452" width="104" height="8" className={`ln ${s.eq}`} />
        <rect x="628" y="392" width="84" height="60" className={`ln ${s.eq}`} />
        <path
          d="M638 400 V444 M646 400 V444 M654 400 V444 M662 400 V444 M670 400 V444 M678 400 V444 M686 400 V444 M694 400 V444 M702 400 V444"
          className="ln-soft"
        />
        <path d="M640 392 V386 H700 V392" className="ln" />
        {/* Indoor coil above the furnace */}
        <rect x="262" y="478" width="68" height="20" className={`ln ${s.eq}`} />
        <path d="M270 496 L296 481 L322 496" className="ln-soft" />
        {/* Line set: through the rim joist, down past the trunk, to the coil */}
        <path d="M628 433 H564 V484 H330" className="ln" />
        <path d="M628 439 H558 V490 H330" className="ln" />
        <path d="M628 436 H561 V487 H334" className={s.flow} />
        <Tag n={4} x={744} y={362} to={[704, 392]} />
        <Tag n={5} x={606} y={398} to={[606, 433]} />
        <Tag n={6} x={372} y={536} to={[330, 494]} />
      </Sys>

      {/* ---------- Hot water: water heater and lines ---------- */}
      <Sys system="hot-water">
        <path d="M440 575 V506 Q440 498 463 498 Q486 498 486 506 V575 Z" className={`ln ${s.eq}`} />
        <path d="M444 522 H482 M444 556 H482" className="ln-soft" />
        {/* Cold supply in */}
        <path d="M450 498 V478 H420" className="ln-soft" />
        {/* Hot out: to the kitchen sink and up to the bathroom */}
        <path d="M476 498 V474 H546 V258 M546 402 H516 V380 M546 258 H540 V252" className="ln" />
        <path d="M476 494 V474 H546 V262" className={s.flow} />
        <path d="M546 402 H516 V384" className={s.flow} />
        <Tag n={7} x={520} y={538} to={[486, 538]} />
        <Tag n={8} x={490} y={226} to={[546, 270]} />
      </Sys>
    </svg>
  );
}
