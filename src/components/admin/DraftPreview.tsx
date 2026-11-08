import { notFound } from "next/navigation";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectIllustration } from "@/components/projects/ProjectIllustration";
import { ILLUSTRATION_CAPTION, projectMetaLine } from "@/components/projects/projectMeta";
import { requireOwnerPage } from "@/lib/auth/owner";
import { loadPreviewProject } from "@/lib/admin/data";
import { uuidSchema } from "@/lib/admin/schemas";
import { PreviewBanner } from "./PreviewBanner";

/**
 * Renders the DRAFT revision with the public project look, using signed
 * private image URLs. Owner-only, noindex (admin layout) and no-store.
 */
export async function DraftPreview({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireOwnerPage();
  const { id } = await params;
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) notFound();
  const project = await loadPreviewProject(supabase, parsed.data);
  if (!project) notFound();

  const title = project.title.trim() || "Untitled project";
  const meta = projectMetaLine(project);
  const paragraphs = project.summary
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <PreviewBanner projectId={parsed.data} />
      <article aria-labelledby="preview-title" className="container-page pt-10">
        <nav aria-label="Breadcrumb (preview)" className="text-sm text-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>Home</li>
            <li aria-hidden>/</li>
            <li>Our work</li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-ink">
              {title}
            </li>
          </ol>
        </nav>
        <header className="mt-6 grid gap-6 border-b border-limestone-300 pb-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {meta ? <p className="eyebrow text-copper-700">{meta}</p> : null}
            <h1 id="preview-title" className="mt-3 font-display text-display-xl uppercase text-midnight-900">
              {title}
            </h1>
          </div>
        </header>

        <div className="mt-8">
          {project.images.length ? (
            <ProjectGallery images={project.images} id="preview-photos" />
          ) : (
            <figure className="max-w-3xl border border-limestone-300 bg-white p-6">
              <ProjectIllustration category={project.service} propertyType={project.propertyType} />
              <figcaption className="mt-3 text-sm text-ink-muted">{ILLUSTRATION_CAPTION}</figcaption>
            </figure>
          )}
        </div>

        <div className="prose-copy mt-10 text-lg">
          {paragraphs.length ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="text-ink-muted">No short description yet.</p>
          )}
        </div>
      </article>
    </>
  );
}
