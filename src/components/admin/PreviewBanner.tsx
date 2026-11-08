import Link from "next/link";

/** Fixed banner so a preview can never be mistaken for the live page. */
export function PreviewBanner({ projectId }: { projectId: string }) {
  return (
    <div
      role="region"
      aria-label="Preview notice"
      className="on-dark sticky top-0 z-40 border-b-4 border-copper-300 bg-midnight-950 text-limestone-50"
    >
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <p className="text-base font-semibold">
          <span className="eyebrow mr-2 text-copper-300">Preview, not public</span>
          This is your saved draft. Visitors cannot see this page.
        </p>
        <Link
          href={`/admin/projects/${projectId}`}
          className="inline-flex min-h-11 items-center rounded-sm border border-limestone-200 px-4 text-sm font-semibold hover:bg-limestone-50 hover:text-midnight-950"
        >
          Back to the editor
        </Link>
      </div>
    </div>
  );
}
