import type { ShopCategory, ShopProduct } from "@/lib/types";

const INPUT = "rounded-md border border-slate-300 px-3 py-2 font-normal";
const LABEL = "flex flex-col gap-1 text-sm font-medium text-slate-700";

export function ProductForm({
  product,
  categories,
  action,
  submitLabel,
}: {
  product?: ShopProduct;
  categories: ShopCategory[];
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6">
      <label className={LABEL}>
        Name
        <input name="name" defaultValue={product?.name} required className={INPUT} />
      </label>
      <label className={LABEL}>
        Description (size, flavor…)
        <input name="description" defaultValue={product?.description} className={INPUT} />
      </label>
      <div className="grid grid-cols-3 gap-5">
        <label className={LABEL}>
          Price ($)
          <input
            name="price"
            inputMode="decimal"
            required
            defaultValue={product ? (product.price_cents / 100).toFixed(2) : ""}
            className={INPUT}
          />
        </label>
        <label className={LABEL}>
          Category
          <select name="category_id" defaultValue={product?.category_id ?? ""} className={INPUT}>
            <option value="">(none)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={LABEL}>
          Sort order
          <input type="number" name="sort_order" defaultValue={product?.sort_order ?? 0} className={INPUT} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <label className={LABEL}>
          Emoji (shown if no photo)
          <input name="emoji" defaultValue={product?.emoji ?? "🛍️"} className={INPUT} />
        </label>
        <label className={`${LABEL} col-span-2`}>
          Photo URL (optional, square works best)
          <input name="image_url" defaultValue={product?.image_url ?? ""} placeholder="https://…" className={INPUT} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" name="in_stock" defaultChecked={product?.in_stock ?? true} />
        In stock
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
        Listed in the shop (uncheck to hide without deleting)
      </label>
      <button
        type="submit"
        className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
