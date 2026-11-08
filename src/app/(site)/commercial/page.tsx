import Link from "next/link";
import { ClosingCta, SectionHeading } from "@/components/pages/ClosingCta";
import { RooftopSectionDrawing } from "@/components/pages/drawings";
import { ProjectTeaser } from "@/components/projects/ProjectTeaser";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { business } from "@/config/business";
import { getCommercialProjects } from "@/lib/cms/public";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Commercial HVAC for offices and buildings",
  description:
    "Rooftop air conditioning, gas lines, heating, ventilation and maintenance for commercial buildings in Southern Ontario. Describe your building and equipment to Don.",
  path: "/commercial",
});

const ROOFTOP_SLUG = "oshawa-commercial-rooftop-air-conditioner";
const GAS_LINE_SLUG = "hamilton-office-gas-line-installation";

const commercialHref = inquiryHref({ intent: "commercial", property: "commercial" });

const equipment: Array<{ name: string; body: string; project?: { slug: string; label: string } }> = [
  {
    name: "Rooftop air conditioning",
    body: "Rooftop units that cool offices and commercial spaces from above: installation, repair and seasonal servicing.",
    project: { slug: ROOFTOP_SLUG, label: "See the Oshawa rooftop air-conditioning project" },
  },
  {
    name: "Gas lines",
    body: "Gas piping to heating equipment and rooftop units in commercial buildings.",
    project: { slug: GAS_LINE_SLUG, label: "See the Hamilton office gas line project" },
  },
  {
    name: "Furnaces and heating",
    body: "Gas and electric furnaces serving offices, shops and other commercial spaces: repair, maintenance and replacement.",
  },
  {
    name: "Ventilation and indoor air quality",
    body: "Ductwork and airflow, so fresh air reaches the rooms people use and stale air leaves them.",
  },
  {
    name: "Maintenance",
    body: "Scheduled servicing of heating and cooling equipment, planned around how the building is used.",
  },
];

const briefing: Array<{ title: string; points: string[] }> = [
  {
    title: "The property",
    points: [
      "What kind of building it is (office, retail, industrial, multi-unit) and roughly how big",
      "The address or city, so Don can tell you whether he can serve it",
      "Whether the space is occupied, and by whom",
    ],
  },
  {
    title: "The system and equipment",
    points: [
      "What the equipment is: rooftop unit, furnace, gas line, ductwork or ventilation",
      "Approximate age, and the make and model from the rating plate if you can read it safely",
      "What it is doing, or not doing, and when the problem started",
    ],
  },
  {
    title: "Access",
    points: [
      "Roof access: hatch, ladder or stairs, and who holds the key",
      "Mechanical room location and keys",
      "Security sign-in, parking and loading arrangements",
      "Any notice tenants need before work starts",
    ],
  },
  {
    title: "Timing",
    points: [
      "Windows when work can happen with the least disruption",
      "Times to avoid, such as business hours in occupied spaces",
      "Who Don should coordinate with on the day",
    ],
  },
];

