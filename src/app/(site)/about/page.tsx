import Link from "next/link";
import { ClosingCta, SectionHeading } from "@/components/pages/ClosingCta";
import { MonogramDrawing } from "@/components/pages/drawings";
import { ProjectTeaser } from "@/components/projects/ProjectTeaser";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { business } from "@/config/business";
import { serviceList } from "@/config/services";
import { getFeaturedProjects } from "@/lib/cms/public";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: `About ${business.founder.name}`,
  description: `${business.founder.name} founded ${business.displayName} and has ${business.experienceClaim} of heating, ventilation and air conditioning experience with homes and commercial buildings.`,
  path: "/about",
});

const initials = business.founder.name
  .split(/\s+/)
  .map((part) => part[0])
  .join("");

export default async function AboutPage() {
  const projects = await getFeaturedProjects(4);
  const serviceHref = inquiryHref({ intent: "service" });

  return (
    <>
      <section aria-labelledby="about-title" className="page-hero on-dark">
        <div className="container-page grid gap-10 pt-8 pb-14 md:grid-cols-12 md:pb-20">
          <div className="md:col-span-7">
            <Breadcrumbs
              crumbs={[
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
              ]}
            />
            <p className="eyebrow mt-10 text-copper-700">
              {business.founder.role}, {business.displayName}
            </p>
            <h1 id="about-title" className="mt-4 text-display-xl uppercase text-midnight-900">
              About {business.founder.name}
            </h1>
            <div className="prose-copy mt-6 text-lg text-ink-muted">
              <p>
                {business.founder.name} is the founder of {business.displayName}. He has {business.experienceClaim}{" "}
                of experience in heating, ventilation and air conditioning: installation, maintenance, repair and
                energy-efficiency work for residential and commercial clients.
              </p>
              <p>
                His completed projects are documented across {business.documentedRegion}, from homes in Brampton
                and Etobicoke to a rooftop air-conditioning unit on an Oshawa building.
              </p>
            </div>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <CallLink placement="about-hero" />
              <ButtonLink href={serviceHref} variant="secondary">
                <span>Request service</span>
                <ArrowRightIcon />
              </ButtonLink>
            </div>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <MonogramDrawing initials={initials} className="mx-auto max-w-64 md:max-w-none" />
          </div>
        </div>
      </section>

      <section aria-labelledby="about-work" className="container-page py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeading id="about-work" number="01">
              The work Don does
            </SectionHeading>
            <p className="mt-6 max-w-prose text-ink-muted">
              Don works on the equipment that heats, cools and supplies hot water to homes and commercial
              buildings, along with the ductwork, thermostats and gas lines that connect it.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-7">
            <div>
              <h3 className="text-2xl uppercase text-midnight-900">For homes</h3>
              <ul className="mt-4 space-y-2">
                {serviceList.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
                <li className="text-ink-muted">Ductwork and thermostats</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl uppercase text-midnight-900">For commercial buildings</h3>
              <p className="mt-4 text-ink-muted">
                Rooftop air conditioning, gas lines, heating, ventilation and maintenance.
              </p>
              <p className="mt-3">
                <Link
                  href="/commercial"
                  className="text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  Commercial HVAC for offices and buildings
                </Link>
              </p>
            </div>
          </div>
        </div>

        {projects.length ? (
          <div className="mt-16">
            <h3 className="eyebrow text-ink-muted">A few documented projects</h3>
            <div className="mt-4 divide-y divide-midnight-900/15 border-y border-midnight-900/15">
              {projects.map((p) => (
                <ProjectTeaser key={p.id} project={p} headingLevel={4} variant="row" />
              ))}
            </div>
            <p className="mt-6">
              <Link
                href="/our-work"
                className="font-semibold text-copper-700 underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                See all of Don’s documented work
              </Link>
            </p>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="about-how" className="border-y border-midnight-900/15 bg-limestone-50">
        <div className="container-page grid gap-10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <SectionHeading id="about-how" number="02">
              How working with Don goes
            </SectionHeading>
          </div>
          <ol className="space-y-8 md:col-span-7">
            <li className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span aria-hidden="true" className="font-display text-2xl text-copper-700">
                01
              </span>
              <div>
                <h3 className="text-xl uppercase text-midnight-900">You speak with Don</h3>
                <p className="mt-2 max-w-prose text-ink-muted">
                  The phone number on this site is Don’s. When you call or send a request, you are dealing with
                  Don himself.
                </p>
              </div>
            </li>
            <li className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span aria-hidden="true" className="font-display text-2xl text-copper-700">
                02
              </span>
              <div>
                <h3 className="text-xl uppercase text-midnight-900">Describe what is happening</h3>
                <p className="mt-2 max-w-prose text-ink-muted">
                  Tell him what the equipment is, roughly how old it is, and what it is or is not doing. That is
                  usually enough to start the conversation.
                </p>
              </div>
            </li>
            <li className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span aria-hidden="true" className="font-display text-2xl text-copper-700">
                03
              </span>
              <div>
                <h3 className="text-xl uppercase text-midnight-900">Ask your questions</h3>
                <p className="mt-2 max-w-prose text-ink-muted">
                  Ask Don to explain what he finds and what your options are before any work goes ahead, and ask
                  whether he serves your area.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <ClosingCta
        id="about-next"
        heading="Talk to Don"
        requestHref={serviceHref}
        requestLabel="Request service"
        placement="about-closing"
      >
        <p>
          If your heating, cooling or hot water needs attention, call Don directly or send a short request describing
          the problem.
        </p>
      </ClosingCta>

      <aside aria-label="Other ways to reach Don" className="container-page py-10">
        <p className="flex flex-wrap items-center gap-x-6 gap-y-3 text-ink-muted">
          <span>Prefer email? Write to</span>
          <a
            href={`mailto:${business.email}`}
            className="font-semibold text-copper-700 underline decoration-1 underline-offset-4"
          >
            {business.email}
          </a>
        </p>
      </aside>
    </>
  );
}
