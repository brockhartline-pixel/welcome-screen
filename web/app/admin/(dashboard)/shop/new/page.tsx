import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "../actions";
import type { ShopCategory } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("shop_categories").select("*").order("sort_order");
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New product</h1>
      <ProductForm categories={(data as ShopCategory[] | null) ?? []} action={createProduct} submitLabel="Add product" />
    </div>
  );
}
