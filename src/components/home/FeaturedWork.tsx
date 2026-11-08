import Link from "next/link";
import type { PublicProject } from "@/lib/cms/types";
import { ProjectTeaser } from "@/components/projects/ProjectTeaser";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** One lead project card with two stacked beside it. */
export function FeaturedWork({ projects }: { projects: PublicProject[] }) {
  const [lead, ...rest] = projects;
  return (
    <section aria-labelledby="work-title" className="bg-wash py-16 sm:py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="work-title" number="02" eyebrow="Completed projects" title="Work Don has done" />
          <Link
            href="/our-work"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-midnight-700/30 bg-white px-5 font-bold text-midnight-900 shadow-sm transition-colors hover:border-copper-500 hover:text-copper-700"
          >
            See all projects
            <ArrowRightIcon />
          </Link>
        </div>
        {lead ? (
          <ul className="mt-10 grid gap-5 lg:grid-cols-12">
            <li className="lg:col-span-7">
              <ProjectTeaser project={lead} headingLevel={3} variant="card" size="lg" />
            </li>
            {rest.length ? (
              <li className="lg:col-span-5">
                <ul className="grid h-full gap-5">
                  {rest.map((p) => (
                    <li key={p.id}>
                      <ProjectTeaser project={p} headingLevel={3} variant="card" />
                    </li>
                  ))}
                </ul>
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-8 text-ink-muted">Project write-ups are being added. Call Don to ask about similar work.</p>
        )}
      </div>
    </section>
  );
}
