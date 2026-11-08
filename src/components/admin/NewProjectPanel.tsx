import Link from "next/link";
import { requireOwnerPage } from "@/lib/auth/owner";
import { createProjectAction } from "@/lib/admin/actions";
import { primaryButton } from "./ui";

/** GET never creates anything: the owner confirms with a button (POST). */
export async function NewProjectPanel() {
  await requireOwnerPage();
  return (
    <div className="container-page max-w-2xl">
      <p className="eyebrow text-copper-700">New project</p>
      <h1 className="mt-2 font-display text-display-lg uppercase text-midnight-900">Add a project</h1>
      <p className="mt-4 text-base text-ink-muted">
        This starts a private draft. Nothing appears on the website until you press Publish.
      </p>
      <form action={createProjectAction} className="mt-8">
        <button type="submit" className={primaryButton}>
          Start a new project
        </button>
      </form>
      <p className="mt-8">
        <Link href="/admin" className="text-copper-700 underline underline-offset-4">
          Back to your projects
        </Link>
      </p>
    </div>
  );
}
