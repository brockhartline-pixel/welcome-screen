import Link from "next/link";
import { notFound } from "next/navigation";
import { getHotel } from "@/lib/hotel";
import { getGuestOrder } from "@/lib/shop";
import { formatCents, ORDER_STATUS_LABELS } from "@/lib/money";
import { readableTextOn } from "@/lib/color";
import { AutoRefresh } from "@/components/shop/AutoRefresh";
import type { ShopOrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STEPS: ShopOrderStatus[] = ["received", "preparing", "on_the_way", "delivered"];

export default async function OrderStatusPage({
  params,
}: PageProps<"/shop/[roomNumber]/order/[orderId]">) {
  const { roomNumber: rawRoom, orderId } = await params;
  const roomNumber = decodeURIComponent(rawRoom);
  const [hotel, order] = await Promise.all([getHotel(), getGuestOrder(orderId, roomNumber)]);
  if (!order) notFound();

  const accent = hotel?.accent_color ?? "#0f172a";
  const accentText = readableTextOn(accent);
  const currentStep = STEPS.indexOf(order.status);
  const finished = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      {!finished ? <AutoRefresh seconds={15} /> : null}
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div className="text-center">
          <span className="text-5xl" aria-hidden>
            {order.status === "cancelled" ? "⚠️" : order.status === "delivered" ? "✅" : "🛍️"}
          </span>
          <h1 className="mt-3 text-2xl font-bold">{ORDER_STATUS_LABELS[order.status]}</h1>
          <p className="mt-1 text-slate-600">
            Order #{order.order_number} · Room {order.room_number}
          </p>
          {order.status === "cancelled" ? (
            <p className="mt-2 text-sm text-slate-600">
              This order was cancelled. Please call the front desk with any questions.
            </p>
          ) : hotel?.shop_note && !finished ? (
            <p className="mt-2 text-sm text-slate-600">{hotel.shop_note}</p>
          ) : null}
        </div>

        {order.status !== "cancelled" ? (
          <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
            {STEPS.map((step, i) => (
              <li key={step} className="flex flex-col items-center gap-2 text-center">
                <span
                  className="h-1.5 w-full rounded-full"
                  style={{ backgroundColor: i <= currentStep ? accent : "#e2e8f0" }}
                />
                <span
                  className={`text-xs ${i <= currentStep ? "font-semibold text-slate-900" : "text-slate-500"}`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </li>
            ))}
          </ol>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <ul className="divide-y divide-slate-100 text-sm">
            {(order.shop_order_items ?? []).map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.quantity} × {item.product_name}
                </span>
                <span>{formatCents(item.unit_price_cents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd>{formatCents(order.subtotal_cents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivery</dt>
              <dd>
                {order.delivery_fee_cents > 0 ? formatCents(order.delivery_fee_cents) : "Free"}
              </dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>Charged to room</dt>
              <dd>{formatCents(order.total_cents)}</dd>
            </div>
          </dl>
        </div>

        <Link
          href={`/shop/${encodeURIComponent(roomNumber)}`}
          className="rounded-2xl px-5 py-4 text-center font-semibold"
          style={{ backgroundColor: accent, color: accentText }}
        >
          Order something else
        </Link>
      </div>
    </div>
  );
}
