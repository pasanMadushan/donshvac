import Link from "next/link";
import { business } from "@/config/business";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Glowing monogram panel used in place of a portrait (no approved photo). */
function Monogram() {
  return (
    <div data-tone="dual" className="illus-panel relative flex aspect-square w-full max-w-72 items-center justify-center">
      <svg viewBox="0 0 240 240" className="drawing relative h-full w-full" aria-hidden="true" focusable="false">
        <circle cx="120" cy="112" r="78" className="ln-soft" />
        <circle cx="120" cy="112" r="64" fill="none" stroke="url(#mono-ring)" strokeWidth="3" />
        <defs>
          <linearGradient id="mono-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fa5421" />
            <stop offset="0.5" stopColor="#ffb21f" />
            <stop offset="1" stopColor="#19b4f2" />
          </linearGradient>
        </defs>
        <path d="M120 22 V36 M120 188 V202 M30 112 H44 M196 112 H210" className="ln-soft" />
        <text x="120" y="134" textAnchor="middle" fill="#ffffff" style={{ font: "700 64px var(--font-display)", letterSpacing: "0.04em" }}>
          DD
        </text>
        <text x="120" y="226" textAnchor="middle" fill="#a8c6e3" style={{ font: "700 10.5px var(--font-sans)", letterSpacing: "0.18em" }}>
          DON DEMATAGODA · FOUNDER
        </text>
      </svg>
    </div>
  );
}

export function FounderIntro() {
  return (
    <section aria-labelledby="founder-title" className="bg-wash py-16 sm:py-24">
      <div className="container-page glass grid items-center gap-10 rounded-lg p-5 sm:p-8 md:grid-cols-12 lg:p-12">
        <div className="md:col-span-4">
          <Monogram />
        </div>
        <div className="md:col-span-8 lg:col-span-7">
          <SectionHeading id="founder-title" number="05" eyebrow={business.founder.role} title={`Meet ${business.founder.name}`} />
          <div className="prose-copy mt-5 text-lg">
            <p>
              Don founded {business.displayName} and has {business.experienceClaim} of experience with heating, cooling
              and hot-water equipment. He installs, repairs and maintains furnaces, air conditioners, heat pumps and
              water heaters, and helps owners make their systems more efficient.
            </p>
            <p>
              His work covers both family homes and commercial buildings. If something isn’t working, or you are
              thinking about new equipment, call and talk it through with Don.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CallLink placement="home-founder" variant="primary" />
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-copper-700 underline underline-offset-4 hover:decoration-2"
            >
              More about Don
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
