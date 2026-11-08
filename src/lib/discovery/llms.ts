import "server-only";
import { business, type BusinessConfig } from "@/config/business";
import { serviceList } from "@/config/services";
import { absoluteUrl } from "@/config/site";
import { getDocumentedLocations, getPublishedProjects } from "@/lib/cms/public";

/** Keep Markdown link text from breaking the link syntax. */
function linkText(value: string): string {
  return value.replace(/[\[\]\\]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * llms.txt (https://llmstxt.org): a concise Markdown map of the public site.
 * Published projects only (no drafts, no admin, no private content).
 */
export async function buildLlmsTxt(): Promise<string> {
  const cfg = business as BusinessConfig;
  const [projects, locations] = await Promise.all([getPublishedProjects(), getDocumentedLocations()]);

  const lines: string[] = [
    `# ${cfg.displayName}`,
    "",
    `> Residential and commercial heating, cooling and hot-water installation, repair and maintenance. ` +
      `${cfg.founder.name} (founder) has ${cfg.experienceClaim} of experience, with completed work documented across ${cfg.documentedRegion}. ` +
      `Current service boundaries are not published: call ${cfg.phone.display} to confirm whether Don serves your area.`,
    "",
    "## Services",
    "",
    ...serviceList.map((s) => `- [${linkText(s.name)}](${absoluteUrl(`/services/${s.slug}`)}): ${s.summary}`),
    `- [Commercial HVAC](${absoluteUrl("/commercial")}): Heating, cooling and hot-water work for commercial buildings and the people who manage them.`,
    `- [All services](${absoluteUrl("/services")}): Overview of the heating, cooling and hot-water work Don takes on.`,
    "",
  ];

  if (projects.length) {
    lines.push("## Selected work", "");
    for (const p of projects) {
      const where = p.city ? ` (${p.city})` : "";
      lines.push(`- [${linkText(p.title)}](${absoluteUrl(`/our-work/${p.slug}`)})${where}`);
    }
    lines.push(`- [All completed projects](${absoluteUrl("/our-work")})`, "");
  }

  lines.push("## Service area", "");
  if (locations.length) {
    lines.push(
      `Completed projects are documented in: ${locations.map((l) => l.city).join(", ")} (${cfg.documentedRegion}).`,
    );
  } else {
    lines.push(`Completed projects are documented across ${cfg.documentedRegion}.`);
  }
  if (cfg.confirmedServiceArea.length) {
    lines.push(`Confirmed current service area: ${cfg.confirmedServiceArea.join(", ")}.`);
  } else {
    lines.push("Present-day coverage is not published. Ask whether Don serves your area.");
  }
  lines.push(`- [Service area](${absoluteUrl("/service-area")})`, "");

  lines.push(
    "## Contact",
    "",
    `- Phone: ${cfg.phone.display} (${cfg.phone.href})`,
    `- Email: ${cfg.email}`,
    `- [Request service or an estimate](${absoluteUrl("/contact")})`,
    `- [About ${linkText(cfg.founder.name)}](${absoluteUrl("/about")})`,
    "",
  );

  return lines.join("\n");
}
