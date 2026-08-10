"use client";

import { useEffect, type RefObject } from "react";

type Direction = "up" | "down" | "left" | "right";

/**
 * Minimal D-pad spatial navigation for TV remotes.
 *
 * Android TV's WebView delivers D-pad presses as standard ArrowUp/Down/
 * Left/Right KeyboardEvents. Rather than relying on DOM tab order (which
 * rarely matches a visual grid), this finds the nearest focusable element
 * in the pressed direction by comparing bounding-box centers.
 *
 * Mark navigable elements with the `data-tv-focusable` attribute on real
 * <button>/<a> elements (so Enter/click already "just works" on them).
 */
export function useTvNavigation(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function getFocusable(): HTMLElement[] {
      return Array.from(
        container!.querySelectorAll<HTMLElement>("[data-tv-focusable]"),
      ).filter((el) => el.offsetParent !== null);
    }

    function focusNearest(direction: Direction) {
      const focusable = getFocusable();
      const current = document.activeElement as HTMLElement | null;

      if (!current || !focusable.includes(current)) {
        focusable[0]?.focus();
        return;
      }

      const currentRect = current.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2,
      };

      let best: HTMLElement | null = null;
      let bestScore = Infinity;

      for (const el of focusable) {
        if (el === current) continue;
        const rect = el.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;

        const inDirection =
          (direction === "up" && dy < -1) ||
          (direction === "down" && dy > 1) ||
          (direction === "left" && dx < -1) ||
          (direction === "right" && dx > 1);
        if (!inDirection) continue;

        const onAxis = direction === "up" || direction === "down";
        const primary = onAxis ? Math.abs(dy) : Math.abs(dx);
        const cross = onAxis ? Math.abs(dx) : Math.abs(dy);
        // Weight cross-axis drift heavier so navigation prefers staying
        // roughly aligned with the current row/column.
        const score = primary + cross * 2;

        if (score < bestScore) {
          bestScore = score;
          best = el;
        }
      }

      best?.focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      const directions: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const direction = directions[e.key];
      if (!direction) return;
      focusNearest(direction);
      e.preventDefault();
    }

    window.addEventListener("keydown", onKeyDown);

    if (!container.contains(document.activeElement)) {
      getFocusable()[0]?.focus();
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [containerRef]);
}
