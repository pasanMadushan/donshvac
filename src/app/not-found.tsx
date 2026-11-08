import type { Metadata } from "next";
import Link from "next/link";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="container-page py-20 md:py-28">
        <p className="eyebrow text-copper-700">Error 404</p>
        <h1 className="mt-3 max-w-3xl text-display-lg uppercase text-midnight-900">
          We couldn’t find that page
        </h1>
        <p className="mt-5 max-w-prose text-lg text-ink-muted">
          The page may have moved, or a project may no longer be listed. If you need heating, cooling or
          hot-water help, Don is a phone call away.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/services" className={buttonClasses("primary")}>Browse services</Link>
          <Link href="/" className={buttonClasses("secondary")}>Go to the home page</Link>
          <CallLink placement="not-found" variant="secondary" />
        </div>
      </section>
    </SiteChrome>
  );
}
