"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "@/components/tv/Clock";
import { WeatherWidget } from "@/components/tv/WeatherWidget";
import { InfoGrid } from "@/components/tv/InfoGrid";
import { InfoDetail } from "@/components/tv/InfoDetail";
import { WatchLiveTvButton } from "@/components/tv/WatchLiveTvButton";
import { useTvNavigation } from "@/components/tv/useTvNavigation";
import type { Hotel, InfoPage, TvData } from "@/lib/types";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function TvScreen({
  hotel,
  infoPages,
  roomNumber,
  initialData,
}: {
  hotel: Hotel;
  infoPages: InfoPage[];
  roomNumber: string;
  initialData: TvData;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(initialData);
  const [selectedPage, setSelectedPage] = useState<InfoPage | null>(null);

  useTvNavigation(containerRef);

  // Picks up a newly checked-in guest's name or refreshed weather without
  // requiring the kiosk to ever reload the page.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/tv-data/${encodeURIComponent(roomNumber)}`, {
          cache: "no-store",
        });
        if (res.ok) setData(await res.json());
      } catch {
        // Offline or the request timed out - keep showing the last known data.
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [roomNumber]);

  const greetingName = data.greeting.guestFirstName;
  const checkoutText = data.greeting.checkoutUtc
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
        timeZone: hotel.timezone,
      }).format(new Date(data.greeting.checkoutUtc))
    : null;

  const backgroundStyle: React.CSSProperties = hotel.background_image_url
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.5) 100%), url(${hotel.background_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage: `linear-gradient(160deg, ${hotel.primary_color}, #05070d)`,
      };

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen flex-col justify-between overflow-hidden p-14 font-sans text-white"
      style={{
        ...backgroundStyle,
        ["--tv-accent" as string]: hotel.accent_color,
      }}
    >
      {/* Background content is made inert while the info detail overlay is
          open, so D-pad navigation can't "reach through" it to hidden tiles. */}
      <div className="flex flex-1 flex-col justify-between" inert={selectedPage !== null}>
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {hotel.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hotel.logo_url} alt={hotel.name} className="h-20 w-auto" />
            ) : null}
            <span className="text-2xl font-semibold tracking-wide">{hotel.name}</span>
          </div>
          <div className="flex items-center gap-8">
            <WeatherWidget weather={data.weather} />
            <Clock timezone={hotel.timezone} />
          </div>
        </header>

        <main className="flex flex-col gap-3">
          <h1 className="text-6xl font-bold drop-shadow-lg">
            {greetingName ? `Welcome back, ${greetingName}` : `Welcome to ${hotel.name}`}
          </h1>
          <p className="text-2xl text-white/80">
            Room {roomNumber}
            {checkoutText ? ` · Checkout ${checkoutText}` : ""}
          </p>
        </main>

        <footer className="flex gap-4">
          <WatchLiveTvButton huluPackageName={hotel.hulu_package_name} />
          <InfoGrid pages={infoPages} onSelect={setSelectedPage} />
        </footer>
      </div>

      {selectedPage ? (
        <InfoDetail page={selectedPage} onClose={() => setSelectedPage(null)} />
      ) : null}
    </div>
  );
}
