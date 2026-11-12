"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCents } from "@/lib/money";
import { readableTextOn } from "@/lib/color";
import { placeOrderAction } from "@/app/shop/[roomNumber]/actions";
import type { ShopCategory, ShopProduct } from "@/lib/types";

export interface ShopHotel {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  deliveryFeeCents: number;
  note: string | null;
}

type Cart = Record<string, number>; // productId -> quantity

const MAX_QTY = 20;

function cartStorageKey(roomNumber: string) {
  return `shop-cart:${roomNumber}`;
}

export function ShopApp({
  hotel,
  roomNumber,
  categories,
  products,
}: {
  hotel: ShopHotel;
  roomNumber: string;
  categories: ShopCategory[];
  products: ShopProduct[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({});
  const [cartLoaded, setCartLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [cartOpen, setCartOpen] = useState(false);

  const accentText = readableTextOn(hotel.accentColor);
  const headerText = readableTextOn(hotel.primaryColor);

  // Restore the cart (a per-browser convenience; the server re-validates everything).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(cartStorageKey(roomNumber));
      if (raw) {
        const saved = JSON.parse(raw) as Cart;
        const valid: Cart = {};
        for (const [id, q] of Object.entries(saved)) {
          const p = products.find((x) => x.id === id);
          if (p && p.in_stock && q > 0) valid[id] = Math.min(MAX_QTY, q);
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from storage
        setCart(valid);
      }
    } catch {
      // Storage blocked (private mode etc.) - start with an empty cart.
    }
    setCartLoaded(true);
  }, [roomNumber, products]);

  useEffect(() => {
    if (!cartLoaded) return;
    try {
      window.localStorage.setItem(cartStorageKey(roomNumber), JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart, cartLoaded, roomNumber]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => ({ product: productById.get(id), qty }))
    .filter((l): l is { product: ShopProduct; qty: number } => !!l.product && l.qty > 0);
  const itemCount = cartLines.reduce((n, l) => n + l.qty, 0);
  const subtotal = cartLines.reduce((n, l) => n + l.qty * l.product.price_cents, 0);
  const total = subtotal + hotel.deliveryFeeCents;

  function setQty(productId: string, qty: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[productId];
      else next[productId] = Math.min(MAX_QTY, qty);
      return next;
    });
  }

  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = products.filter((p) => {
    if (normalizedQuery) {
      return (
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery)
      );
    }
    return activeCategory === "all" || p.category_id === activeCategory;
  });

  // Group into aisles when browsing "All" without a search.
  const sections =
    activeCategory === "all" && !normalizedQuery
      ? [
          ...categories.map((c) => ({
            key: c.id,
            title: `${c.icon} ${c.name}`,
            items: visibleProducts.filter((p) => p.category_id === c.id),
          })),
          {
            key: "other",
            title: "More",
            items: visibleProducts.filter(
              (p) => !p.category_id || !categories.some((c) => c.id === p.category_id),
            ),
          },
        ].filter((s) => s.items.length > 0)
      : [{ key: "results", title: "", items: visibleProducts }];

  return (
    <div
      className="min-h-screen bg-slate-50 pb-32 text-slate-900"
      style={{ ["--shop-accent" as string]: hotel.accentColor }}
    >
      <header
        className="px-4 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))]"
        style={{ backgroundColor: hotel.primaryColor, color: headerText }}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {hotel.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.logoUrl} alt="" className="h-9 w-auto" />
          ) : null}
          <span className="text-lg font-semibold">{hotel.name}</span>
        </div>
        <div className="mx-auto mt-4 max-w-3xl">
          <h1 className="text-2xl font-bold">In-Room Shop</h1>
          <p className="mt-1 text-sm opacity-80">
            Delivering to <strong>Room {roomNumber}</strong>
            {hotel.note ? ` · ${hotel.note}` : ""}
          </p>
          <label className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-slate-900 shadow-sm">
            <span aria-hidden className="text-slate-400">
              🔍
            </span>
            <span className="sr-only">Search the shop</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search snacks, drinks, essentials…"
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </header>

      {!normalizedQuery ? (
        <nav
          aria-label="Categories"
          className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
            <CategoryChip
              label="All"
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              accent={hotel.accentColor}
              accentText={accentText}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.id}
                label={`${c.icon} ${c.name}`}
                active={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                accent={hotel.accentColor}
                accentText={accentText}
              />
            ))}
          </div>
        </nav>
      ) : null}

      <main className="mx-auto max-w-3xl px-4 pt-5">
        {sections.length === 0 || visibleProducts.length === 0 ? (
          <p className="py-16 text-center text-slate-500">
            {normalizedQuery ? `No items match "${query}".` : "Nothing here yet."}
          </p>
        ) : (
          sections.map((section) => (
            <section key={section.key} className="mb-8">
              {section.title ? (
                <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              ) : null}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {section.items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qty={cart[p.id] ?? 0}
                    onQty={(q) => setQty(p.id, q)}
                    accent={hotel.accentColor}
                    accentText={accentText}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {itemCount > 0 && !cartOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl px-5 py-4 text-base font-semibold shadow-lg"
            style={{ backgroundColor: hotel.accentColor, color: accentText }}
          >
            <span className="rounded-full bg-black/15 px-2.5 py-0.5 text-sm">{itemCount}</span>
            <span>View cart</span>
            <span>{formatCents(subtotal)}</span>
          </button>
        </div>
      ) : null}

      {cartOpen ? (
        <CartSheet
          roomNumber={roomNumber}
          lines={cartLines}
          subtotal={subtotal}
          deliveryFee={hotel.deliveryFeeCents}
          total={total}
          accent={hotel.accentColor}
          accentText={accentText}
          onQty={setQty}
          onClose={() => setCartOpen(false)}
          onPlaced={(orderId) => {
            setCart({});
            try {
              window.localStorage.removeItem(cartStorageKey(roomNumber));
            } catch {
              // ignore
            }
            router.push(`/shop/${encodeURIComponent(roomNumber)}/order/${orderId}`);
          }}
        />
      ) : null}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
  accent,
  accentText,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
  accentText: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition"
      style={
        active
          ? { backgroundColor: accent, borderColor: accent, color: accentText }
          : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#334155" }
      }
    >
      {label}
    </button>
  );
}

function ProductCard({
  product,
  qty,
  onQty,
  accent,
  accentText,
}: {
  product: ShopProduct;
  qty: number;
  onQty: (qty: number) => void;
  accent: string;
  accentText: string;
}) {
  const soldOut = !product.in_stock;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative flex aspect-square items-center justify-center bg-slate-100">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-6xl" aria-hidden>
            {product.emoji || "🛍️"}
          </span>
        )}
        {soldOut ? (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-medium text-white">
            Sold out
          </span>
        ) : null}
        {!soldOut ? (
          <div className="absolute bottom-2 right-2">
            {qty === 0 ? (
              <button
                type="button"
                onClick={() => onQty(1)}
                aria-label={`Add ${product.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-2xl font-semibold leading-none shadow-md"
                style={{ backgroundColor: accent, color: accentText }}
              >
                +
              </button>
            ) : (
              <Stepper
                qty={qty}
                onQty={onQty}
                name={product.name}
                accent={accent}
                accentText={accentText}
              />
            )}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-3">
        <span className="font-semibold">{formatCents(product.price_cents)}</span>
        <span className="text-sm font-medium leading-snug">{product.name}</span>
        {product.description ? (
          <span className="text-xs text-slate-500">{product.description}</span>
        ) : null}
      </div>
    </div>
  );
}

function Stepper({
  qty,
  onQty,
  name,
  accent,
  accentText,
}: {
  qty: number;
  onQty: (qty: number) => void;
  name: string;
  accent: string;
  accentText: string;
}) {
  return (
    <div
      className="flex h-10 items-center rounded-full shadow-md"
      style={{ backgroundColor: accent, color: accentText }}
    >
      <button
        type="button"
        onClick={() => onQty(qty - 1)}
        aria-label={`Remove one ${name}`}
        className="h-10 w-10 text-xl font-semibold"
      >
        −
      </button>
      <span className="min-w-6 text-center font-semibold" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onQty(qty + 1)}
        disabled={qty >= MAX_QTY}
        aria-label={`Add one ${name}`}
        className="h-10 w-10 text-xl font-semibold disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

function CartSheet({
  roomNumber,
  lines,
  subtotal,
  deliveryFee,
  total,
  accent,
  accentText,
  onQty,
  onClose,
  onPlaced,
}: {
  roomNumber: string;
  lines: { product: ShopProduct; qty: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  accent: string;
  accentText: string;
  onQty: (productId: string, qty: number) => void;
  onClose: () => void;
  onPlaced: (orderId: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await placeOrderAction({
        roomNumber,
        guestFirstName: String(formData.get("first_name") ?? ""),
        guestLastName: String(formData.get("last_name") ?? ""),
        guestPhone: String(formData.get("phone") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.qty })),
      });
      if (result.ok) onPlaced(result.orderId);
      else setError(result.error);
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <button type="button" aria-label="Close cart" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold">Your order</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Keep shopping
          </button>
        </div>

        <form action={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {lines.length === 0 ? (
              <p className="py-8 text-center text-slate-500">Your cart is empty.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {lines.map(({ product, qty }) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl">
                      {product.emoji || "🛍️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatCents(product.price_cents * qty)}
                      </p>
                    </div>
                    <Stepper
                      qty={qty}
                      onQty={(q) => onQty(product.id, q)}
                      name={product.name}
                      accent={accent}
                      accentText={accentText}
                    />
                  </li>
                ))}
              </ul>
            )}

            <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd>{formatCents(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Delivery</dt>
                <dd>{deliveryFee > 0 ? formatCents(deliveryFee) : "Free"}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatCents(total)}</dd>
              </div>
            </dl>

            <fieldset className="mt-5 grid grid-cols-2 gap-3">
              <legend className="mb-2 text-sm font-semibold">Guest details</legend>
              <Input name="first_name" label="First name" autoComplete="given-name" required />
              <Input name="last_name" label="Last name" autoComplete="family-name" required />
              <div className="col-span-2">
                <Input name="phone" label="Mobile (optional)" type="tel" autoComplete="tel" />
              </div>
              <label className="col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
                Notes for delivery (optional)
                <textarea
                  name="notes"
                  rows={2}
                  maxLength={500}
                  placeholder="e.g. Leave at the door"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-base font-normal"
                />
              </label>
            </fieldset>
            <p className="mt-3 text-xs text-slate-500">
              Use the last name on your reservation. Your total is charged to Room {roomNumber}{" "}
              and will appear on your folio at checkout.
            </p>
            {error ? (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <div className="border-t border-slate-100 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <button
              type="submit"
              disabled={pending || lines.length === 0}
              className="w-full rounded-2xl px-5 py-4 text-base font-semibold disabled:opacity-50"
              style={{ backgroundColor: accent, color: accentText }}
            >
              {pending
                ? "Placing order…"
                : `Charge ${formatCents(total)} to Room ${roomNumber}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        {...props}
        className="rounded-xl border border-slate-300 px-3 py-2 text-base font-normal"
      />
    </label>
  );
}
