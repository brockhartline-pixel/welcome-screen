"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { parseDollarsToCents } from "@/lib/money";

function parseProductForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price_cents: parseDollarsToCents(String(formData.get("price") ?? "0")),
    category_id: String(formData.get("category_id") ?? "") || null,
    emoji: String(formData.get("emoji") ?? "").trim() || "🛍️",
    image_url: String(formData.get("image_url") ?? "").trim() || null,
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    in_stock: formData.get("in_stock") === "on",
    active: formData.get("active") === "on",
  };
}

function revalidateShop() {
  revalidatePath("/admin/shop");
  revalidatePath("/shop", "layout");
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("shop_products").insert(parseProductForm(formData));
  revalidateShop();
  redirect("/admin/shop");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("shop_products").update(parseProductForm(formData)).eq("id", id);
  revalidateShop();
  redirect("/admin/shop");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("shop_products").delete().eq("id", String(formData.get("id")));
  revalidateShop();
}

export async function toggleInStock(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("shop_products")
    .update({ in_stock: formData.get("in_stock") === "true" })
    .eq("id", String(formData.get("id")));
  revalidateShop();
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("shop_categories").insert({
    name: String(formData.get("name") ?? "").trim(),
    icon: String(formData.get("icon") ?? "").trim() || "🛍️",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  });
  revalidateShop();
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("shop_categories").delete().eq("id", String(formData.get("id")));
  revalidateShop();
}

export async function updateShopSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("hotel")
    .update({
      shop_enabled: formData.get("shop_enabled") === "on",
      shop_delivery_fee_cents: parseDollarsToCents(String(formData.get("delivery_fee") ?? "0")),
      shop_note: String(formData.get("shop_note") ?? "").trim() || null,
    })
    .eq("id", String(formData.get("id")));
  revalidateShop();
}
