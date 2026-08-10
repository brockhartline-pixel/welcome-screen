import { NextResponse } from "next/server";
import { getHotel } from "@/lib/hotel";
import { getTvData } from "@/lib/tv-data";

/**
 * Polled by the TV screen every few minutes (see components/tv/TvScreen.tsx)
 * to pick up a newly checked-in guest's name or updated weather without a
 * full page reload. Not cached - always reflects current state.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/tv-data/[roomNumber]">) {
  const { roomNumber } = await ctx.params;
  const hotel = await getHotel();
  const data = await getTvData(roomNumber, hotel);
  return NextResponse.json(data);
}
