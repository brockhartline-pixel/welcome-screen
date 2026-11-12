"use client";

import { useEffect, useRef } from "react";

export function ShopOverlay({
  url,
  qrSvg,
  note,
  onClose,
}: {
  url: string;
  qrSvg: string;
  note: string | null;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Backspace") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center gap-20 bg-black/90 p-16 backdrop-blur-md">
      <div
        className="h-[420px] w-[420px] rounded-3xl bg-white p-6 [&>svg]:h-full [&>svg]:w-full"
        // QR SVG is generated server-side by the qrcode library from our own URL.
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <div className="flex max-w-xl flex-col gap-6 text-white">
        <h2 className="text-5xl font-semibold">Order to your room</h2>
        <p className="text-2xl leading-relaxed text-white/85">
          Snacks, drinks, and essentials - delivered to your door and charged to your room.
          Scan with your phone&apos;s camera to start shopping.
        </p>
        {note ? <p className="text-xl text-white/70">{note}</p> : null}
        <p className="break-all font-mono text-lg text-white/60">{url}</p>
        <button
          ref={closeButtonRef}
          type="button"
          data-tv-focusable
          onClick={onClose}
          className="self-start rounded-full bg-white/10 px-6 py-3 text-xl font-medium text-white outline-none transition focus:bg-white/25 focus:ring-4 focus:ring-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
