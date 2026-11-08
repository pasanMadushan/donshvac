import { requireOwnerPage } from "@/lib/auth/owner";
import { UpdatePasswordForm } from "./AuthForms";

/** Requires a verified owner session (e.g. from a reset link) before showing the form. */
export async function UpdatePasswordGate() {
  const { owner } = await requireOwnerPage();
  return (
    <>
      <p className="mb-6 text-base text-ink-muted">
        {owner.email ? (
          <>
            Choosing a new password for <span className="font-semibold text-ink">{owner.email}</span>.{" "}
          </>
        ) : null}
        After saving, use the new password the next time you sign in.
      </p>
      <UpdatePasswordForm />
    </>
  );
}
