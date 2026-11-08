import Link from "next/link";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CallLink } from "@/components/ui/CallLink";
import { MailIcon } from "@/components/ui/icons";
import { business } from "@/config/business";
import { sitePolicy } from "@/config/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: `Contact ${business.founder.firstName}`,
  description: `Call ${business.founder.name} at ${business.phone.display}, email, or send a request for furnace, air conditioning, water heater or heat pump service, an estimate or a commercial property.`,
  path: "/contact",
});

/** Fine line drawing of a wall phone jack and handset cord (decorative). */
function ContactDrawing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 200" className={`drawing ${className}`} aria-hidden="true" focusable="false">
      <rect className="ln-soft" x="8" y="8" width="224" height="184" />
      <path className="ln-soft" d="M8 40h224M8 160h224M48 8v184M192 8v184" strokeDasharray="2 4" />
      <rect className="ln" x="70" y="46" width="100" height="108" rx="3" />
      <rect className="ln" x="86" y="62" width="68" height="34" />
      <path className="ln-soft" d="M94 72h52M94 80h40M94 88h30" />
      <circle className="ln" cx="120" cy="124" r="14" />
      <path className="ln" d="M113 124h14M120 117v14" />
      <path className="ln" d="M170 120c26 0 30 22 16 30s-12 26 14 30" />
      <path className="ln-soft" d="M70 170h100M70 166v8M170 166v8" />
    </svg>
  );
}

export default function ContactPage() {
  const demo = !sitePolicy.indexable;
  const don = business.founder.firstName;

  return (
    <>
      <section aria-labelledby="contact-title" className="page-hero on-dark">
        <div className="container-page grid gap-10 pt-8 pb-12 md:grid-cols-12 md:pb-16">
          <div className="md:col-span-8">
            <Breadcrumbs
              crumbs={[
                { name: "Home", path: "/" },
                { name: "Contact", path: "/contact" },
              ]}
            />
            <p className="eyebrow mt-10 text-copper-700">{business.displayName}</p>
            <h1 id="contact-title" className="mt-4 text-display-xl uppercase text-midnight-900">
              Contact {don}
            </h1>
            <p className="prose-copy mt-6 text-lg text-ink-muted">
              Call or email {business.founder.name} directly, or send a written request below for a repair, an
              estimate on new equipment, or a commercial property.
            </p>
          </div>
          <div className="hidden md:col-span-3 md:col-start-10 md:block">
            <ContactDrawing className="w-full" />
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-12 md:py-16 lg:grid-cols-12 lg:gap-16">
        <aside aria-label={`Other ways to reach ${don}`} className="space-y-10 lg:col-span-4">
          <section aria-labelledby="contact-direct" className="space-y-5">
            <p className="eyebrow text-ink-muted">
              <span aria-hidden="true">01 — </span>Direct
            </p>
            <h2 id="contact-direct" className="text-display-md uppercase text-midnight-900">
              Call or email {don}
            </h2>
            <dl className="space-y-5">
              <div className="border-t border-midnight-900/20 pt-4">
                <dt className="eyebrow text-ink-muted">Phone</dt>
                <dd className="mt-2">
                  <CallLink placement="contact-direct" variant="primary" className="w-full sm:w-auto" />
                </dd>
              </div>
              <div className="border-t border-midnight-900/20 pt-4">
                <dt className="eyebrow text-ink-muted">Email</dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${business.email}`}
                    className="inline-flex min-h-12 items-center gap-2 break-all text-lg font-semibold text-copper-700 underline underline-offset-4 hover:decoration-2"
                  >
                    <MailIcon className="shrink-0" />
                    <span>{business.email}</span>
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="contact-no-heat" className="on-dark bg-midnight-900 p-5 text-limestone-100 sm:p-6">
            <h2 id="contact-no-heat" className="text-2xl uppercase text-limestone-50">
              No heat or no hot water?
            </h2>
            <p className="mt-3 text-midnight-100">
              Calling is the best way to reach {don} when something has stopped working. A written request is
              better for estimates, questions and planning work.
            </p>
            <div className="mt-5">
              <CallLink placement="contact-no-heat" variant="primary-on-dark" className="w-full sm:w-auto" />
            </div>
          </section>

          <section aria-labelledby="contact-safety" className="border-l-4 border-danger-700 pl-4">
            <h2 id="contact-safety" className="text-xl uppercase text-midnight-900">
              Smell gas or hear a carbon monoxide alarm?
            </h2>
            <p className="mt-2 text-ink">
              Leave the building first. From outside, call your gas utility’s emergency line or 911. Call {don}{" "}
              after you’re safe.
            </p>
          </section>

          <section aria-labelledby="contact-area" className="space-y-2">
            <h2 id="contact-area" className="text-xl uppercase text-midnight-900">
              Not sure {don} works in your area?
            </h2>
            <p className="text-ink-muted">
              {don}’s completed projects are in {business.documentedRegion}. Ask whether he serves your area when
              you call or in your request.{" "}
              <Link href="/service-area" className="text-copper-700 underline underline-offset-4">
                See where {don} has worked
              </Link>
              .
            </p>
          </section>
        </aside>

        <section id="request" aria-labelledby="request-title" className="scroll-mt-24 lg:col-span-8">
          <p className="eyebrow text-ink-muted">
            <span aria-hidden="true">02 — </span>Written request
          </p>
          <h2 id="request-title" className="mt-2 text-display-lg uppercase text-midnight-900">
            Send a request
          </h2>
          <p className="prose-copy mt-4 text-ink-muted">
            Tell {don} what you need and how to reach you. He’ll contact you to confirm details and timing. Fields
            marked (required) must be filled in.
          </p>
          <div className="mt-8">
            <InquiryForm demo={demo} />
          </div>
        </section>
      </div>
    </>
  );
}
