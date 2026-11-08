import Link from "next/link";
import { notFound } from "next/navigation";
import { sitePolicy } from "@/config/site";
import { requireOwnerPage } from "@/lib/auth/owner";
import { loadEditorProject } from "@/lib/admin/data";
import { logAdminError } from "@/lib/admin/errors";
import { uuidSchema } from "@/lib/admin/schemas";
import type { EditorProject } from "@/lib/admin/types";
import { AccountBar } from "./AccountBar";
import { ProjectEditor } from "./ProjectEditor";

/** Request-time editor loader: owner check FIRST, then an RLS-backed read. */
export async function EditorLoader({ params }: { params: Promise<{ id: string }> }) {
  const { owner, supabase } = await requireOwnerPage();
  const { id } = await params;
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) notFound();

  let project: EditorProject | null;
  try {
    project = await loadEditorProject(supabase, parsed.data);
  } catch (err) {
    logAdminError("load editor", err);
    return (
      <div className="container-page">
        <AccountBar email={owner.email} />
        <h1 className="mt-8 font-display text-display-lg uppercase text-midnight-900">Project unavailable</h1>
        <p role="alert" className="mt-4 border-l-4 border-danger-700 bg-white p-4 text-base">
          This project could not be loaded. Reload the page in a moment.
        </p>
        <p className="mt-6">
          <Link href="/admin" className="text-copper-700 underline underline-offset-4">
            Back to your projects
          </Link>
        </p>
      </div>
    );
  }
  if (!project) notFound();

  return (
    <div className="container-page">
      <AccountBar email={owner.email} />
      <ProjectEditor project={project} siteHost={new URL(sitePolicy.publicOrigin).host} />
    </div>
  );
}
