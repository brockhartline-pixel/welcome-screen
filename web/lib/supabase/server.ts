import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase client for use inside Server Components and Server Actions.
 *
 * It reads/writes auth cookies via Next's `cookies()` API, so queries run
 * as whoever is logged in (or as `anon` if nobody is). Row Level Security
 * policies in supabase/migrations/0001_init.sql do the actual access
 * control - this client just carries the caller's identity.
 *
 * Create a new one per request; never cache/reuse across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component that can't set cookies (e.g. a
            // page render, not a Server Action). Session refresh for these
            // requests is handled by proxy.ts instead - safe to ignore.
          }
        },
      },
    },
  );
}
