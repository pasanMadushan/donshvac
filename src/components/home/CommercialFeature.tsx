import Link from "next/link";
import type { PublicProject } from "@/lib/cms/types";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

const points = [
  {
    title: "Equipment",
    text: "Rooftop air-conditioning units, gas lines, furnaces and water heaters serving offices and other commercial buildings.",
  },
  {
    title: "Access",
    text: "Rooftop and mechanical-room work means planning roof access and entry with whoever manages the property.",
  },
  {
    title: "Scheduling",
    text: "Visits are arranged with the property contact, and Don confirms each appointment directly.",
  },
];

export function CommercialFeature({ projects }: { projects: PublicProject[] }) {
  return (
    <section
      aria-labelledby="commercial-title"
      className="on-dark relative overflow-hidden py-16 text-white sm:py-24"
    >
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading id="commercial-title" number="04" eyebrow="Commercial" title="For building managers and commercial properties" tone="dark" />
          <p className="mt-5 max-w-prose text-midnight-100">
            Don works on commercial buildings as well as homes. If you look after an office, a retail unit or a
            multi-unit building, describe the equipment and how to reach it, and Don will follow up to arrange a visit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={inquiryHref({ intent: "commercial", property: "commercial" })} variant="primary-on-dark">
              Ask about a commercial property
            </ButtonLink>
            <ButtonLink href="/commercial" variant="secondary-on-dark">
              Commercial HVAC services
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-7">
          <ol className="grid gap-4 sm:grid-cols-3">
            {points.map((p, i) => (
              <li key={p.title} className="glass-dark relative overflow-hidden rounded-md p-4">
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${["bg-gradient-to-r from-copper-500 to-ember-500","bg-gradient-to-r from-ember-500 to-ice-500","bg-gradient-to-r from-ice-500 to-midnight-500"][i]}`} />
                <span className="font-display text-2xl font-bold text-ice-300" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl uppercase text-white">{p.title}</h3>
                <p className="mt-1 text-sm text-midnight-100">{p.text}</p>
              </li>
            ))}
          </ol>
          {projects.length > 0 ? (
            <div className="glass-dark mt-6 rounded-md p-5 sm:p-6">
              <h3 className="eyebrow text-ice-300">Documented commercial work</h3>
              <ul className="mt-3 divide-y divide-white/10">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/our-work/${p.slug}`}
                      className="group flex min-h-12 items-center justify-between gap-4 py-2 font-semibold text-white"
                    >
                      <span className="group-hover:underline group-hover:underline-offset-4">
                        {p.title}
                        {p.city ? <span className="block text-sm font-normal text-midnight-300">{p.city}</span> : null}
                      </span>
                      <ArrowRightIcon className="shrink-0 text-copper-300 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
