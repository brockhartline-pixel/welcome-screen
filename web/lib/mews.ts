import "server-only";
import type { GuestGreeting } from "@/lib/types";

/**
 * Mews Connector API client.
 *
 * Docs: https://mews-systems.gitbook.io/connector-api (verify against the
 * current Mews API reference when wiring up real credentials - this was
 * written from the documented v1 Connector API shape and could not be
 * tested against a live Mews account from this environment).
 *
 * Required env vars:
 *   MEWS_CLIENT_TOKEN  - identifies this integration (from Mews Marketplace)
 *   MEWS_ACCESS_TOKEN  - identifies the hotel's Mews account
 *   MEWS_CLIENT_NAME   - a short string identifying this app, e.g. "Hotel Welcome Screen 1.0"
 *   MEWS_BASE_URL      - "https://api.mews.com" (production) or
 *                        "https://api.mews-demo.com" (demo/sandbox). Defaults to production.
 */

const BASE_URL = process.env.MEWS_BASE_URL ?? "https://api.mews.com";

interface MewsReservation {
  Id: string;
  CustomerId: string;
  AssignedResourceId: string | null;
  State: string;
  EndUtc: string;
}

interface MewsReservationsResponse {
  Reservations: MewsReservation[];
}

interface MewsCustomer {
  Id: string;
  FirstName: string | null;
}

interface MewsCustomersResponse {
  Customers: MewsCustomer[];
}

function getCredentials() {
  const ClientToken = process.env.MEWS_CLIENT_TOKEN;
  const AccessToken = process.env.MEWS_ACCESS_TOKEN;
  const Client = process.env.MEWS_CLIENT_NAME ?? "Hotel Welcome Screen 1.0";

  if (!ClientToken || !AccessToken) return null;
  return { ClientToken, AccessToken, Client };
}

async function mewsPost<T>(path: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Looks up the guest currently checked into a room, by the room's Mews
 * resource id. Returns { guestFirstName: null, checkoutUtc: null } (never
 * throws) if Mews isn't configured, the room is unoccupied, or the API
 * call fails - the welcome screen falls back to a generic greeting.
 */
export async function getActiveGuestForResource(
  mewsResourceId: string | null,
): Promise<GuestGreeting> {
  const empty: GuestGreeting = { guestFirstName: null, checkoutUtc: null };
  if (!mewsResourceId) return empty;

  const credentials = getCredentials();
  if (!credentials) return empty;

  const nowUtc = new Date().toISOString();

  const reservations = await mewsPost<MewsReservationsResponse>(
    "/api/connector/v1/reservations/getAll",
    {
      ...credentials,
      ResourceIds: [mewsResourceId],
      States: ["Started"], // "Started" = guest is checked in right now
      CollidingUtc: { StartUtc: nowUtc, EndUtc: nowUtc },
      Extent: { Reservations: true },
    },
  );

  const reservation = reservations?.Reservations?.[0];
  if (!reservation) return empty;

  const customers = await mewsPost<MewsCustomersResponse>(
    "/api/connector/v1/customers/getAll",
    {
      ...credentials,
      CustomerIds: [reservation.CustomerId],
    },
  );

  const guestFirstName = customers?.Customers?.[0]?.FirstName ?? null;

  return {
    guestFirstName,
    checkoutUtc: reservation.EndUtc ?? null,
  };
}
