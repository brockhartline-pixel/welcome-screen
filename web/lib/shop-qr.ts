import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

/**
 * The guest-facing shop URL for a room, plus an SVG QR code for it, for the
 * TV screen. Uses SHOP_PUBLIC_BASE_URL if set (recommended in production),
 * otherwise the host the TV loaded this page from.
 */
export async function getShopLink(roomNumber: string): Promise<{ url: string; qrSvg: string }> {
  let base = process.env.SHOP_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    base = `${proto}://${host}`;
  }
  const url = `${base}/shop/${encodeURIComponent(roomNumber)}`;
  const qrSvg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  return { url, qrSvg };
}
