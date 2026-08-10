import "server-only";
import { getRoomByNumber } from "@/lib/rooms";
import { getActiveGuestForResource } from "@/lib/mews";
import { getWeather } from "@/lib/weather";
import type { Hotel, TvData } from "@/lib/types";

/**
 * Everything on the TV screen that can change while a guest's stay is in
 * progress (their name, the weather) - as opposed to hotel branding/info
 * pages, which only change when staff edit them. Used for both the initial
 * server render and the periodic client-side refresh (see
 * app/api/tv-data/[roomNumber]/route.ts and components/tv/TvScreen.tsx).
 */
export async function getTvData(roomNumber: string, hotel: Hotel | null): Promise<TvData> {
  const room = await getRoomByNumber(roomNumber);

  const [greeting, weather] = await Promise.all([
    getActiveGuestForResource(room?.mews_resource_id ?? null),
    getWeather(hotel?.latitude ?? null, hotel?.longitude ?? null),
  ]);

  return { greeting, weather };
}
