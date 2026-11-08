import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { ArrowRightIcon } from "@/components/ui/icons";

/**
 * Closing next step for inner pages: call Don, or send a written request.
 * Dark band so it reads as the end of the page.
 */
export function ClosingCta({
  id,
  heading,
  children,
  requestHref,
  requestLabel,
  placement,
}: {
  /** id for the h2 (section is labelled by it). */
  id: string;
  heading: string;
  children: ReactNode;
  requestHref: string;
  requestLabel: string;
  /** Analytics placement for the call link, [a-z0-9-]. */
  placement: string;
}) {
  return (
    <section aria-labelledby={id} className="on-dark bg-midnight-900 text-limestone-100">
      <div className="container-page grid gap-8 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-7">
          <h2 id={id} className="text-display-lg uppercase text-limestone-50">
            {heading}
          </h2>
          <div className="mt-5 max-w-prose text-lg text-midnight-100">{children}</div>
        </div>
        <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-stretch md:justify-end">
          <CallLink placement={placement} variant="primary-on-dark" />
          <ButtonLink href={requestHref} variant="secondary-on-dark">
            <span>{requestLabel}</span>
            <ArrowRightIcon />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** Numbered section heading used across the inner pages. */
export function SectionHeading({
  id,
  number,
  children,
  eyebrow,
}: {
  id: string;
  number?: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-midnight-900/25 pt-6">
      {number || eyebrow ? (
        <p className="eyebrow flex gap-3 text-copper-700">
          {number ? <span aria-hidden="true">{number}</span> : null}
          {eyebrow ? <span>{eyebrow}</span> : null}
        </p>
      ) : null}
      <h2 id={id} className="mt-3 text-display-md uppercase text-midnight-900">
        {children}
      </h2>
    </div>
  );
}
