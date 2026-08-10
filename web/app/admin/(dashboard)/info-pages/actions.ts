"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

function parseInfoPageForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    icon: String(formData.get("icon") ?? "").trim() || "📄",
    body: String(formData.get("body") ?? ""),
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    published: formData.get("published") === "on",
  };
}

export async function createInfoPage(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("info_pages").insert(parseInfoPageForm(formData));
  revalidatePath("/admin/info-pages");
  redirect("/admin/info-pages");
}

export async function updateInfoPage(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("info_pages").update(parseInfoPageForm(formData)).eq("id", id);
  revalidatePath("/admin/info-pages");
  redirect("/admin/info-pages");
}

export async function deleteInfoPage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("info_pages").delete().eq("id", id);
  revalidatePath("/admin/info-pages");
}
