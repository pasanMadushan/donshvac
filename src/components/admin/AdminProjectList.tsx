import Link from "next/link";
import { requireOwnerPage } from "@/lib/auth/owner";
import { createProjectAction } from "@/lib/admin/actions";
import { listProjects } from "@/lib/admin/data";
import { logAdminError } from "@/lib/admin/errors";
import type { AdminProjectRow } from "@/lib/admin/types";
import { AccountBar } from "./AccountBar";
import { formatUpdated } from "./format";
import { StatusBadge } from "./StatusBadge";
import { primaryButton } from "./ui";

const notices: Record<string, string> = {
  deleted: "The project was deleted. It is no longer on the website.",
  "password-updated": "Your new password is saved.",
  create: "A new project could not be started. Try again in a moment.",
};

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export async function AdminProjectList({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { owner, supabase } = await requireOwnerPage();
  const sp = await searchParams;
  const noticeKey = first(sp.deleted)
    ? "deleted"
    : first(sp.password) === "updated"
      ? "password-updated"
      : first(sp.error) === "create"
        ? "create"
        : null;

  let projects: AdminProjectRow[] | null = null;
  try {
    projects = await listProjects(supabase);
  } catch (err) {
    logAdminError("project list", err);
  }

  return (
    <div className="container-page">
      <AccountBar email={owner.email} />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-copper-700">Project editor</p>
          <h1 className="mt-2 font-display text-display-lg uppercase text-midnight-900">Your projects</h1>
        </div>
        <form action={createProjectAction}>
          <button type="submit" className={primaryButton}>
            <span aria-hidden>+</span> New project
          </button>
        </form>
      </div>

      {noticeKey ? (
        <p
          role={noticeKey === "create" ? "alert" : "status"}
          className={`mt-6 border-l-4 bg-white p-4 text-base ${noticeKey === "create" ? "border-danger-700" : "border-success-700"}`}
        >
          {notices[noticeKey]}
        </p>
      ) : null}

      {projects === null ? (
        <p role="alert" className="mt-8 border-l-4 border-danger-700 bg-white p-4 text-base">
          Your projects could not be loaded. Reload the page in a moment. If this keeps happening, contact the site
          operator.
        </p>
      ) : projects.length === 0 ? (
        <div className="mt-10 max-w-xl border-t border-limestone-300 pt-6">
          <h2 className="font-display text-display-md uppercase text-midnight-900">No projects yet</h2>
          <p className="mt-2 text-base text-ink-muted">
            Press “New project” to add your first job: a title, a short description and a few photos are enough.
          </p>
        </div>
      ) : (
        <section aria-labelledby="project-list-heading" className="mt-10">
          <h2 id="project-list-heading" className="sr-only">
            All projects
          </h2>
          <p className="text-sm text-ink-muted">Most recently changed first.</p>
          <ul className="mt-3 divide-y divide-limestone-300 border-y border-limestone-300">
            {projects.map((p) => {
              const title = p.title || "Untitled project";
              const live = p.slug && (p.statusKey === "published" || p.statusKey === "published-changes");
              return (
                <li key={p.id} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug text-ink font-sans">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="underline decoration-limestone-400 underline-offset-4 hover:decoration-copper-700"
                      >
                        {title}
                      </Link>
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
                      <StatusBadge status={p.statusKey} />
                      <span>
                        Last updated <time dateTime={p.updatedAt}>{formatUpdated(p.updatedAt)}</time>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="inline-flex min-h-11 items-center rounded-sm border border-midnight-900 bg-white px-4 text-sm font-semibold text-midnight-900 hover:bg-midnight-900 hover:text-limestone-50"
                    >
                      Edit<span className="sr-only"> {title}</span>
                    </Link>
                    {live ? (
                      <a
                        href={`/our-work/${p.slug}`}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex min-h-11 items-center rounded-sm px-2 text-sm font-semibold text-copper-700 underline underline-offset-4"
                      >
                        View live project<span className="sr-only">: {title} (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
