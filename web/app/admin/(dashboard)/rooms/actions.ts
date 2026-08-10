"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export async function createRoom(formData: FormData) {
  await requireAdmin();
  const room_number = String(formData.get("room_number") ?? "").trim();
  const mews_resource_id = String(formData.get("mews_resource_id") ?? "").trim() || null;
  if (!room_number) return;

  const supabase = await createClient();
  await supabase.from("rooms").insert({ room_number, mews_resource_id });
  revalidatePath("/admin/rooms");
}

export async function updateRoom(id: string, formData: FormData) {
  await requireAdmin();
  const room_number = String(formData.get("room_number") ?? "").trim();
  const mews_resource_id = String(formData.get("mews_resource_id") ?? "").trim() || null;

  const supabase = await createClient();
  await supabase.from("rooms").update({ room_number, mews_resource_id }).eq("id", id);
  revalidatePath("/admin/rooms");
}

export async function deleteRoom(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("rooms").delete().eq("id", id);
  revalidatePath("/admin/rooms");
}
