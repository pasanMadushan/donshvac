import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoading } from "@/components/admin/Loading";
import { NewProjectPanel } from "@/components/admin/NewProjectPanel";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <NewProjectPanel />
    </Suspense>
  );
}
