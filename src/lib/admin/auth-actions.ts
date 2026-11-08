"use server";

import { redirect } from "next/navigation";
import { sitePolicy } from "@/config/site";
import { requireOwnerAction } from "@/lib/auth/owner";
import { createUserClient } from "@/lib/supabase/server";
import { isCmsConfigured } from "@/lib/supabase/env";
import { logAdminError } from "./errors";
import { isOwnerSession } from "./owner-session";
import { safeAdminPath } from "./safe-next";
import { emailSchema, loginSchema, newPasswordSchema, zodFieldErrors } from "./schemas";

/**
 * Sign-in, password reset and sign-out. Public registration is disabled at
 * the auth provider and signUp is never called. Messages never reveal whether
 * an email address has an account.
 */

export interface AuthFormState {
  status: "idle" | "error" | "sent";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of the typed email so the field is not cleared after an error. */
  email?: string;
}

const SIGN_IN_FAILED =
  "That email and password did not work, or this account does not have editor access. Check them and try again, or use “Forgot password”.";

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const emailRaw = String(formData.get("email") ?? "").slice(0, 254);
  if (!isCmsConfigured()) {
    return { status: "error", email: emailRaw, message: "Sign-in is not set up yet. Ask the site operator to finish setup." };
  }
  const parsed = loginSchema.safeParse({ email: emailRaw, password: String(formData.get("password") ?? "") });
  if (!parsed.success) return { status: "error", email: emailRaw, fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.session || !data.user) {
    if (error) logAdminError("sign in", { code: error.code ?? error.status });
    return { status: "error", email: emailRaw, message: SIGN_IN_FAILED };
  }
  // Signed in: confirm the account is an approved owner, otherwise end the session.
  let allowed = false;
  try {
    allowed = await isOwnerSession(data.session.access_token, data.user.id);
  } catch (err) {
    logAdminError("owner check", err);
  }
  if (!allowed) {
    await supabase.auth.signOut();
    return { status: "error", email: emailRaw, message: SIGN_IN_FAILED };
  }
  redirect(safeAdminPath(String(formData.get("next") ?? ""), "/admin"));
}

export async function requestPasswordResetAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const emailRaw = String(formData.get("email") ?? "").slice(0, 254);
  const parsed = emailSchema.safeParse(emailRaw);
  if (!parsed.success) {
    return { status: "error", email: emailRaw, fieldErrors: { email: "Enter the email address you sign in with." } };
  }
  if (isCmsConfigured()) {
    try {
      const supabase = await createUserClient();
      const redirectTo = `${sitePolicy.publicOrigin}/admin/auth/confirm?next=/admin/update-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo });
      if (error) logAdminError("password reset request", { code: error.code ?? error.status });
    } catch (err) {
      logAdminError("password reset request", err);
    }
  }
  // Always the same answer, whether or not the address has an account.
  return {
    status: "sent",
    message:
      "If that email address belongs to an editor account, a reset link is on its way. Check your inbox (and spam folder). The link works once and expires after a short time.",
  };
}

export async function updatePasswordAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  let supabase;
  try {
    ({ supabase } = await requireOwnerAction());
  } catch {
    return { status: "error", message: "Your reset link has expired or you are signed out. Request a new link from the sign-in page." };
  }
  const parsed = newPasswordSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { status: "error", fieldErrors: zodFieldErrors(parsed.error) };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logAdminError("update password", { code: error.code ?? error.status });
    const message =
      error.code === "same_password"
        ? "Choose a password that is different from your current one."
        : error.code === "weak_password"
          ? "That password is too easy to guess. Try a longer phrase of several unrelated words."
          : error.code === "reauthentication_needed"
            ? "For security, request a new reset link from the sign-in page and try again."
            : "The password could not be changed. Try again, or request a new reset link.";
    return { status: "error", message };
  }
  redirect("/admin?password=updated");
}

export async function signOutAction(): Promise<void> {
  // Signing out needs no privileges; it only ends this browser's session.
  if (isCmsConfigured()) {
    try {
      const supabase = await createUserClient();
      await supabase.auth.signOut();
    } catch (err) {
      logAdminError("sign out", err);
    }
  }
  redirect("/admin/login?signed-out=1");
}
