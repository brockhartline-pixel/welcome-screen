"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import type { ShopOrderStatus } from "@/lib/types";

const STATUSES: ShopOrderStatus[] = ["received", "preparing", "on_the_way", "delivered", "cancelled"];

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ShopOrderStatus;
  if (!STATUSES.includes(status)) return;
  const supabase = await createClient();
  await supabase.from("shop_orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
}
