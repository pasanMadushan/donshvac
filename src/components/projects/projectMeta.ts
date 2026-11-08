import {
  propertyTypeLabels,
  serviceCategoryLabels,
  servicePathForCategory,
  type ProjectServiceCategory,
} from "@/config/services";
import type { InquiryIntent, InquiryService } from "@/lib/inquiry/prefill";
import { inquiryHref } from "@/lib/inquiry/prefill";
import type { PublicProject } from "@/lib/cms/types";

/** Ordered, human-readable facts about a project: city, property type, service. */
export function projectMetaParts(project: Pick<PublicProject, "city" | "propertyType" | "service">): string[] {
  const parts: string[] = [];
  if (project.city) parts.push(project.city);
  if (project.propertyType) parts.push(propertyTypeLabels[project.propertyType]);
  if (project.service) parts.push(serviceCategoryLabels[project.service]);
  return parts;
}

/** "Brampton · Residential · Heat pump" (empty string when nothing is known). */
export function projectMetaLine(
  project: Pick<PublicProject, "city" | "propertyType" | "service">,
  separator = " · ",
): string {
  return projectMetaParts(project).join(separator);
}

/** Every project category maps 1:1 to an inquiry service value. */
const inquiryServiceByCategory: Record<ProjectServiceCategory, InquiryService> = {
  furnaces: "furnaces",
  "air-conditioning": "air-conditioning",
  "water-heaters": "water-heaters",
  "heat-pumps": "heat-pumps",
  ductwork: "ductwork",
  thermostats: "thermostats",
  "gas-lines": "gas-lines",
};

export function inquiryServiceForProject(project: Pick<PublicProject, "service">): InquiryService {
  return project.service ? inquiryServiceByCategory[project.service] : "not-sure";
}

/** "Ask about a similar project" link with the project context prefilled. */
export function similarProjectInquiryHref(project: Pick<PublicProject, "slug" | "service" | "propertyType">): string {
  const commercial = project.propertyType === "commercial";
  const intent: InquiryIntent = commercial ? "commercial" : "estimate";
  return inquiryHref({
    intent,
    service: inquiryServiceForProject(project),
    property: project.propertyType ?? undefined,
    project: project.slug,
  });
}

/** Public service page most relevant to this project. */
export function relatedServiceFor(project: Pick<PublicProject, "service" | "propertyType">) {
  return servicePathForCategory(project.service, project.propertyType);
}

/**
 * Up to `n` other projects, preferring the same service category, then the
 * same property type, then the rest in display order.
 */
export function similarProjects(all: PublicProject[], project: PublicProject, n = 3): PublicProject[] {
  const others = all.filter((p) => p.slug !== project.slug);
  const score = (p: PublicProject) =>
    (project.service && p.service === project.service ? 2 : 0) +
    (project.propertyType && p.propertyType === project.propertyType ? 1 : 0);
  return others
    .map((p, i) => ({ p, i, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, Math.max(0, n))
    .map((x) => x.p);
}

export const projectPath = (slug: string) => `/our-work/${slug}`;

export const ILLUSTRATION_CAPTION = "Illustration — not a photo of this job";
