import { STATUS_LABELS, type StatusKey } from "@/lib/admin/types";

const tone: Record<StatusKey, string> = {
  draft: "border-ink-soft bg-white text-ink",
  published: "border-success-700 bg-white text-success-700",
  "published-changes": "border-copper-700 bg-copper-100 text-copper-800",
  unpublished: "border-midnight-500 bg-midnight-100 text-midnight-900",
};

export function StatusBadge({ status }: { status: StatusKey }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-sm font-semibold ${tone[status]}`}
    >
      <span aria-hidden className="inline-block size-2 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
