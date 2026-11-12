import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "../actions";
import type { ShopCategory, ShopProduct } from "@/lib/types";

export default async function EditProductPage({ params }: PageProps<"/admin/shop/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: cats }] = await Promise.all([
    supabase.from("shop_products").select("*").eq("id", id).maybeSingle(),
    supabase.from("shop_categories").select("*").order("sort_order"),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit product</h1>
      <ProductForm
        product={product as ShopProduct}
        categories={(cats as ShopCategory[] | null) ?? []}
        action={updateProduct.bind(null, id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
