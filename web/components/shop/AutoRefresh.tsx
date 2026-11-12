"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-renders the current Server Component page every `seconds` (order status tracking). */
export function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
