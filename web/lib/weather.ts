import "server-only";
import type { WeatherSnapshot } from "@/lib/types";

// WMO weather codes -> a short description + emoji. Covers the codes
// Open-Meteo actually returns; see https://open-meteo.com/en/docs (Weather
// Variable Documentation -> WMO Weather interpretation codes).
const WMO_CODES: Record<number, { description: string; emoji: string }> = {
  0: { description: "Clear sky", emoji: "☀️" },
  1: { description: "Mostly clear", emoji: "🌤️" },
  2: { description: "Partly cloudy", emoji: "⛅" },
  3: { description: "Overcast", emoji: "☁️" },
  45: { description: "Fog", emoji: "🌫️" },
  48: { description: "Fog", emoji: "🌫️" },
  51: { description: "Light drizzle", emoji: "🌦️" },
  53: { description: "Drizzle", emoji: "🌦️" },
  55: { description: "Heavy drizzle", emoji: "🌧️" },
  56: { description: "Freezing drizzle", emoji: "🌧️" },
  57: { description: "Freezing drizzle", emoji: "🌧️" },
  61: { description: "Light rain", emoji: "🌦️" },
  63: { description: "Rain", emoji: "🌧️" },
  65: { description: "Heavy rain", emoji: "🌧️" },
  66: { description: "Freezing rain", emoji: "🌧️" },
  67: { description: "Freezing rain", emoji: "🌧️" },
  71: { description: "Light snow", emoji: "🌨️" },
  73: { description: "Snow", emoji: "❄️" },
  75: { description: "Heavy snow", emoji: "❄️" },
  77: { description: "Snow grains", emoji: "❄️" },
  80: { description: "Rain showers", emoji: "🌦️" },
  81: { description: "Rain showers", emoji: "🌧️" },
  82: { description: "Violent rain showers", emoji: "⛈️" },
  85: { description: "Snow showers", emoji: "🌨️" },
  86: { description: "Snow showers", emoji: "🌨️" },
  95: { description: "Thunderstorm", emoji: "⛈️" },
  96: { description: "Thunderstorm w/ hail", emoji: "⛈️" },
  99: { description: "Thunderstorm w/ hail", emoji: "⛈️" },
};

interface OpenMeteoResponse {
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
}

/**
 * Current weather for the hotel's location via Open-Meteo - free, no API
 * key required. Returns null on any failure so a weather outage never
 * breaks the welcome screen.
 */
export async function getWeather(
  latitude: number | null,
  longitude: number | null,
): Promise<WeatherSnapshot | null> {
  if (latitude == null || longitude == null) return null;

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("temperature_unit", "fahrenheit");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url, {
      next: { revalidate: 600 }, // 10 minutes
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as OpenMeteoResponse;
    if (!data.current) return null;

    const match = WMO_CODES[data.current.weather_code] ?? {
      description: "—",
      emoji: "🌡️",
    };

    return {
      temperatureF: Math.round(data.current.temperature_2m),
      description: match.description,
      emoji: match.emoji,
    };
  } catch {
    return null;
  }
}
