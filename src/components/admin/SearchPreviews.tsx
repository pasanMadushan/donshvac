"use client";

import { business } from "@/config/business";

/**
 * Illustrative previews of how the project might appear in search results and
 * when shared in apps. Search engines and apps decide their own display.
 */
const DISCLAIMER = "Illustrative preview: search engines and apps may show it differently.";

export function previewDescription(seoDescription: string, summary: string, max = 155): string {
  const explicit = seoDescription.trim();
  if (explicit) return explicit;
  const clean = summary.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export function SearchResultPreview({
  title,
  host,
  path,
  description,
}: {
  title: string;
  host: string;
  path: string;
  description: string;
}) {
  return (
    <section aria-labelledby="search-preview-heading" className="border border-limestone-300 bg-white p-5">
      <h3 id="search-preview-heading" className="eyebrow font-sans text-ink-muted">
        Search result preview
      </h3>
      <div className="mt-4 font-sans">
        <p className="break-all text-sm text-ink-muted">
          {host}
          <span className="text-ink-soft">{path.replace(/\//g, " › ").replace(/^ › /, " › ")}</span>
        </p>
        <p className="mt-1 text-xl leading-snug text-midnight-700 [overflow-wrap:anywhere]">
          {title} | {business.displayName}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted [overflow-wrap:anywhere]">
          {description || <span className="italic">Add a short description to fill this line.</span>}
        </p>
      </div>
      <p className="mt-4 border-t border-limestone-200 pt-3 text-xs text-ink-muted">{DISCLAIMER}</p>
    </section>
  );
}

export function ShareCardPreview({
  title,
  host,
  description,
  imageUrl,
}: {
  title: string;
  host: string;
  description: string;
  imageUrl: string | null;
}) {
  return (
    <section aria-labelledby="share-preview-heading" className="border border-limestone-300 bg-white p-5">
      <h3 id="share-preview-heading" className="eyebrow font-sans text-ink-muted">
        Share card preview
      </h3>
      <div className="mt-4 overflow-hidden rounded-md border border-limestone-300 font-sans">
        <div className="aspect-[1200/630] bg-midnight-900">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed preview URL of a private derivative
            <img src={imageUrl} alt="" className="block h-full w-full object-cover" />
          ) : (
            <div className="on-dark flex h-full flex-col justify-end p-4 text-limestone-50">
              <p className="eyebrow text-copper-300">{business.displayName}</p>
              <p className="mt-1 font-display text-2xl uppercase leading-none [overflow-wrap:anywhere]">{title}</p>
            </div>
          )}
        </div>
        <div className="bg-limestone-100 p-3">
          <p className="text-xs uppercase tracking-wide text-ink-muted">{host}</p>
          <p className="mt-0.5 font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
            {title} | {business.displayName}
          </p>
          {description ? <p className="mt-0.5 line-clamp-2 text-sm text-ink-muted">{description}</p> : null}
        </div>
      </div>
      <p className="mt-4 border-t border-limestone-200 pt-3 text-xs text-ink-muted">
        {imageUrl ? null : "No photo yet: a branded card is used instead. "}
        {DISCLAIMER}
      </p>
    </section>
  );
}
