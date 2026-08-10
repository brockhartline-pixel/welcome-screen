import type { WeatherSnapshot } from "@/lib/types";

export function WeatherWidget({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather) return null;

  return (
    <div className="flex items-center gap-3 text-white/90">
      <span className="text-4xl leading-none">{weather.emoji}</span>
      <div>
        <div className="text-3xl font-semibold tabular-nums">{weather.temperatureF}°F</div>
        <div className="text-base text-white/70">{weather.description}</div>
      </div>
    </div>
  );
}
