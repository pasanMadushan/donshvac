import { business } from "@/config/business";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { CutawayDrawing } from "@/components/cutaway/CutawayDrawing";
import { CutawayExplorer } from "@/components/cutaway/CutawayExplorer";

const systems = [
  { label: "Heating", dot: "bg-copper-500 shadow-[0_0_12px_2px_rgb(250_84_33/0.7)]" },
  { label: "Cooling", dot: "bg-ice-500 shadow-[0_0_12px_2px_rgb(25_180_242/0.7)]" },
  { label: "Hot water", dot: "bg-ember-500 shadow-[0_0_12px_2px_rgb(255_178_31/0.7)]" },
];

/**
 * Home hero: dark aurora band with the glowing, colour-coded cutaway. On
 * small screens the heading, phone and Request service come first and the
 * drawing follows below the calls to action.
 */
export function Hero() {
  return (
    <section aria-labelledby="home-title" className="on-dark relative isolate overflow-hidden text-white">
      {/* Decorative tech grid + glow, behind content. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]">
        <div className="h-full w-full [background-image:linear-gradient(to_right,rgb(127_213_255/0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(127_213_255/0.12)_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>
      <div className="container-page grid gap-x-12 gap-y-8 pt-6 pb-14 sm:pt-12 lg:grid-cols-12 lg:pt-20 lg:pb-24">
        <div className="lg:col-span-5 lg:pt-4">
          <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.7rem] text-ice-300 sm:text-[0.8125rem]">
            <span className="h-1.5 w-1.5 rounded-full bg-copper-500 shadow-[0_0_10px_2px_rgb(250_84_33/0.8)]" aria-hidden="true" />
            Residential and commercial HVAC
          </p>
          <h1
            id="home-title"
            className="mt-4 text-[2.4rem] leading-[0.95] uppercase sm:text-display-xl lg:text-[4.1rem] xl:text-[4.6rem]"
          >
            <span className="text-gradient-heat">Heating</span>, <span className="text-gradient-cool">cooling</span>, and{" "}
            <span className="text-ember-300">hot water</span> for your home or business
          </h1>
          <p className="mt-4 max-w-prose text-base text-midnight-100 sm:mt-6 sm:text-lg">
            {business.founder.name} has spent {business.experienceClaim} installing, repairing and maintaining
            furnaces, air conditioners, heat pumps and water heaters in homes and commercial buildings.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
            <CallLink placement="hero" variant="primary-on-dark" className="w-full sm:w-auto" />
            <ButtonLink href={inquiryHref({ intent: "service" })} variant="secondary-on-dark" className="w-full sm:w-auto">
              Request service
            </ButtonLink>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-midnight-100" aria-label="Systems Don works on">
            {systems.map((s) => (
              <li key={s.label} className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-prose text-sm text-midnight-300 sm:text-base">
            Don also handles energy-efficiency upgrades and planned replacements. Completed projects are documented
            across {business.documentedRegion}; ask whether Don serves your area.
          </p>
        </div>
        <div className="lg:col-span-7">
          <CutawayExplorer
            drawing={<CutawayDrawing />}
            caption={
              <>
                Illustration: how a typical Ontario home is heated, cooled and supplied with hot water. A drawing, not a
                photo of a specific job.
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}
