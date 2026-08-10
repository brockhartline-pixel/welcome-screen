import { createClient } from "@/lib/supabase/server";
import type { Hotel } from "@/lib/types";

/**
 * Fetches the single `hotel` config row. Publicly readable per RLS (see
 * supabase/migrations/0001_init.sql), so this works both on the
 * unauthenticated TV screen and in the admin dashboard.
 */
export async function getHotel(): Promise<Hotel | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("hotel").select("*").limit(1).maybeSingle();
  return (data as Hotel | null) ?? null;
}
