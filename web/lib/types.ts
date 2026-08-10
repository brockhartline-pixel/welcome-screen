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
