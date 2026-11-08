import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabasePublicEnv } from "./env";

/**
 * Cookie-bound client acting AS the signed-in user. Database and Storage RLS
 * (public.is_owner()) apply to every query made with it. Request-time only:
 * never call inside a `use cache` scope.
 */
export async function createUserClient() {
  const env = supabasePublicEnv();
  if (!env) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component render: the proxy refreshes sessions.
        }
      },
    },
  });
}
