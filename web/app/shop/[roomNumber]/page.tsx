import type { Metadata, Viewport } from "next";
import { getHotel } from "@/lib/hotel";
import { getShopCatalog } from "@/lib/shop";
import { ShopApp } from "@/components/shop/ShopApp";
import { ShopClosed } from "@/components/shop/ShopClosed";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const hotel = await getHotel();
  return { title: hotel ? `${hotel.name} · In-Room Shop` : "In-Room Shop" };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function ShopPage({ params }: PageProps<"/shop/[roomNumber]">) {
  const { roomNumber } = await params;
  const hotel = await getHotel();

  if (!hotel || !hotel.shop_enabled) {
    return <ShopClosed hotelName={hotel?.name ?? null} />;
  }

  const { categories, products } = await getShopCatalog();

  return (
    <ShopApp
      hotel={{
        name: hotel.name,
        logoUrl: hotel.logo_url,
        primaryColor: hotel.primary_color,
        accentColor: hotel.accent_color,
        deliveryFeeCents: hotel.shop_delivery_fee_cents ?? 0,
        note: hotel.shop_note,
      }}
      roomNumber={decodeURIComponent(roomNumber)}
      categories={categories}
      products={products}
    />
  );
}
