import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { logAdminError } from "@/lib/admin/errors";
import { isOwnerSession } from "@/lib/admin/owner-session";
import { safeAdminPath } from "@/lib/admin/safe-next";
import { isCmsConfigured } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

/**
 * Email link landing (password reset, invite). Verifies the one-time token
 * (token_hash + type, or a PKCE code), then confirms the new session belongs
 * to an approved owner before redirecting to a SAFE relative /admin path.
 * Responses are never cached (proxy + next.config set no-store on /admin).
 */
const ALLOWED_TYPES: ReadonlySet<EmailOtpType> = new Set<EmailOtpType>(["recovery", "invite", "email", "magiclink"]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeAdminPath(url.searchParams.get("next"), "/admin");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");

  if (!isCmsConfigured()) redirect("/admin/login?error=link");

  const supabase = await createUserClient();
  let session: { access_token: string; user: { id: string } } | null = null;

  if (tokenHash && type && ALLOWED_TYPES.has(type) && tokenHash.length <= 512) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) logAdminError("verify email link", { code: error.code ?? error.status });
    session = data.session ?? null;
  } else if (code && code.length <= 512) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) logAdminError("exchange email code", { code: error.code ?? error.status });
    session = data.session ?? null;
  }

  if (!session) redirect("/admin/login?error=link");

  let allowed = false;
  try {
    allowed = await isOwnerSession(session.access_token, session.user.id);
  } catch (err) {
    logAdminError("owner check after email link", err);
  }
  if (!allowed) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=link");
  }
  redirect(next);
}
