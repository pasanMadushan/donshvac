import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

/**
 * Privileged client (bypasses RLS). Server-only; used for the inquiry rate
 * limiter and operator scripts. NEVER used to serve admin reads or writes —
 * those go through createUserClient() so RLS applies.
 */
export function createServiceClient(): SupabaseClient | null {
  const env = supabasePublicEnv();
  const secret = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!env || !secret) return null;
  return createClient(env.url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
