import Link from "next/link";
import { ClosingCta, SectionHeading } from "@/components/pages/ClosingCta";
import { DocumentedLocationsMap } from "@/components/pages/DocumentedLocationsMap";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { business, type BusinessConfig } from "@/config/business";
import { propertyTypeLabels } from "@/config/services";
import { getDocumentedLocations } from "@/lib/cms/public";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Where Don has worked",
  description: `Places in ${business.documentedRegion} where Don’s completed heating, cooling and hot-water projects are documented. Ask whether Don serves your area.`,
  path: "/service-area",
});

const askHref = inquiryHref({ intent: "question" });

export default async function ServiceAreaPage() {
  const locations = await getDocumentedLocations();
  const confirmed = (business as BusinessConfig).confirmedServiceArea;

  return (
    <>
      <section aria-labelledby="area-title" className="page-hero on-dark">
        <div className="container-page pt-8 pb-14 md:pb-16">
          <Breadcrumbs
            crumbs={[
              { name: "Home", path: "/" },
              { name: "Service area", path: "/service-area" },
            ]}
          />
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow text-copper-700">Documented projects, {business.documentedRegion}</p>
              <h1 id="area-title" className="mt-4 text-display-xl uppercase text-midnight-900">
                Where Don has worked
              </h1>
            </div>
            <div className="self-end md:col-span-5">
              <p className="text-lg text-ink-muted">
                These are places where Don’s completed projects are documented. They show past work, not a list of
                where he currently provides service.{" "}
                <strong className="font-semibold text-ink">Ask whether Don serves your area.</strong>
              </p>
              <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={askHref}>
                  <span>Ask about service in my area</span>
                  <ArrowRightIcon />
                </ButtonLink>
                <CallLink placement="service-area-hero" variant="secondary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="area-documented" className="container-page py-16 md:py-20">
        <SectionHeading id="area-documented" number="01">
          Documented project locations
        </SectionHeading>
        {locations.length ? (
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            <DocumentedLocationsMap
              cities={locations.map((l) => l.city)}
              className="lg:col-span-7"
            />
            <ul className="divide-y divide-midnight-900/15 border-y border-midnight-900/15 lg:col-span-5">
              {locations.map(({ city, projects }) => (
                <li key={city} className="py-5">
                  <h3 className="text-2xl uppercase text-midnight-900">{city}</h3>
                  <ul className="mt-2 space-y-2">
                    {projects.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/our-work/${p.slug}`}
                          className="text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
                        >
                          {p.title}
                        </Link>
                        {p.propertyType ? (
                          <span className="ml-2 text-sm text-ink-muted">{propertyTypeLabels[p.propertyType]}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-6 max-w-prose text-ink-muted">
            Project locations will appear here as Don publishes completed work.
          </p>
        )}
        <p className="mt-10">
          <Link
            href="/our-work"
            className="font-semibold text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            See all documented projects
          </Link>
        </p>
      </section>

      {confirmed.length > 0 ? (
        <section aria-labelledby="area-confirmed" className="border-t border-midnight-900/15 bg-limestone-50">
          <div className="container-page py-16 md:py-20">
            <SectionHeading id="area-confirmed" number="02">
              Confirmed service area
            </SectionHeading>
            <p className="mt-6 max-w-prose text-ink-muted">Don currently provides service in these places:</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-lg">
              {confirmed.map((place) => (
                <li key={place} className="font-semibold text-ink">
                  {place}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ClosingCta
        id="area-next"
        heading="Ask whether Don serves your area"
        requestHref={askHref}
        requestLabel="Ask about service in my area"
        placement="service-area-closing"
      >
        <p>Call Don or send a short question with your city or the first three characters of your postal code.</p>
      </ClosingCta>
    </>
  );
}
