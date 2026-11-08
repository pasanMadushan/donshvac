import { signOutAction } from "@/lib/admin/auth-actions";

/** Signed-in owner bar with sign-out. Rendered only after the owner check. */
export function AccountBar({ email }: { email: string | null }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-limestone-300 pb-4 text-sm text-ink-muted">
      <p>
        Signed in{email ? (
          <>
            {" "}as <span className="font-semibold text-ink">{email}</span>
          </>
        ) : null}
      </p>
      <form action={signOutAction}>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-sm border border-ink-soft bg-white px-4 text-sm font-semibold text-ink hover:border-midnight-900"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
