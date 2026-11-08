import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { business } from "@/config/business";
import { getPortfolioPage } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { PortfolioView, portfolioPagePath } from "../../_components/PortfolioView";

type Props = { params: Promise<{ page: string }> };

/** Strict page number: "2", "3"… (no leading zeros, signs or decimals). */
function parsePage(raw: string): number | null {
  return /^[1-9]\d{0,3}$/.test(raw) ? Number(raw) : null;
}

export async function generateStaticParams(): Promise<Array<{ page: string }>> {
  const { totalPages } = await getPortfolioPage(1);
  if (totalPages < 2) {
    // ensureStatic "navigation" needs at least one complete param set; this
    // one renders a 404 until a second page exists.
    return [{ page: "2" }];
  }
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page: raw } = await params;
  const n = parsePage(raw);
  if (n === null) notFound();
  return pageMetadata({
    title: `Our work, page ${n}`,
    description: `Page ${n} of documented HVAC projects completed by ${business.displayName} for homes and commercial buildings in ${business.documentedRegion}.`,
    path: portfolioPagePath(n),
  });
}

export default async function OurWorkPagedPage({ params }: Props) {
  const { page: raw } = await params;
  const n = parsePage(raw);
  if (n === null) notFound();
  if (n === 1) permanentRedirect("/our-work");
  const data = await getPortfolioPage(n);
  if (n > data.totalPages || !data.projects.length) notFound();
  return <PortfolioView projects={data.projects} page={data.page} totalPages={data.totalPages} />;
}
