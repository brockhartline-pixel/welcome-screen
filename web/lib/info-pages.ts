import { createClient } from "@/lib/supabase/server";
import type { InfoPage } from "@/lib/types";

/** Published info pages, in display order. Publicly readable per RLS. */
export async function getPublishedInfoPages(): Promise<InfoPage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("info_pages")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data as InfoPage[] | null) ?? [];
}

/** All info pages regardless of published state - admin dashboard only. */
export async function getAllInfoPages(): Promise<InfoPage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("info_pages")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as InfoPage[] | null) ?? [];
}
