export interface Hotel {
  id: string;
  name: string;
  logo_url: string | null;
  background_image_url: string | null;
  primary_color: string;
  accent_color: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  wifi_ssid: string | null;
  wifi_password: string | null;
  checkout_time: string | null;
  hulu_package_name: string;
  shop_enabled: boolean;
  shop_delivery_fee_cents: number;
  shop_note: string | null;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  mews_resource_id: string | null;
  created_at: string;
}

export interface InfoPage {
  id: string;
  title: string;
  icon: string;
  body: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuestGreeting {
  guestFirstName: string | null;
  checkoutUtc: string | null;
}

export interface WeatherSnapshot {
  temperatureF: number;
  description: string;
  emoji: string;
}

export interface TvData {
  greeting: GuestGreeting;
  weather: WeatherSnapshot | null;
}

export interface ShopCategory {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

export interface ShopProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price_cents: number;
  image_url: string | null;
  emoji: string;
  in_stock: boolean;
  active: boolean;
  sort_order: number;
}

export type ShopOrderStatus = "received" | "preparing" | "on_the_way" | "delivered" | "cancelled";

export interface ShopOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
}

export interface ShopOrder {
  id: string;
  order_number: number;
  room_number: string;
  guest_name: string;
  guest_phone: string | null;
  notes: string | null;
  guest_verified: boolean;
  payment_method: string;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  status: ShopOrderStatus;
  created_at: string;
  updated_at: string;
  shop_order_items?: ShopOrderItem[];
}
