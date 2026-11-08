import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminProjectList } from "@/components/admin/AdminProjectList";
import { AdminLoading } from "@/components/admin/Loading";

export const metadata: Metadata = { title: "Your projects" };

export default function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<AdminLoading label="Loading your projects…" />}>
      <AdminProjectList searchParams={searchParams} />
    </Suspense>
  );
}