export default async function CommercialPage() {
  const projects = await getCommercialProjects();
  // Rooftop AC first: people searching "commercial rooftop AC" land here.
  const ordered = [...projects].sort(
    (a, b) => Number(b.slug === ROOFTOP_SLUG) - Number(a.slug === ROOFTOP_SLUG),
  );
  const publishedSlugs = new Set(projects.map((p) => p.slug));

  return (
    <>
      <section aria-labelledby="commercial-title" className="page-hero on-dark">
        <div className="container-page grid gap-10 pt-8 pb-14 md:grid-cols-12 md:pb-20">
          <div className="md:col-span-7">
            <Breadcrumbs
              crumbs={[
                { name: "Home", path: "/" },
                { name: "Commercial", path: "/commercial" },
              ]}
            />
            <p className="eyebrow mt-10 text-copper-700">For building managers and owners</p>
            <h1 id="commercial-title" className="mt-4 text-display-xl uppercase text-midnight-900">
              Commercial HVAC for offices and buildings
            </h1>
            <p className="mt-6 max-w-prose text-lg text-ink-muted">
              Rooftop air conditioning, gas lines, heating, ventilation and maintenance for commercial properties.{" "}
              {business.founder.name} has {business.experienceClaim} of experience with residential and commercial
              clients, and documented commercial work in Oshawa and Hamilton. Start by telling him about the
              building and the equipment.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={commercialHref}>
                <span>Describe your building and equipment</span>
                <ArrowRightIcon />
              </ButtonLink>
              <CallLink placement="commercial-hero" variant="secondary" />
            </div>
          </div>
          <div className="self-end md:col-span-5">
            <RooftopSectionDrawing className="max-w-md md:ml-auto" />
          </div>
        </div>
      </section>

      <section aria-labelledby="commercial-equipment" className="container-page py-16 md:py-20">
        <SectionHeading id="commercial-equipment" number="01">
          Commercial equipment Don works on
        </SectionHeading>
        <ul className="mt-8 divide-y divide-midnight-900/15 border-b border-midnight-900/15">
          {equipment.map((item) => (
            <li key={item.name} className="grid gap-2 py-6 md:grid-cols-12 md:gap-8">
              <h3 className="text-2xl uppercase text-midnight-900 md:col-span-4">{item.name}</h3>
              <div className="md:col-span-8">
                <p className="max-w-prose text-ink-muted">{item.body}</p>
                {item.project && publishedSlugs.has(item.project.slug) ? (
                  <p className="mt-2">
                    <Link
                      href={`/our-work/${item.project.slug}`}
                      className="font-semibold text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {item.project.label}
                    </Link>
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-prose text-ink-muted">
          Looking at a specific system? Read about{" "}
          <Link href="/services/air-conditioning" className="text-copper-700 underline underline-offset-4">
            air conditioning
          </Link>{" "}
          or{" "}
          <Link href="/services/furnaces" className="text-copper-700 underline underline-offset-4">
            furnaces and heating
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="commercial-briefing" className="border-y border-midnight-900/15 bg-limestone-50">
        <div className="container-page py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionHeading id="commercial-briefing" number="02">
                What to tell Don about your building
              </SectionHeading>
            </div>
            <p className="max-w-prose self-end text-lg text-ink-muted md:col-span-6 md:col-start-7">
              A short written brief helps Don understand the job before the first visit. You do not need every
              detail. Send what you know and he can ask about the rest.
            </p>
          </div>
          <ol className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {briefing.map((group, i) => (
              <li key={group.title} className="border-t border-midnight-900 pt-5">
                <h3 className="flex items-baseline gap-3 text-2xl uppercase text-midnight-900">
                  <span aria-hidden="true" className="font-display text-copper-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {group.title}
                </h3>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-muted marker:text-copper-700">
                  {group.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="mt-10">
            <ButtonLink href={commercialHref}>
              <span>Describe your building and equipment</span>
              <ArrowRightIcon />
            </ButtonLink>
          </p>
        </div>
      </section>

      <section aria-labelledby="commercial-work" className="container-page py-16 md:py-20">
        <SectionHeading id="commercial-work" number="03">
          Documented commercial work
        </SectionHeading>
        {ordered.length ? (
          <div className="mt-10 space-y-16">
            {ordered.map((project) => (
              <ProjectTeaser key={project.id} project={project} headingLevel={3} variant="feature" />
            ))}
          </div>
        ) : (
          <p className="mt-6 max-w-prose text-ink-muted">
            Commercial projects will appear here as Don publishes them. In the meantime, see{" "}
            <Link href="/our-work" className="text-copper-700 underline underline-offset-4">
              all of Don’s documented work
            </Link>
            .
          </p>
        )}
        {ordered.length ? (
          <p className="mt-10">
            <Link
              href="/our-work"
              className="font-semibold text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              See all documented projects, residential and commercial
            </Link>
          </p>
        ) : null}
      </section>

      <ClosingCta
        id="commercial-next"
        heading="Tell Don about your building"
        requestHref={commercialHref}
        requestLabel="Describe your building and equipment"
        placement="commercial-closing"
      >
        <p>
          Call to talk it through, or send the property type, equipment, access and timing in writing. Ask whether
          Don serves your area when you get in touch.
        </p>
      </ClosingCta>
    </>
  );
}
