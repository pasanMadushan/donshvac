import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectIllustration } from "@/components/projects/ProjectIllustration";
import { ProjectTeaser } from "@/components/projects/ProjectTeaser";
import {
  ILLUSTRATION_CAPTION,
  projectPath,
  relatedServiceFor,
  similarProjectInquiryHref,
  similarProjects,
} from "@/components/projects/projectMeta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";
import { business } from "@/config/business";
import { propertyTypeLabels, serviceCategoryLabels } from "@/config/services";
import { absoluteUrl } from "@/config/site";
import { getProjectBySlug, getPublishedProjects } from "@/lib/cms/public";
import type { PublicProject } from "@/lib/cms/types";
import { pageMetadata, toDescription } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

/** "page" is the pagination segment, never a project. */
const RESERVED_SLUGS = new Set(["page"]);

async function loadProject(slug: string): Promise<PublicProject | null> {
  if (RESERVED_SLUGS.has(slug) || !/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  return getProjectBySlug(slug);
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const all = await getPublishedProjects();
  // ensureStatic "navigation" needs at least one complete param set. Slugs
  // published later still render on demand (dynamicParams defaults to true).
  return all.length ? all.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();
  const share = project.shareImage;
  // A chosen share photo is set as openGraph.images here, which Next.js
  // prefers over the file-based opengraph-image for this segment. Without
  // one, `image` is omitted and the generated card is used.
  return pageMetadata({
    title: project.seoTitle || project.title,
    description: project.seoDescription || toDescription(project.summary),
    path: projectPath(project.slug),
    type: "article",
    publishedTime: project.publishedAt,
    modifiedTime: project.modifiedAt,
    image: share
      ? {
          url: share.src.startsWith("/") ? absoluteUrl(share.src) : share.src,
          width: share.width,
          height: share.height,
          alt: share.alt || project.title,
        }
      : undefined,
  });
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export default async function ProjectPage({ params }: Props) {
  // Resolve before any streaming so an unknown or unpublished slug is a real 404.
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();

  const all = await getPublishedProjects();
  const others = similarProjects(all, project, 3);
  const related = relatedServiceFor(project);
  const askHref = similarProjectInquiryHref(project);
  const commercial = project.propertyType === "commercial";

  return (
    <>
      <article aria-labelledby="project-title">
        <header className="page-hero on-dark">
          <div className="container-page pt-8 pb-12 md:pt-10 md:pb-16">
            <Breadcrumbs
              crumbs={[
                { name: "Home", path: "/" },
                { name: "Our work", path: "/our-work" },
                { name: project.title, path: projectPath(project.slug) },
              ]}
            />
            <p className="eyebrow mt-10 text-copper-700">Completed project</p>
            <h1 id="project-title" className="mt-3 max-w-4xl text-display-xl uppercase text-midnight-900">
              {project.title}
            </h1>
            <dl className="mt-8 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-3 border-t border-midnight-900 pt-4 text-base sm:grid-cols-3">
              {project.city ? (
                <div>
                  <dt className="eyebrow text-ink-muted">Location of this job</dt>
                  <dd className="mt-1 font-semibold">{project.city}</dd>
                </div>
              ) : null}
              {project.propertyType ? (
                <div>
                  <dt className="eyebrow text-ink-muted">Property</dt>
                  <dd className="mt-1 font-semibold">{propertyTypeLabels[project.propertyType]}</dd>
                </div>
              ) : null}
              {project.service ? (
                <div>
                  <dt className="eyebrow text-ink-muted">Service</dt>
                  <dd className="mt-1 font-semibold">
                    <Link
                      href={related.href}
                      className="text-copper-700 underline underline-offset-4 decoration-1 hover:decoration-2"
                    >
                      {serviceCategoryLabels[project.service]}
                      <span className="sr-only"> — {related.label} service page</span>
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <div className="container-page py-12 md:py-16">
          {project.images.length ? (
            <section aria-labelledby="project-photos-heading">
              <h2 id="project-photos-heading" className="sr-only">
                Photos
              </h2>
              <ProjectGallery images={project.images} />
            </section>
          ) : (
            <figure className="max-w-4xl">
              <div className="blueprint-grid border border-midnight-900/15 bg-limestone-50 p-4 sm:p-10">
                <ProjectIllustration
                  category={project.service}
                  propertyType={project.propertyType}
                  title={`Line drawing of ${project.service ? serviceCategoryLabels[project.service].toLowerCase() : "HVAC"} equipment`}
                />
              </div>
              <figcaption className="mt-2 text-sm text-ink-muted">{ILLUSTRATION_CAPTION}</figcaption>
            </figure>
          )}

          <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12">
            <section aria-labelledby="project-about-heading" className="md:col-span-7">
              <h2 id="project-about-heading" className="text-display-md uppercase text-midnight-900">
                About this job
              </h2>
              <div className="prose-copy mt-5 text-lg">
                {paragraphs(project.summary).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="mt-6 max-w-prose text-ink-muted">
                {project.city ? `${project.city} is where this job was done. ` : ""}
                Ask whether Don serves your area.
              </p>
            </section>

            <aside aria-labelledby="project-next-heading" className="md:col-span-5">
              <div className="border-t border-midnight-900 pt-5">
                <h2 id="project-next-heading" className="text-2xl uppercase text-midnight-900">
                  {commercial ? "Planning similar work for a building?" : "Planning similar work at home?"}
                </h2>
                <p className="mt-3 text-ink-muted">
                  Send Don the details and mention this project, or call to talk it through.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href={askHref} variant="primary">
                    Ask about a similar project
                  </ButtonLink>
                  <CallLink placement="project-detail" variant="secondary" />
                </div>
                <p className="mt-8 eyebrow text-ink-muted">Related service</p>
                <p className="mt-2">
                  <Link
                    href={related.href}
                    className="inline-flex min-h-11 items-center gap-2 font-semibold text-copper-700 underline underline-offset-4 decoration-1 hover:decoration-2"
                  >
                    {related.label}
                    {related.href.startsWith("/services/") ? " service" : ""}
                    <ArrowRightIcon />
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {others.length ? (
        <section aria-labelledby="more-projects-heading" className="border-t border-midnight-900/15 bg-limestone-50">
          <div className="container-page py-12 md:py-16">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 id="more-projects-heading" className="text-display-md uppercase text-midnight-900">
                More completed projects
              </h2>
              <Link
                href="/our-work"
                className="font-semibold text-copper-700 underline underline-offset-4 decoration-1 hover:decoration-2"
              >
                All projects by {business.shortName}
              </Link>
            </div>
            <ol className="mt-6 border-b border-midnight-900/25">
              {others.map((p, i) => (
                <li key={p.id}>
                  <ProjectTeaser project={p} variant="row" headingLevel={3} index={i + 1} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}
