import type { WeatherSnapshot } from "@/lib/types";

export function WeatherWidget({ weather }: { weather: WeatherSnapshot | null }) {
  if (!weather) return null;

  return (
    <div className="text-right text-white/90">
      <div className="text-3xl font-semibold tabular-nums">{weather.temperatureF}°F</div>
      <div className="text-base text-white/70">{weather.description}</div>
    </div>
  );
}
