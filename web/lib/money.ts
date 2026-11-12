const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats integer cents as dollars, e.g. 350 -> "$3.50". Safe on client and server. */
export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}

/** Parses a dollars string from an admin form ("3.5", "$3.50") into integer cents. */
export function parseDollarsToCents(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}

export const ORDER_STATUS_LABELS = {
  received: "Order received",
  preparing: "Being packed",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
} as const;
