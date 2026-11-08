import { business } from "@/config/business";
import { getPortfolioPage } from "@/lib/cms/public";
import { pageMetadata } from "@/lib/seo/metadata";
import { PortfolioView } from "./_components/PortfolioView";

export const metadata = pageMetadata({
  title: `Completed HVAC projects in ${business.documentedRegion}`,
  description: `Documented furnace, air conditioning, water heater, heat pump, ductwork, thermostat and gas line jobs completed by ${business.displayName} for homes and commercial buildings in ${business.documentedRegion}.`,
  path: "/our-work",
});

export default async function OurWorkPage() {
  const { projects, page, totalPages } = await getPortfolioPage(1);
  return <PortfolioView projects={projects} page={page} totalPages={totalPages} />;
}
