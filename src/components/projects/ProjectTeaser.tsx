import Link from "next/link";
import type { PublicProject } from "@/lib/cms/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { IllustrationPanel } from "@/components/ui/IllustrationPanel";
import { toneClasses, toneFor } from "@/components/ui/tone";
import { ProjectIllustration } from "./ProjectIllustration";
import { ProjectPhoto } from "./ProjectPhoto";
import { ILLUSTRATION_CAPTION, projectMetaParts, projectPath } from "./projectMeta";

type HeadingLevel = 2 | 3 | 4;

/**
 * Project teaser used by home, service, commercial and portfolio pages.
 *  - "feature": wide split composition (media + text)
 *  - "card": stacked glass card (media on top)
 *  - "row": compact list row
 * Every teaser links with an ordinary <a href> whose text is the project title.
 * Illustrations (no approved photo) are always captioned as illustrations.
 */
export function ProjectTeaser({
  project,
  headingLevel = 3,
  variant = "row",
  priority = false,
  reverse = false,
  index,
  size = "md",
}: {
  project: PublicProject;
  headingLevel?: HeadingLevel;
  variant?: "feature" | "row" | "card";
  /** Load the cover photo eagerly with high fetch priority (first feature above the fold). */
  priority?: boolean;
  /** Feature only: place the media on the right on wide screens. */
  reverse?: boolean;
  /** Optional display number ("01") shown as a marker. */
  index?: number;
  /** Card only: "lg" for a lead card. */
  size?: "md" | "lg";
}) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  const href = projectPath(project.slug);
  const meta = projectMetaParts(project);
  const number = typeof index === "number" ? String(index).padStart(2, "0") : null;
  const tone = toneFor(project.service);
  const t = toneClasses[tone];

  const media = (sizes: string, aspect: string) =>
    project.cover ? (
      <ProjectPhoto image={project.cover} priority={priority} sizes={sizes} className={`${aspect} rounded-md`} />
    ) : (
      <>
        <IllustrationPanel tone={tone} className={aspect}>
          <ProjectIllustration category={project.service} propertyType={project.propertyType} className="h-full w-full" />
        </IllustrationPanel>
        <figcaption className="mt-2 text-xs text-ink-muted">{ILLUSTRATION_CAPTION}</figcaption>
      </>
    );

  const metaChips = meta.length ? (
    <ul className="flex flex-wrap gap-1.5" aria-label="Project details">
      {meta.map((m, i) => (
        <li key={m} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${i === meta.length - 1 ? t.chip : "bg-white text-ink-muted ring-1 ring-limestone-300"}`}>
          {m}
        </li>
      ))}
    </ul>
  ) : null;

  if (variant === "card") {
    return (
      <article className={`glass group relative flex h-full flex-col overflow-hidden rounded-lg p-3 ring-0 ring-transparent transition-all hover:-translate-y-0.5 hover:ring-2 ${t.ring}`}>
        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${t.bar}`} />
        {size === "lg" && project.cover ? (
          // Lead card: the photo grows to fill the height of the cards beside it.
          <figure className="relative m-0 lg:min-h-80 lg:flex-1">
            <ProjectPhoto
              image={project.cover}
              priority={priority}
              sizes="(min-width: 1024px) 700px, 100vw"
              className="aspect-[4/3] rounded-md transition-transform duration-500 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
            />
          </figure>
        ) : (
          <figure className="m-0">{media(size === "lg" ? "(min-width: 1024px) 700px, 100vw" : "(min-width: 1024px) 480px, 100vw", size === "lg" ? "aspect-[4/3]" : "aspect-[16/9]")}</figure>
        )}
        <div className={`flex flex-col px-2 pt-3 pb-2 ${size === "lg" && project.cover ? "" : "flex-1"}`}>
          {metaChips}
          <H className={`mt-3 uppercase leading-[1.02] text-midnight-900 ${size === "lg" ? "text-display-md" : "text-2xl"}`}>
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] hover:text-copper-700">
              {project.title}
            </Link>
          </H>
          <p className={`mt-2 text-ink-muted ${size === "lg" ? "" : "line-clamp-3 text-sm"}`}>{project.summary}</p>
          <p className={`mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold ${t.text}`} aria-hidden="true">
            View the project
            <ArrowRightIcon width={16} height={16} className="transition-transform group-hover:translate-x-1" />
          </p>
        </div>
      </article>
    );
  }

  if (variant === "feature") {
    return (
      <article className="glass grid gap-6 rounded-lg p-3 sm:p-4 md:grid-cols-12 md:items-center md:gap-10">
        <figure className={`m-0 md:col-span-7 ${reverse ? "md:order-2" : ""}`}>
          {media("(min-width: 1216px) 680px, (min-width: 768px) 58vw, 100vw", "aspect-[4/3]")}
        </figure>
        <div className={`px-2 pb-3 md:col-span-5 md:px-0 md:pb-0 ${reverse ? "md:order-1 md:pl-4" : "md:pr-4"}`}>
          <div className="flex items-center gap-3">
            {number ? (
              <span aria-hidden="true" className={`font-display text-display-md font-bold ${t.text}`}>
                {number}
              </span>
            ) : null}
            <span aria-hidden="true" className={`h-1 w-12 rounded-full ${t.bar}`} />
          </div>
          <div className="mt-3">{metaChips}</div>
          <H className="mt-4 text-display-md uppercase text-midnight-900">
            <Link href={href} className="hover:text-copper-700">
              {project.title}
            </Link>
          </H>
          <p className="mt-4 text-ink-muted">{project.summary}</p>
          <p className="mt-5">
            <Link
              href={href}
              className={`inline-flex min-h-11 items-center gap-2 font-bold underline underline-offset-4 decoration-1 hover:decoration-2 ${t.text}`}
            >
              View the project<span className="sr-only">: {project.title}</span>
              <ArrowRightIcon />
            </Link>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative grid grid-cols-[auto_1fr] items-center gap-x-4 rounded-md px-3 py-3 transition-colors hover:bg-white sm:grid-cols-[auto_1fr_auto] sm:gap-x-5">
      {project.cover ? (
        <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-32">
          <ProjectPhoto
            image={project.cover}
            sizes="128px"
            className="h-full! w-full transition-transform duration-500 group-hover:scale-105"
          />
          <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 ${t.bar}`} />
        </span>
      ) : (
        <span aria-hidden="true" className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-lg font-bold text-midnight-950 ${t.bar}`}>
          {number ?? <span className="h-2 w-2 rounded-full bg-white/80" />}
        </span>
      )}
      <div className="min-w-0">
        <H className="text-xl leading-tight uppercase text-midnight-900 sm:text-2xl">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] group-hover:text-copper-700">
            {project.title}
          </Link>
        </H>
        {meta.length ? <p className="mt-0.5 text-sm text-ink-muted">{meta.join(" · ")}</p> : null}
      </div>
      <span aria-hidden="true" className={`col-start-3 hidden transition-transform group-hover:translate-x-1 sm:block ${t.text}`}>
        <ArrowRightIcon />
      </span>
    </article>
  );
}
