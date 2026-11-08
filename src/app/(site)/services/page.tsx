import type { Metadata } from "next";
import Link from "next/link";
import { EquipmentDrawing } from "@/components/services/EquipmentDrawing";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { business } from "@/config/business";
import { serviceList } from "@/config/services";
import { SERVICE_SECTION_IDS as IDS, servicePages } from "@/content/service-pages";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HVAC services for homes and businesses",
  description:
    "Furnace, air conditioning, water heater and heat pump repair, maintenance and replacement for homes and commercial buildings. Find the right service or call Don.",
  path: "/services",
});

const linkClass = "font-semibold underline underline-offset-4 decoration-1 hover:decoration-2";

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section aria-labelledby="services-title" className="page-hero on-dark">
        <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-8">
            <p className="eyebrow text-copper-700">Services</p>
            <h1 id="services-title" className="mt-3 font-display text-display-xl uppercase text-midnight-900">
              HVAC services for homes and businesses
            </h1>
            <p className="mt-6 max-w-prose text-lg text-ink-muted">
              Don installs, repairs and maintains furnaces, air conditioners, water heaters and heat pumps, with{" "}
              {business.experienceClaim} of experience in residential and commercial work. Start from the equipment you
              have, or from what you need done.
            </p>
          </div>
          <aside
            aria-labelledby="not-sure-heading"
            className="border-t-4 border-copper-700 bg-limestone-50 p-6 md:col-span-4 md:self-end"
          >
            <h2 id="not-sure-heading" className="font-display text-2xl uppercase text-midnight-900">
              I’m not sure what I need
            </h2>
            <p className="mt-2 text-ink-muted">
              Describe what is happening and Don will work out which service it is. Ask whether Don serves your area at
              the same time.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <CallLink placement="services-not-sure" variant="primary" />
              <ButtonLink href={inquiryHref({ intent: "service", service: "not-sure" })} variant="secondary">
                Describe the problem
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {/* By equipment */}
      <section aria-labelledby="by-equipment-heading" className="container-page py-14 md:py-20">
        <div className="grid gap-4 md:grid-cols-12">
          <p className="eyebrow text-copper-700 md:col-span-3">Way in 01</p>
          <h2 id="by-equipment-heading" className="font-display text-display-lg uppercase text-midnight-900 md:col-span-9">
            By equipment
          </h2>
        </div>
        <ol className="mt-10 border-t border-midnight-900">
          {serviceList.map((s, i) => {
            const page = servicePages[s.slug];
            return (
              <li key={s.slug} className="grid gap-6 border-b border-midnight-900/20 py-8 md:grid-cols-12 md:gap-8">
                <span className="font-display text-5xl leading-none text-copper-700 md:col-span-1" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="md:col-span-7">
                  <h3 className="font-display text-display-md uppercase text-midnight-900">
                    <Link href={`/services/${s.slug}`} className="hover:text-copper-700">
                      {page.h1}
                    </Link>
                  </h3>
                  <p className="mt-3 max-w-prose text-ink-muted">{s.summary}</p>
                  <p className="mt-3 text-sm text-ink-muted">
                    <span className="sr-only">Equipment covered: </span>
                    {s.equipmentTypes.join(" · ")}
                  </p>
                  <Link href={`/services/${s.slug}`} className={`mt-4 inline-flex min-h-11 items-center gap-2 text-copper-700 ${linkClass}`}>
                    {s.name}: symptoms, buying questions and scope
                    <ArrowRightIcon />
                  </Link>
                </div>
                <div className="hidden md:col-span-4 md:block">
                  <EquipmentDrawing slug={s.slug} className="ml-auto h-40 w-auto" />
                </div>
              </li>
            );
          })}
          <li className="grid gap-6 py-8 md:grid-cols-12 md:gap-8">
            <span className="font-display text-5xl leading-none text-copper-700 md:col-span-1" aria-hidden="true">
              {String(serviceList.length + 1).padStart(2, "0")}
            </span>
            <div className="md:col-span-7">
              <h3 className="font-display text-display-md uppercase text-midnight-900">
                <Link href="/commercial" className="hover:text-copper-700">
                  Commercial HVAC
                </Link>
              </h3>
              <p className="mt-3 max-w-prose text-ink-muted">
                For building managers and business owners: rooftop air conditioning, heating, gas lines and ongoing
                maintenance for commercial properties.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/commercial" className={`inline-flex min-h-11 items-center gap-2 text-copper-700 ${linkClass}`}>
                  Commercial HVAC services
                  <ArrowRightIcon />
                </Link>
                <Link
                  href={inquiryHref({ intent: "commercial", property: "commercial" })}
                  className={`inline-flex min-h-11 items-center text-copper-700 ${linkClass}`}
                >
                  Send a commercial request
                </Link>
              </div>
            </div>
            <div className="hidden md:col-span-4 md:block">
              <EquipmentDrawing slug="commercial" className="ml-auto h-40 w-auto" />
            </div>
          </li>
        </ol>
      </section>

      {/* By need */}
      <section aria-labelledby="by-need-heading" className="border-t border-midnight-900/15 bg-limestone-50">
        <div className="container-page grid gap-4 py-14 md:grid-cols-12 md:py-16">
          <p className="eyebrow text-copper-700 md:col-span-3">Way in 02</p>
          <div className="md:col-span-9">
            <h2 id="by-need-heading" className="font-display text-display-lg uppercase text-midnight-900">
              By what you need
            </h2>
            <nav aria-label="Jump to a need" className="mt-6">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                <li>
                  <a href="#repair" className={`inline-flex min-h-11 items-center text-copper-700 ${linkClass}`}>
                    Repair
                  </a>
                </li>
                <li>
                  <a href="#maintenance" className={`inline-flex min-h-11 items-center text-copper-700 ${linkClass}`}>
                    Maintenance
                  </a>
                </li>
                <li>
                  <a href="#replace" className={`inline-flex min-h-11 items-center text-copper-700 ${linkClass}`}>
                    Replacement or new installation
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Repair — urgent, dark, phone first */}
      <section id="repair" aria-labelledby="repair-heading" className="on-dark scroll-mt-20 bg-midnight-900 text-limestone-100">
        <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <p className="eyebrow text-copper-300">Something is not working</p>
            <h3 id="repair-heading" className="mt-3 font-display text-display-lg uppercase text-limestone-50">
              Repair
            </h3>
            <p className="mt-4 max-w-prose text-midnight-100">
              No heat, no cooling, no hot water, a leak or a new noise. If it is urgent, call. Each page lists the
              common signs and the checks you can safely make first.
            </p>
            <p className="mt-4 max-w-prose text-limestone-50">
              <span className="font-semibold">Smell gas or hear a carbon monoxide alarm?</span> Leave the building and
              call your gas utility’s emergency line or 911 from outside before calling Don.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CallLink placement="services-repair" variant="primary-on-dark" />
              <ButtonLink href={inquiryHref({ intent: "service" })} variant="secondary-on-dark">
                Request a repair visit
              </ButtonLink>
            </div>
          </div>
          <ul className="border-t border-midnight-500 md:col-span-7">
            {serviceList.map((s) => (
              <li key={s.slug} className="flex flex-col gap-2 border-b border-midnight-500 py-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/services/${s.slug}#${IDS.symptoms}`}
                  className="group inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-limestone-50 hover:text-copper-300"
                >
                  {servicePages[s.slug].needs.repair}
                  <ArrowRightIcon className="shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={inquiryHref({ intent: "service", service: s.slug })}
                  className="inline-flex min-h-11 items-center text-sm text-copper-300 underline underline-offset-4"
                >
                  Request {s.equipment} service
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Maintenance */}
      <section id="maintenance" aria-labelledby="maintenance-heading" className="scroll-mt-20">
        <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <ul className="order-2 border-t border-midnight-900 md:order-1 md:col-span-7">
            {serviceList.map((s) => (
              <li key={s.slug} className="flex flex-col gap-2 border-b border-midnight-900/20 py-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/services/${s.slug}#${IDS.scopeMaintenance}`}
                  className="group inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-ink hover:text-copper-700"
                >
                  {servicePages[s.slug].needs.maintenance}
                  <ArrowRightIcon className="shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={inquiryHref({ intent: "service", service: s.slug })}
                  className="inline-flex min-h-11 items-center text-sm text-copper-700 underline underline-offset-4"
                >
                  Book {s.equipment} maintenance
                </Link>
              </li>
            ))}
          </ul>
          <div className="order-1 md:order-2 md:col-span-5">
            <p className="eyebrow text-copper-700">Keep it running</p>
            <h3 id="maintenance-heading" className="mt-3 font-display text-display-lg uppercase text-midnight-900">
              Maintenance
            </h3>
            <p className="mt-4 max-w-prose text-ink-muted">
              Cleaning, inspection and filter changes before the season starts: burners and heat exchangers on a
              furnace, coils and refrigerant levels on an air conditioner or heat pump, sediment and anode rods on a
              water heater.
            </p>
            <ButtonLink href={inquiryHref({ intent: "service" })} variant="secondary" className="mt-6">
              Request a maintenance visit
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Replace */}
      <section id="replace" aria-labelledby="replace-heading" className="scroll-mt-20 border-t border-midnight-900/15 bg-limestone-200/60">
        <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <p className="eyebrow text-copper-700">Planning ahead</p>
            <h3 id="replace-heading" className="mt-3 font-display text-display-lg uppercase text-midnight-900">
              Replacement or new installation
            </h3>
            <p className="mt-4 max-w-prose text-ink-muted">
              Replacing old equipment or adding something new, such as central air, a heat pump or a tankless water
              heater. Each page lists the questions worth asking before you request an estimate.
            </p>
            <ButtonLink href={inquiryHref({ intent: "estimate" })} className="mt-6">
              Request an estimate
            </ButtonLink>
          </div>
          <ul className="border-t border-midnight-900 md:col-span-7">
            {serviceList.map((s) => (
              <li key={s.slug} className="flex flex-col gap-2 border-b border-midnight-900/20 py-5 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={`/services/${s.slug}#${IDS.buying}`}
                  className="group inline-flex min-h-11 items-center gap-2 text-lg font-semibold text-ink hover:text-copper-700"
                >
                  {servicePages[s.slug].needs.replace}
                  <ArrowRightIcon className="shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={inquiryHref({ intent: "estimate", service: s.slug })}
                  className="inline-flex min-h-11 items-center text-sm text-copper-700 underline underline-offset-4"
                >
                  {s.name} estimate
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing */}
      <section aria-labelledby="services-cta-heading" className="container-page py-14 md:py-20">
        <div className="grid gap-8 border-t border-midnight-900 pt-10 md:grid-cols-12">
          <h2 id="services-cta-heading" className="font-display text-display-md uppercase text-midnight-900 md:col-span-6">
            Not sure where your problem fits?
          </h2>
          <div className="md:col-span-6">
            <p className="max-w-prose text-ink-muted">
              Call and describe what you are seeing or hearing, or send a request marked “I’m not sure”. You can also ask
              whether Don serves your area, or{" "}
              <Link href="/our-work" className="text-copper-700 underline underline-offset-4">
                see completed projects across {business.documentedRegion}
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CallLink placement="services-closing" variant="primary" />
              <ButtonLink href={inquiryHref({ intent: "service", service: "not-sure" })} variant="secondary">
                Send an “I’m not sure” request
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
