import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/Loading";
import { DraftPreview } from "@/components/admin/DraftPreview";

export const metadata: Metadata = { title: "Preview" };

export default function PreviewProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AdminLoading label="Loading the preview…" />}>
      <DraftPreview params={params} />
    </Suspense>
  );
}
