/** Suspense fallback for owner pages (rendered in the static shell). */
export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="container-page">
      <p role="status" className="py-10 text-base text-ink-muted">
        {label}
      </p>
    </div>
  );
}
