import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicEnv } from "./env";

/**
 * Anonymous, cookie-less client for public reads inside `use cache` scopes.
 * Only public.get_published_projects() is reachable with this key.
 */
export function createPublicClient(): SupabaseClient | null {
  const env = supabasePublicEnv();
  if (!env) return null;
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
