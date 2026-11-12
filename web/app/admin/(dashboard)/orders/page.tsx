import { createClient } from "@/lib/supabase/server";
import { getHotel } from "@/lib/hotel";
import { formatCents, ORDER_STATUS_LABELS } from "@/lib/money";
import { AutoRefresh } from "@/components/shop/AutoRefresh";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { updateOrderStatus } from "./actions";
import type { ShopOrder, ShopOrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEXT_STEP: Partial<Record<ShopOrderStatus, { status: ShopOrderStatus; label: string }>> = {
  received: { status: "preparing", label: "Start packing" },
  preparing: { status: "on_the_way", label: "Out for delivery" },
  on_the_way: { status: "delivered", label: "Mark delivered" },
};

const STATUS_BADGE: Record<ShopOrderStatus, string> = {
  received: "bg-amber-100 text-amber-800",
  preparing: "bg-blue-100 text-blue-800",
  on_the_way: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-slate-100 text-slate-600",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const [{ data }, hotel] = await Promise.all([
    supabase
      .from("shop_orders")
      .select("*, shop_order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100),
    getHotel(),
  ]);
  const orders = (data as ShopOrder[] | null) ?? [];
  const open = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const closed = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
  const tz = hotel?.timezone ?? "America/New_York";
  const time = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  });

  return (
    <div className="flex flex-col gap-8">
      <AutoRefresh seconds={20} />
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-600">
          Guest orders from the in-room shop. This page refreshes itself every 20 seconds.
          Post each delivered order&apos;s total to the guest&apos;s folio in Mews.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-slate-900">Open ({open.length})</h2>
        <div className="flex flex-col gap-3">
          {open.map((o) => (
            <OrderCard key={o.id} order={o} time={time.format(new Date(o.created_at))} />
          ))}
          {open.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500">
              No open orders.
            </p>
          ) : null}
        </div>
      </section>

      {closed.length > 0 ? (
        <section>
          <h2 className="mb-3 font-semibold text-slate-900">Recent</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Placed</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closed.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 text-slate-600">{o.order_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{o.room_number}</td>
                    <td className="px-4 py-3">{o.guest_name}</td>
                    <td className="px-4 py-3 text-slate-600">{time.format(new Date(o.created_at))}</td>
                    <td className="px-4 py-3">{formatCents(o.total_cents)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function OrderCard({ order, time }: { order: ShopOrder; time: string }) {
  const next = NEXT_STEP[order.status];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">Room {order.room_number}</span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            {!order.guest_verified ? (
              <span
                className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                title="Mews couldn't confirm this guest's last name - verify before charging the room."
              >
                Unverified guest
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600">
            #{order.order_number} · {order.guest_name}
            {order.guest_phone ? ` · ${order.guest_phone}` : ""} · {time}
          </p>
        </div>
        <span className="text-lg font-semibold text-slate-900">{formatCents(order.total_cents)}</span>
      </div>
      <ul className="mt-3 text-sm text-slate-800">
        {(order.shop_order_items ?? []).map((i) => (
          <li key={i.id}>
            <strong>{i.quantity}×</strong> {i.product_name}
          </li>
        ))}
      </ul>
      {order.notes ? (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Note: {order.notes}
        </p>
      ) : null}
      <form action={updateOrderStatus} className="mt-4 flex gap-3">
        <input type="hidden" name="id" value={order.id} />
        {next ? (
          <button
            type="submit"
            name="status"
            value={next.status}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {next.label}
          </button>
        ) : null}
        <CancelButton />
      </form>
    </div>
  );
}

function CancelButton() {
  return (
    <ConfirmSubmitButton
      formAction={cancelOrder}
      confirmMessage="Cancel this order? The guest will see it as cancelled."
      className="rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Cancel order
    </ConfirmSubmitButton>
  );
}

async function cancelOrder(formData: FormData) {
  "use server";
  formData.set("status", "cancelled");
  await updateOrderStatus(formData);
}
