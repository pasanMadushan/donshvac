import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ProjectTeaser } from "@/components/projects/ProjectTeaser";
import { business } from "@/config/business";
import { PORTFOLIO_PAGE_SIZE } from "@/lib/cms/public";
import type { PublicProject } from "@/lib/cms/types";
import { inquiryHref } from "@/lib/inquiry/prefill";

/** Features at the top of page 1; everything else is a compact row. */
const FEATURE_COUNT = 3;

export const portfolioPagePath = (n: number) => (n <= 1 ? "/our-work" : `/our-work/page/${n}`);

export function PortfolioView({
  projects,
  page,
  totalPages,
}: {
  projects: PublicProject[];
  page: number;
  totalPages: number;
}) {
  const isFirst = page === 1;
  const features = isFirst ? projects.slice(0, FEATURE_COUNT) : [];
  const rows = isFirst ? projects.slice(FEATURE_COUNT) : projects;
  const offset = (page - 1) * PORTFOLIO_PAGE_SIZE;

  const crumbs = isFirst
    ? [
        { name: "Home", path: "/" },
        { name: "Our work", path: "/our-work" },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Our work", path: "/our-work" },
        { name: `Page ${page}`, path: portfolioPagePath(page) },
      ];

  return (
    <>
      <section aria-labelledby="our-work-title" className="page-hero on-dark">
        <div className="container-page pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="eyebrow text-copper-700">Our work{isFirst ? "" : ` · Page ${page} of ${totalPages}`}</p>
              <h1 id="our-work-title" className="mt-3 text-display-xl uppercase text-midnight-900">
                {isFirst ? `Completed HVAC projects across ${business.documentedRegion}` : `Completed HVAC projects, page ${page}`}
              </h1>
            </div>
            <div className="prose-copy text-lg text-ink-muted md:col-span-4 md:self-end">
              <p>
                These are documented jobs that {business.displayName} has completed: furnaces, air conditioning,
                water heaters, heat pumps, ductwork, thermostats and gas lines, for homes and commercial buildings.
              </p>
              <p>
                Each location is where the work was done. It is not a list of areas served, so ask whether Don serves
                your area.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="project-list-heading" className="container-page py-14 md:py-20">
        <h2 id="project-list-heading" className="eyebrow text-ink-muted">
          {isFirst ? "Documented projects" : `Projects ${offset + 1}–${offset + projects.length}`}
        </h2>

        {features.length ? (
          <ol className="mt-8 space-y-16 md:space-y-24">
            {features.map((p, i) => (
              <li key={p.id}>
                <ProjectTeaser
                  project={p}
                  variant="feature"
                  headingLevel={3}
                  index={offset + i + 1}
                  reverse={i % 2 === 1}
                  priority={i === 0}
                />
              </li>
            ))}
          </ol>
        ) : null}

        {rows.length ? (
          <div className={features.length ? "mt-20 md:mt-28" : "mt-8"}>
            {features.length ? (
              <h3 className="mb-2 text-display-md uppercase text-midnight-900">More completed jobs</h3>
            ) : null}
            <ol className="border-b border-midnight-900/25">
              {rows.map((p, i) => (
                <li key={p.id}>
                  <ProjectTeaser project={p} variant="row" headingLevel={features.length ? 4 : 3} index={offset + features.length + i + 1} />
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {!projects.length ? (
          <p className="mt-8 max-w-prose text-lg text-ink-muted">
            Projects are being added. In the meantime, call Don to talk about your heating, cooling or hot-water work.
          </p>
        ) : null}

        {totalPages > 1 ? <Pagination page={page} totalPages={totalPages} /> : null}
      </section>

      <section aria-labelledby="our-work-cta" className="on-dark bg-midnight-900 text-limestone-100">
        <div className="container-page grid gap-8 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-7">
            <h2 id="our-work-cta" className="text-display-lg uppercase">
              Need similar work at your property?
            </h2>
            <p className="mt-4 max-w-prose text-lg text-midnight-100">
              Tell Don what you need, or call to talk it through. Ask whether Don serves your area.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:col-span-5 md:self-end md:justify-end">
            <ButtonLink href={inquiryHref({ intent: "service" })} variant="primary-on-dark">
              Request service
            </ButtonLink>
            <ButtonLink href={inquiryHref({ intent: "estimate" })} variant="secondary-on-dark">
              Request an estimate
            </ButtonLink>
            <CallLink placement="our-work-cta" variant="secondary-on-dark" />
          </div>
        </div>
      </section>
    </>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const link =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-midnight-900/40 px-3 font-semibold text-midnight-900 hover:border-midnight-900 hover:bg-midnight-900 hover:text-limestone-50";
  return (
    <nav aria-label="Project pages" className="mt-12">
      <ul className="flex flex-wrap items-center gap-2">
        {page > 1 ? (
          <li>
            <Link href={portfolioPagePath(page - 1)} className={link} rel="prev">
              Previous<span className="sr-only"> page of projects</span>
            </Link>
          </li>
        ) : null}
        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span
                aria-current="page"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm bg-midnight-900 px-3 font-semibold text-limestone-50"
              >
                <span className="sr-only">Page </span>
                {n}
              </span>
            ) : (
              <Link href={portfolioPagePath(n)} className={link}>
                <span className="sr-only">Page </span>
                {n}
              </Link>
            )}
          </li>
        ))}
        {page < totalPages ? (
          <li>
            <Link href={portfolioPagePath(page + 1)} className={link} rel="next">
              Next<span className="sr-only"> page of projects</span>
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
