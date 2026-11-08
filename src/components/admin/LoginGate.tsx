import { redirect } from "next/navigation";
import { getVerifiedOwner } from "@/lib/auth/owner";
import { safeAdminPath } from "@/lib/admin/safe-next";
import { LoginForm } from "./AuthForms";

const notices: Record<string, { tone: "info" | "error"; text: string }> = {
  "not-authorised": {
    tone: "error",
    text: "That account does not have editor access. Sign in with the editor account, or ask the site operator for help.",
  },
  link: {
    tone: "error",
    text: "That email link is invalid, already used or expired. Request a new one with “Forgot password”.",
  },
  "signed-out": { tone: "info", text: "You are signed out." },
};

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Request-time part of the sign-in page (inside Suspense). */
export async function LoginGate({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = safeAdminPath(first(sp.next), "/admin");
  const { owner } = await getVerifiedOwner();
  if (owner) redirect(next);

  const key = first(sp.error) ?? (first(sp["signed-out"]) ? "signed-out" : undefined);
  const notice = key ? notices[key] : undefined;
  return (
    <>
      {notice ? (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          className={`mb-6 border-l-4 bg-white p-4 text-base ${notice.tone === "error" ? "border-danger-700" : "border-midnight-500"}`}
        >
          {notice.text}
        </div>
      ) : null}
      <LoginForm next={next} />
    </>
  );
}
