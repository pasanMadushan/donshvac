import Link from "next/link";
import type { ReactNode } from "react";
import { business } from "@/config/business";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { SectionHeading } from "@/components/ui/SectionHeading";

const linkClass = "font-semibold text-copper-700 underline underline-offset-4 hover:decoration-2";

function listCities(cities: string[]): string {
  if (cities.length <= 1) return cities.join("");
  return `${cities.slice(0, -1).join(", ")} and ${cities[cities.length - 1]}`;
}

export function HomeFaq({ cities }: { cities: string[] }) {
  const faqs: Array<{ q: string; a: ReactNode }> = [
    {
      q: "My furnace isn’t heating. What can I safely check before I call?",
      a: (
        <>
          <p>A few checks are safe for anyone to do:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The thermostat is set to heat, set above room temperature, and its batteries (if it has them) are not dead.</li>
            <li>The furnace power switch, usually on or near the furnace, is on, and its breaker in the electrical panel has not tripped.</li>
            <li>The furnace filter is not clogged. A very dirty filter can restrict airflow.</li>
          </ul>
          <p className="mt-2">
            Don’t open the furnace or work on gas or electrical parts. If those checks don’t help, call Don. If you smell
            gas or a carbon monoxide alarm sounds, leave the building first and call your gas utility’s emergency line or
            911 from outside.
          </p>
        </>
      ),
    },
    {
      q: "What should I have ready when I ask for an estimate?",
      a: (
        <>
          <p>
            It helps to know roughly how old the current equipment is and what type it is (for example a gas furnace,
            central air conditioner or tank water heater), a clear photo of the model plate or sticker, and the
            approximate size of the home or space. Then{" "}
            <Link href={inquiryHref({ intent: "estimate" })} className={linkClass}>
              request an estimate
            </Link>{" "}
            or call.
          </p>
        </>
      ),
    },
    {
      q: "Does Don work on commercial properties?",
      a: (
        <p>
          Yes. Documented commercial work includes a rooftop air-conditioning unit for a building in Oshawa and a gas
          line for an office in Hamilton. See{" "}
          <Link href="/commercial" className={linkClass}>
            commercial HVAC services
          </Link>
          .
        </p>
      ),
    },
    {
      q: "Which areas does Don work in?",
      a: (
        <p>
          {cities.length > 0 ? (
            <>
              Completed projects are documented in {listCities(cities)}, all in {business.documentedRegion}.{" "}
            </>
          ) : (
            <>Completed projects are documented across {business.documentedRegion}. </>
          )}
          Current service areas are not listed yet, so ask whether Don serves your area when you call or send a
          request. More on the{" "}
          <Link href="/service-area" className={linkClass}>
            service area page
          </Link>
          .
        </p>
      ),
    },
    {
      q: "How does a request work?",
      a: (
        <p>
          Call {business.phone.display}, or{" "}
          <Link href={inquiryHref({ intent: "service" })} className={linkClass}>
            send a request with the online form
          </Link>
          . A form request is not an automatic booking: Don reads it, follows up with you, and confirms an appointment
          time with you directly.
        </p>
      ),
    },
  ];

  return (
    <section aria-labelledby="faq-title" className="py-16 sm:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="faq-title" number="06" eyebrow="Questions" title="Practical questions" />
        </div>
        <div className="grid content-start gap-3 lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.q} className="glass group rounded-md px-4 open:ring-2 open:ring-copper-500/30 sm:px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold text-midnight-900 [&::-webkit-details-marker]:hidden">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-500 to-ember-500 font-display text-2xl text-midnight-950 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="max-w-prose pb-5 text-ink">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
