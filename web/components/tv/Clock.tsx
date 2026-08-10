"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000 * 15);
  return () => clearInterval(id);
}

function getClientSnapshot() {
  return Date.now();
}

// The server can't know "now" in a way that will match the client's clock,
// so it renders a 0 sentinel; useSyncExternalStore re-renders with the real
// client snapshot right after hydration, same effect as a mounted flag
// without setState-in-an-effect.
function getServerSnapshot() {
  return 0;
}

export function Clock({ timezone }: { timezone: string }) {
  const timestamp = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (timestamp === 0) return <div className="h-[1lh]" />;

  const now = new Date(timestamp);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(now);

  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  }).format(now);

  return (
    <div className="text-right">
      <div className="text-4xl font-semibold tabular-nums">{time}</div>
      <div className="text-lg text-white/70">{date}</div>
    </div>
  );
}
