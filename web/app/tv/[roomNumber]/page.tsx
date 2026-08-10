import { getHotel } from "@/lib/hotel";
import { getPublishedInfoPages } from "@/lib/info-pages";
import { getTvData } from "@/lib/tv-data";
import { TvScreen } from "@/components/tv/TvScreen";

// Guest name, checkout time, and weather all change over the course of a
// stay - never statically prerender this route.
export const dynamic = "force-dynamic";

export default async function TvPage({ params }: PageProps<"/tv/[roomNumber]">) {
  const { roomNumber } = await params;

  const hotel = await getHotel();

  if (!hotel) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-slate-950 p-16 text-center text-white">
        <h1 className="text-4xl font-semibold">Welcome screen not set up yet</h1>
        <p className="max-w-xl text-lg text-white/70">
          No hotel configuration was found. Sign in at{" "}
          <span className="font-mono">/admin</span> to add your hotel&apos;s branding and info
          pages, then reload this screen.
        </p>
      </div>
    );
  }

  const [infoPages, tvData] = await Promise.all([
    getPublishedInfoPages(),
    getTvData(roomNumber, hotel),
  ]);

  return (
    <TvScreen hotel={hotel} infoPages={infoPages} roomNumber={roomNumber} initialData={tvData} />
  );
}
