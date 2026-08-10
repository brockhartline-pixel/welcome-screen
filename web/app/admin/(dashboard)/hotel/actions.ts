"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";

export async function updateHotel(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const latitudeRaw = String(formData.get("latitude") ?? "").trim();
  const longitudeRaw = String(formData.get("longitude") ?? "").trim();

  const fields = {
    name: String(formData.get("name") ?? "").trim(),
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    background_image_url: String(formData.get("background_image_url") ?? "").trim() || null,
    primary_color: String(formData.get("primary_color") ?? "#0f172a"),
    accent_color: String(formData.get("accent_color") ?? "#38bdf8"),
    address: String(formData.get("address") ?? "").trim() || null,
    latitude: latitudeRaw ? Number(latitudeRaw) : null,
    longitude: longitudeRaw ? Number(longitudeRaw) : null,
    timezone: String(formData.get("timezone") ?? "America/New_York").trim(),
    wifi_ssid: String(formData.get("wifi_ssid") ?? "").trim() || null,
    wifi_password: String(formData.get("wifi_password") ?? "").trim() || null,
    checkout_time: String(formData.get("checkout_time") ?? "").trim() || null,
    hulu_package_name: String(formData.get("hulu_package_name") ?? "com.hulu.plus").trim(),
  };

  const supabase = await createClient();
  await supabase.from("hotel").update(fields).eq("id", id);
  revalidatePath("/admin/hotel");
}
