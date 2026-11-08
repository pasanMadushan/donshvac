import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "@/lib/supabase/env";

/**
 * Owner check for a session that was JUST created in this request (sign-in,
 * email-link confirmation), before its cookies are readable. Uses the new
 * access token directly; the same rules as getVerifiedOwner() apply
 * (OWNER_USER_IDS allow-list when set, plus the is_owner RPC).
 */
export async function isOwnerSession(accessToken: string, userId: string): Promise<boolean> {
  const raw = process.env.OWNER_USER_IDS?.trim();
  if (raw) {
    const allow = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!allow.includes(userId)) return false;
  }
  const env = supabasePublicEnv();
  if (!env) return false;
  const client = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data, error } = await client.rpc("is_owner");
  return !error && data === true;
}
