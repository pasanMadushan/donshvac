import Link from "next/link";
import { JsonLd, breadcrumbJsonLd, type Crumb } from "@/lib/seo/jsonld";

/**
 * Visible breadcrumbs AND matching BreadcrumbList JSON-LD from one array, so
 * structured data can never drift from what visitors see.
 */
export function Breadcrumbs({ crumbs, tone = "light" }: { crumbs: Crumb[]; tone?: "light" | "dark" }) {
  const muted = tone === "dark" ? "text-midnight-300" : "text-ink-muted";
  const link = tone === "dark" ? "text-limestone-100 hover:text-copper-300" : "text-ink hover:text-copper-700";
  return (
    <>
      <nav aria-label="Breadcrumb" className={`text-sm ${muted}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page">{c.name}</span>
                ) : (
                  <>
                    <Link href={c.path} className={`underline underline-offset-4 decoration-1 ${link}`}>
                      {c.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
