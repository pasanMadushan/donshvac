import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/admin/AuthCard";
import { ForgotPasswordForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = { title: "Forgot password" };

/** No session read: the form is static and the action always answers the same way. */
export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset your password">
      <p className="mb-6 text-base text-ink-muted">
        Enter the email address you use to sign in. If it belongs to an editor account, we will email you a link to
        choose a new password.
      </p>
      <ForgotPasswordForm />
      <p className="mt-8 text-base">
        <Link href="/admin/login" className="text-copper-700 underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
