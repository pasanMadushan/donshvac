import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorLoader } from "@/components/admin/EditorLoader";
import { AdminLoading } from "@/components/admin/Loading";

export const metadata: Metadata = { title: "Edit project" };

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<AdminLoading label="Loading the project…" />}>
      <EditorLoader params={params} />
    </Suspense>
  );
}
