import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/admin/AuthCard";
import { LoginGate } from "@/components/admin/LoginGate";
import { AdminLoading } from "@/components/admin/Loading";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AuthCard title="Sign in to the project editor">
      <Suspense fallback={<AdminLoading />}>
        <LoginGate searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
