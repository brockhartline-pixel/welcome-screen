import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * The real authorization boundary for the admin dashboard. proxy.ts does an
 * optimistic redirect for UX, but every Server Component/Action that reads
 * or writes admin data must call this (or getCurrentUser) itself - per
 * Next.js's Data Access Layer recommendation, since proxy alone is not a
 * substitute for checking auth close to the data.
 *
 * Wrapped in React's `cache()` so multiple calls within one request only
 * hit Supabase once.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
