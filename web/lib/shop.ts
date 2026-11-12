import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoomByNumber } from "@/lib/rooms";
import { verifyGuestLastName } from "@/lib/mews";
import type { Hotel, ShopCategory, ShopOrder, ShopProduct } from "@/lib/types";

export const MAX_QTY_PER_ITEM = 20;
export const MAX_LINE_ITEMS = 40;

/** Categories + active products for the guest shop. Publicly readable per RLS. */
export async function getShopCatalog(): Promise<{
  categories: ShopCategory[];
  products: ShopProduct[];
}> {
  const supabase = await createClient();
  const [cats, prods] = await Promise.all([
    supabase.from("shop_categories").select("*").order("sort_order"),
    supabase
      .from("shop_products")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .order("name"),
  ]);
  return {
    categories: (cats.data as ShopCategory[] | null) ?? [],
    products: (prods.data as ShopProduct[] | null) ?? [],
  };
}

export interface PlaceOrderInput {
  roomNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  notes: string;
  items: { productId: string; quantity: number }[];
}

export type PlaceOrderResult = { ok: true; orderId: string } | { ok: false; error: string };

/**
 * Places a guest order. Runs with the service-role client because orders
 * have no public RLS policy. Never trusts client-side prices: every line is
 * re-priced from shop_products, and out-of-stock/inactive items are refused.
 */
export async function placeOrder(hotel: Hotel, input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!hotel.shop_enabled) {
    return { ok: false, error: "The in-room shop is closed right now." };
  }

  const firstName = input.guestFirstName.trim().slice(0, 60);
  const lastName = input.guestLastName.trim().slice(0, 60);
  if (!firstName || !lastName) {
    return { ok: false, error: "Please enter your first and last name." };
  }

  // Merge duplicate lines and clamp quantities.
  const qtyById = new Map<string, number>();
  for (const item of input.items.slice(0, MAX_LINE_ITEMS)) {
    const q = Math.floor(Number(item.quantity));
    if (!item.productId || !Number.isFinite(q) || q <= 0) continue;
    qtyById.set(item.productId, Math.min(MAX_QTY_PER_ITEM, (qtyById.get(item.productId) ?? 0) + q));
  }
  if (qtyById.size === 0) return { ok: false, error: "Your cart is empty." };

  const room = await getRoomByNumber(input.roomNumber);
  if (!room) {
    return {
      ok: false,
      error: "We couldn't find this room. Please call the front desk to place your order.",
    };
  }

  const verification = await verifyGuestLastName(room.mews_resource_id, lastName);
  if (verification === "mismatch") {
    return {
      ok: false,
      error:
        "That last name doesn't match the guest checked into this room. Please use the name on your reservation, or call the front desk.",
    };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return { ok: false, error: "Ordering isn't set up yet. Please call the front desk." };
  }

  const { data: productRows } = await supabase
    .from("shop_products")
    .select("id, name, price_cents, in_stock, active")
    .in("id", [...qtyById.keys()]);
  const products = (productRows ?? []) as Pick<
    ShopProduct,
    "id" | "name" | "price_cents" | "in_stock" | "active"
  >[];

  const unavailable = [...qtyById.keys()].filter((id) => {
    const p = products.find((row) => row.id === id);
    return !p || !p.active || !p.in_stock;
  });
  if (unavailable.length > 0) {
    const names = products
      .filter((p) => unavailable.includes(p.id))
      .map((p) => p.name)
      .join(", ");
    return {
      ok: false,
      error: `Sorry, ${names || "some items"} just sold out. Please remove ${unavailable.length > 1 ? "them" : "it"} and try again.`,
    };
  }

  const lines = products.map((p) => ({
    product_id: p.id,
    product_name: p.name,
    unit_price_cents: p.price_cents,
    quantity: qtyById.get(p.id)!,
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const deliveryFee = hotel.shop_delivery_fee_cents ?? 0;

  const { data: order, error } = await supabase
    .from("shop_orders")
    .insert({
      room_number: room.room_number,
      guest_name: `${firstName} ${lastName}`,
      guest_phone: input.guestPhone.trim().slice(0, 30) || null,
      notes: input.notes.trim().slice(0, 500) || null,
      guest_verified: verification === "match",
      payment_method: "room_charge",
      subtotal_cents: subtotal,
      delivery_fee_cents: deliveryFee,
      total_cents: subtotal + deliveryFee,
    })
    .select("id")
    .single();
  if (error || !order) {
    return { ok: false, error: "Something went wrong placing your order. Please try again." };
  }

  const { error: itemsError } = await supabase
    .from("shop_order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (itemsError) {
    await supabase.from("shop_orders").delete().eq("id", order.id);
    return { ok: false, error: "Something went wrong placing your order. Please try again." };
  }

  return { ok: true, orderId: order.id };
}

/**
 * A single order for the guest's confirmation/tracking page. The order id is
 * an unguessable UUID, and it must also belong to the room in the URL.
 */
export async function getGuestOrder(orderId: string, roomNumber: string): Promise<ShopOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("shop_orders")
      .select("*, shop_order_items(*)")
      .eq("id", orderId)
      .eq("room_number", roomNumber)
      .maybeSingle();
    return (data as ShopOrder | null) ?? null;
  } catch {
    return null;
  }
}
