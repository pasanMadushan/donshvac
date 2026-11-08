import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { getCommercialProjects, getDocumentedLocations, getFeaturedProjects } from "@/lib/cms/public";
import { Hero } from "@/components/home/Hero";
import { SymptomFinder } from "@/components/home/SymptomFinder";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { CommercialFeature } from "@/components/home/CommercialFeature";
import { FounderIntro } from "@/components/home/FounderIntro";
import { HomeFaq } from "@/components/home/HomeFaq";
import { ClosingContact } from "@/components/home/ClosingContact";

export const metadata: Metadata = pageMetadata({
  title: "Heating, cooling and hot water for homes and businesses | Don’s HVAC Services",
  absoluteTitle: true,
  description:
    "Furnace, air conditioner, heat pump and water heater installation, repair and maintenance for homes and businesses. Over 20 years of experience. Call Don.",
  path: "/",
});

export default async function HomePage() {
  // All reads are cached ("use cache" + projects tag), so the page prerenders.
  const [featured, commercial, locations] = await Promise.all([
    getFeaturedProjects(3),
    getCommercialProjects(),
    getDocumentedLocations(),
  ]);

  return (
    <>
      <Hero />
      <SymptomFinder />
      <FeaturedWork projects={featured} />
      <ServicesOverview />
      <CommercialFeature projects={commercial} />
      <FounderIntro />
      <HomeFaq cities={locations.map((l) => l.city)} />
      <ClosingContact />
    </>
  );
}
