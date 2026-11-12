"use server";

import { getHotel } from "@/lib/hotel";
import { placeOrder, type PlaceOrderInput, type PlaceOrderResult } from "@/lib/shop";

export async function placeOrderAction(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const hotel = await getHotel();
  if (!hotel) return { ok: false, error: "Ordering isn't set up yet." };
  return placeOrder(hotel, {
    roomNumber: String(input.roomNumber ?? ""),
    guestFirstName: String(input.guestFirstName ?? ""),
    guestLastName: String(input.guestLastName ?? ""),
    guestPhone: String(input.guestPhone ?? ""),
    notes: String(input.notes ?? ""),
    items: Array.isArray(input.items) ? input.items : [],
  });
}
