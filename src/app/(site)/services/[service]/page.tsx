import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectTeaser } from "@/components/projects/ProjectTeaser";
import { EquipmentDrawing } from "@/components/services/EquipmentDrawing";
import { SafetyNote } from "@/components/services/SafetyNote";
import { ServiceActions } from "@/components/services/ServiceActions";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { business } from "@/config/business";
import { SERVICE_SLUGS, services, type ServiceSlug } from "@/config/services";
import { SERVICE_SECTION_IDS as IDS, getServicePage, servicePages, type ServicePageContent } from "@/content/service-pages";
import { getProjectBySlug, getProjectsForService } from "@/lib/cms/public";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { JsonLd, serviceJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

type Params = Promise<{ service: string }>;

// Unknown slugs call notFound(). (`dynamicParams` is not available with
// cacheComponents, so it is intentionally not exported.)
export function generateStaticParams(): Array<{ service: ServiceSlug }> {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { service } = await params;
  const page = getServicePage(service);
  if (!page) return {};
  return pageMetadata({ title: page.metaTitle, description: page.metaDescription, path: `/services/${page.slug}` });
}

export default async function ServicePage({ params }: { params: Params }) {
  const { service } = await params;
  const page = getServicePage(service);
  if (!page) notFound();

  const summary = services[page.slug];
  const path = `/services/${page.slug}`;
  const [projects, anchor] = await Promise.all([
    getProjectsForService(page.slug),
    page.anchorProject ? getProjectBySlug(page.anchorProject.slug) : Promise.resolve(null),
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={[serviceJsonLd(summary, path, page.metaDescription), faqJsonLd]} />

      {/* Hero */}
      <section aria-labelledby="service-title" className="page-hero on-dark">
        <div className="container-page pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
              { name: summary.name, path },
            ]}
          />
          <div className="mt-10 grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="eyebrow text-copper-700">{page.eyebrow}</p>
              <h1 id="service-title" className="mt-3 font-display text-display-xl uppercase text-midnight-900">
                {page.h1}
              </h1>
              <div className="prose-copy mt-6 text-lg text-ink-muted">
                {page.intro.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <ServiceActions slug={page.slug} placement={`service-${page.slug}-hero`} className="mt-8" />
            </div>
            <div className="hidden md:col-span-4 md:block">
              <EquipmentDrawing slug={page.slug} className="ml-auto w-full max-w-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* Equipment types */}
      <section aria-labelledby="types-heading" className="container-page py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="types-heading" className="font-display text-display-md uppercase text-midnight-900">
              {page.types.heading}
            </h2>
            {page.note ? <p className="mt-4 text-ink-muted">{page.note}</p> : null}
            {page.anchorProject && anchor ? (
              <p className="mt-4 text-ink">
                {page.anchorProject.lead} Project:{" "}
                <Link
                  href={`/our-work/${anchor.slug}`}
                  className="font-semibold text-copper-700 underline underline-offset-4"
                >
                  {anchor.title}
                </Link>
                .
              </p>
            ) : null}
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 md:col-span-8">
            {page.types.items.map((t) => (
              <div key={t.name} className="border-t border-midnight-900 pt-4">
                <dt className="font-sans text-lg font-semibold text-ink">{t.name}</dt>
                <dd className="mt-2 text-ink-muted">{t.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Symptoms page={page} />

      <SafetyNote id={IDS.safety} equipment={summary.equipment} checks={page.homeownerChecks} />

      <BuyingQuestions page={page} />

      <Scope page={page} />

      {/* Related work */}
      <section id={IDS.projects} aria-labelledby="projects-heading" className="container-page py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-midnight-900 pb-4">
          <h2 id="projects-heading" className="font-display text-display-md uppercase text-midnight-900">
            Related work
          </h2>
          <Link href="/our-work" className="font-semibold text-copper-700 underline underline-offset-4">
            See all completed projects
          </Link>
        </div>
        {projects.length ? (
          <ul className="mt-2 divide-y divide-midnight-900/15">
            {projects.map((p) => (
              <li key={p.id} className="py-6">
                <ProjectTeaser project={p} headingLevel={3} variant="row" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-prose text-ink-muted">
            No {summary.equipment} projects are published yet.{" "}
            <Link href="/our-work" className="font-semibold text-copper-700 underline underline-offset-4">
              Browse Don’s completed work in {business.documentedRegion}
            </Link>
            .
          </p>
        )}
      </section>

      {/* FAQ — always visible, no JS needed */}
      <section id={IDS.faq} aria-labelledby="faq-heading" className="bg-limestone-200/60">
        <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:py-20">
          <h2 id="faq-heading" className="font-display text-display-md uppercase text-midnight-900 md:col-span-4">
            {page.faqHeading}
          </h2>
          <div className="md:col-span-8">
            {page.faqs.map((f) => (
              <div key={f.q} className="border-t border-midnight-900/25 py-6 first:border-t-0 first:pt-0">
                <h3 className="font-sans text-lg font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 max-w-prose text-ink-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related services */}
      <nav id={IDS.related} aria-labelledby="related-heading" className="container-page py-14 md:py-16">
        <h2 id="related-heading" className="font-display text-display-md uppercase text-midnight-900">
          Related services
        </h2>
        <ul className="mt-6 grid gap-x-8 border-t border-midnight-900 sm:grid-cols-2 lg:grid-cols-4">
          {page.relatedServices.map((slug) => (
            <li key={slug} className="border-b border-midnight-900/15">
              <Link
                href={`/services/${slug}`}
                className="group flex min-h-14 items-center justify-between gap-3 py-4 font-semibold text-ink hover:text-copper-700"
              >
                <span>{servicePages[slug].h1}</span>
                <ArrowRightIcon className="shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
          <li className="border-b border-midnight-900/15">
            <Link
              href="/commercial"
              className="group flex min-h-14 items-center justify-between gap-3 py-4 font-semibold text-ink hover:text-copper-700"
            >
              <span>Commercial HVAC for building managers</span>
              <ArrowRightIcon className="shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        </ul>
      </nav>

      {/* Closing CTA */}
      <section aria-labelledby="cta-heading" className="on-dark bg-midnight-900 text-limestone-100">
        <div className="container-page grid gap-8 py-14 md:grid-cols-12 md:items-end md:py-20">
          <div className="md:col-span-7">
            <h2 id="cta-heading" className="font-display text-display-lg uppercase text-limestone-50">
              Talk to Don about your {summary.equipment}
            </h2>
            <p className="mt-4 max-w-prose text-midnight-100">
              Don has {business.experienceClaim} of experience with heating, cooling and hot water. Call to describe
              the problem, or send a request with the details. Not sure whether Don serves your area? Ask when you
              get in touch.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:col-span-5 md:justify-end">
            <CallLink placement={`service-${page.slug}-closing`} variant="primary-on-dark" />
            <ButtonLink href={inquiryHref({ intent: "service", service: page.slug })} variant="secondary-on-dark">
              Request service
            </ButtonLink>
            <ButtonLink href={inquiryHref({ intent: "estimate", service: page.slug })} variant="secondary-on-dark">
              Request an estimate
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function Symptoms({ page }: { page: ServicePageContent }) {
  return (
    <section id={IDS.symptoms} aria-labelledby="symptoms-heading" className="on-dark bg-midnight-900 text-limestone-100">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-6 md:grid-cols-12">
          <h2 id="symptoms-heading" className="font-display text-display-lg uppercase text-limestone-50 md:col-span-7">
            {page.symptomsHeading}
          </h2>
          <p className="text-midnight-100 md:col-span-5 md:self-end">{page.symptomsIntro}</p>
        </div>
        <ol className="mt-10 border-t border-midnight-500">
          {page.symptoms.map((s, i) => (
            <li
              key={s.id}
              id={s.id}
              className="grid scroll-mt-24 gap-4 border-b border-midnight-500 py-8 md:grid-cols-12 md:gap-8"
            >
              <span className="font-display text-4xl leading-none text-copper-300 md:col-span-1" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-sans text-xl font-semibold text-limestone-50 md:col-span-4">{s.title}</h3>
              <div className="md:col-span-7">
                <p className="text-midnight-100">{s.description}</p>
                <p className="mt-3 border-l-2 border-copper-300 pl-4 text-limestone-50">
                  <span className="font-semibold">When to call: </span>
                  {s.whenToCall}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <CallLink placement={`service-${page.slug}-symptoms`} variant="primary-on-dark" />
          <ButtonLink href={inquiryHref({ intent: "service", service: page.slug })} variant="secondary-on-dark">
            Request service
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function BuyingQuestions({ page }: { page: ServicePageContent }) {
  return (
    <section id={IDS.buying} aria-labelledby="buying-heading" className="container-page py-14 md:py-20">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow text-copper-700">Replacement or new installation</p>
          <h2 id="buying-heading" className="mt-3 font-display text-display-md uppercase text-midnight-900">
            {page.buyingHeading}
          </h2>
          <p className="mt-4 text-ink-muted">{page.buyingIntro}</p>
          <ButtonLink href={inquiryHref({ intent: "estimate", service: page.slug })} className="mt-6">
            Request an estimate
          </ButtonLink>
        </div>
        <ol className="md:col-span-8">
          {page.buyingQuestions.map((q, i) => (
            <li key={q.question} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-midnight-900/20 py-6">
              <span className="font-display text-3xl leading-none text-copper-700" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">{q.question}</h3>
                <p className="mt-2 text-ink-muted">{q.answer}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Scope({ page }: { page: ServicePageContent }) {
  const groups = [
    { id: IDS.scopeRepair, title: "Repair", items: page.scope.repair },
    { id: IDS.scopeMaintenance, title: "Maintenance", items: page.scope.maintenance },
    { id: IDS.scopeInstallation, title: "Replacement and new installation", items: page.scope.installation },
    { id: IDS.scopeEfficiency, title: "Efficiency and integration", items: page.scope.efficiency },
  ].filter((g) => g.items.length);
  return (
    <section id={IDS.scope} aria-labelledby="scope-heading" className="border-t border-midnight-900/15 bg-limestone-50">
      <div className="container-page py-14 md:py-20">
        <div className="grid gap-6 md:grid-cols-12">
          <h2 id="scope-heading" className="font-display text-display-lg uppercase text-midnight-900 md:col-span-6">
            What Don handles
          </h2>
          <p className="text-ink-muted md:col-span-6 md:self-end">
            The {services[page.slug].equipment} work Don does for homes and businesses, from a single repair to a full
            replacement.
          </p>
        </div>
        <div className="mt-10 grid gap-x-10 gap-y-10 border-t border-midnight-900 pt-8 md:grid-cols-2">
          {groups.map((g, i) => (
            <div key={g.id} id={g.id} className="scroll-mt-24">
              <h3 className="flex items-baseline gap-3 font-display text-2xl uppercase text-midnight-900">
                <span className="text-copper-700" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                {g.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="grid grid-cols-[1rem_1fr] gap-2 text-ink">
                    <span aria-hidden="true" className="mt-[0.7em] h-px w-3 bg-copper-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
