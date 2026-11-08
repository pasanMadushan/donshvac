import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/admin/AuthCard";
import { AdminLoading } from "@/components/admin/Loading";
import { UpdatePasswordGate } from "@/components/admin/UpdatePasswordGate";

export const metadata: Metadata = { title: "Choose a new password" };

export default function UpdatePasswordPage() {
  return (
    <AuthCard title="Choose a new password">
      <Suspense fallback={<AdminLoading />}>
        <UpdatePasswordGate />
      </Suspense>
    </AuthCard>
  );
}
