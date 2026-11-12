import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getHotel } from "@/lib/hotel";
import { formatCents } from "@/lib/money";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import {
  createCategory,
  deleteCategory,
  deleteProduct,
  toggleInStock,
  updateShopSettings,
} from "./actions";
import type { ShopCategory, ShopProduct } from "@/lib/types";

const INPUT = "rounded-md border border-slate-300 px-3 py-2 font-normal";

export default async function ShopAdminPage() {
  const supabase = await createClient();
  const [hotel, { data: cats }, { data: prods }] = await Promise.all([
    getHotel(),
    supabase.from("shop_categories").select("*").order("sort_order"),
    supabase.from("shop_products").select("*").order("sort_order").order("name"),
  ]);
  const categories = (cats as ShopCategory[] | null) ?? [];
  const products = (prods as ShopProduct[] | null) ?? [];
  const catName = new Map(categories.map((c) => [c.id, `${c.icon} ${c.name}`]));

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">In-room shop</h1>
        <p className="text-sm text-slate-600">
          Guests open the shop by scanning the QR code on their TV&apos;s <em>Order to Room</em>{" "}
          tile, or at <span className="font-mono">/shop/&lt;room-number&gt;</span>. Orders land in{" "}
          <Link href="/admin/orders" className="underline">
            Orders
          </Link>
          .
        </p>
      </div>

      {hotel ? (
        <section>
          <h2 className="mb-3 font-semibold text-slate-900">Settings</h2>
          <form action={updateShopSettings} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-3">
            <input type="hidden" name="id" value={hotel.id} />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-3">
              <input type="checkbox" name="shop_enabled" defaultChecked={hotel.shop_enabled} />
              Shop open (uncheck to pause ordering)
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Delivery fee ($)
              <input
                name="delivery_fee"
                inputMode="decimal"
                defaultValue={((hotel.shop_delivery_fee_cents ?? 0) / 100).toFixed(2)}
                className={INPUT}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 sm:col-span-2">
              Note shown to guests
              <input name="shop_note" defaultValue={hotel.shop_note ?? ""} className={INPUT} />
            </label>
            <button
              type="submit"
              className="justify-self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save settings
            </button>
          </form>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Products ({products.length})</h2>
          <Link
            href="/admin/shop/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New product
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                  <td className="px-4 py-3 text-xl">{p.emoji}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{p.name}</span>
                    {!p.active ? <span className="ml-2 text-xs text-slate-500">(hidden)</span> : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.category_id ? catName.get(p.category_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3">{formatCents(p.price_cents)}</td>
                  <td className="px-4 py-3">
                    <form action={toggleInStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="in_stock" value={String(!p.in_stock)} />
                      <button
                        type="submit"
                        title="Click to toggle"
                        className={`rounded-full px-2 py-1 text-xs font-medium ${p.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {p.in_stock ? "In stock" : "Sold out"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/shop/${p.id}`} className="text-slate-600 hover:text-slate-900">
                        Edit
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmitButton
                          confirmMessage={`Delete "${p.name}"? Past orders keep their record.`}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No products yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-slate-900">Categories</h2>
        <form action={createCategory} className="mb-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Icon
            <input name="icon" defaultValue="🛍️" className={`w-20 ${INPUT}`} />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
            Name
            <input name="name" required className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Sort order
            <input type="number" name="sort_order" defaultValue={0} className={`w-24 ${INPUT}`} />
          </label>
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Add category
          </button>
        </form>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white text-sm">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span>
                <span className="mr-2 text-slate-400">{c.sort_order}</span>
                {c.icon} <span className="font-medium text-slate-900">{c.name}</span>
              </span>
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmSubmitButton
                  confirmMessage={`Delete category "${c.name}"? Its products move to "More".`}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
