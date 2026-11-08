import Link from "next/link";
import { business } from "@/config/business";

/** Static admin chrome (no session read, so it is part of the static shell). */
export function AdminHeader() {
  return (
    <header className="on-dark border-b border-midnight-700 bg-midnight-900 text-limestone-50">
      <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
        <Link href="/admin" className="inline-flex min-h-11 items-center gap-3 no-underline">
          <span className="font-display text-xl font-semibold uppercase tracking-wide">{business.shortName}</span>
          <span className="eyebrow text-copper-300">Project editor</span>
        </Link>
      </div>
    </header>
  );
}

export function SkipLink() {
  return (
    <a
      href="#admin-main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-3 focus:text-ink"
    >
      Skip to content
    </a>
  );
}
