"use client";

import { useEffect, useRef } from "react";
import type { InfoPage } from "@/lib/types";

export function InfoDetail({ page, onClose }: { page: InfoPage; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Backspace") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90 p-16 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl leading-none">{page.icon || "📄"}</span>
          <h2 className="text-5xl font-semibold text-white">{page.title}</h2>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          data-tv-focusable
          onClick={onClose}
          className="rounded-full bg-white/10 px-6 py-3 text-xl font-medium text-white outline-none transition focus:bg-white/25 focus:ring-4 focus:ring-white"
        >
          Close
        </button>
      </div>
      <div className="mt-10 max-w-4xl overflow-y-auto whitespace-pre-wrap text-2xl leading-relaxed text-white/90">
        {page.body}
      </div>
    </div>
  );
}
