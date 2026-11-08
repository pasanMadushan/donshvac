import "server-only";
import { redirect } from "next/navigation";
import { createUserClient } from "@/lib/supabase/server";
import { isCmsConfigured } from "@/lib/supabase/env";

export interface Owner {
  id: string;
  email: string | null;
}

/** Optional extra allow-list (comma-separated auth user ids). */
function envAllowList(): string[] | null {
  const raw = process.env.OWNER_USER_IDS?.trim();
  return raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : null;
}

/**
 * Verifies the session with the Auth server (getUser, not a cookie decode) and
 * explicitly authorises the user against public.owners (and OWNER_USER_IDS
 * when set). Returns null for anonymous or non-owner users.
 */
export async function getVerifiedOwner() {
  if (!isCmsConfigured()) return { owner: null, supabase: null, reason: "not-configured" as const };
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { owner: null, supabase, reason: "signed-out" as const };
  const allow = envAllowList();
  if (allow && !allow.includes(data.user.id)) return { owner: null, supabase, reason: "not-owner" as const };
  const { data: isOwner, error: ownerErr } = await supabase.rpc("is_owner");
  if (ownerErr || isOwner !== true) return { owner: null, supabase, reason: "not-owner" as const };
  return {
    owner: { id: data.user.id, email: data.user.email ?? null } satisfies Owner,
    supabase,
    reason: null,
  };
}

/** For admin pages: redirects anyone who is not an approved owner. */
export async function requireOwnerPage() {
  const result = await getVerifiedOwner();
  if (!result.owner || !result.supabase) {
    redirect(result.reason === "not-owner" ? "/admin/login?error=not-authorised" : "/admin/login");
  }
  return { owner: result.owner, supabase: result.supabase };
}

export class NotAuthorisedError extends Error {
  constructor() {
    super("Not authorised");
  }
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requireOwnerAction() {
  const result = await getVerifiedOwner();
  if (!result.owner || !result.supabase) throw new NotAuthorisedError();
  return { owner: result.owner, supabase: result.supabase };
}
