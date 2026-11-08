import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { business } from "@/config/business";
import { propertyTypeLabels, serviceCategoryLabels } from "@/config/services";
import { getProjectBySlug, getPublishedProjects } from "@/lib/cms/public";

/**
 * Generated share card for projects without a chosen share photo. When a
 * share photo exists, the page's generateMetadata sets openGraph.images,
 * which takes precedence over this file for the page's og:image.
 */
export const alt = `Completed project by ${business.displayName}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "src/lib/og/fonts");
const displayFont = readFile(join(fontDir, "barlow-condensed-latin-700-normal.woff"));
const bodyFont = readFile(join(fontDir, "instrument-sans-latin-500-normal.woff"));

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const all = await getPublishedProjects();
  return all.length ? all.map((p) => ({ slug: p.slug })) : [{ slug: "__none__" }];
}

const C = {
  midnight: "#0f1e33",
  midnightLine: "#1f3a63",
  limestone: "#f4efe6",
  mist: "#9fb3cf",
  copper: "#e8a877",
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = slug === "page" ? null : await getProjectBySlug(slug);
  if (!project) notFound();

  const meta = [
    project.city,
    project.propertyType ? propertyTypeLabels[project.propertyType] : null,
    project.service ? serviceCategoryLabels[project.service] : null,
  ].filter(Boolean) as string[];
  const title = project.title.length > 90 ? `${project.title.slice(0, 87).trimEnd()}…` : project.title;
  const titleSize = title.length > 60 ? 72 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.midnight,
          color: C.limestone,
          padding: "64px 72px",
          fontFamily: "Instrument Sans",
          backgroundImage: `linear-gradient(to right, ${C.midnightLine} 1px, transparent 1px), linear-gradient(to bottom, ${C.midnightLine} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: C.copper }}>
            Completed project
          </div>
          <div style={{ display: "flex", width: 120, height: 4, background: C.copper }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Barlow Condensed",
              fontSize: titleSize,
              lineHeight: 1,
              textTransform: "uppercase",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {meta.length ? (
            <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: C.mist }}>{meta.join("  ·  ")}</div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${C.limestone}`,
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", fontFamily: "Barlow Condensed", fontSize: 40, textTransform: "uppercase" }}>
            {business.displayName}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: C.copper }}>{business.phone.display}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Barlow Condensed", data: await displayFont, style: "normal", weight: 700 },
        { name: "Instrument Sans", data: await bodyFont, style: "normal", weight: 500 },
      ],
    },
  );
}
