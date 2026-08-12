import type { InfoPage } from "@/lib/types";

// Shared with WatchLiveTvButton so every tile in the bottom row - Watch
// Live TV plus each info page - reads as one consistent set, like
// WelcomeScreen.com's bottom nav (icon on top, label below, evenly spaced).
export const TV_TILE_CLASSNAME =
  "group flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-white/15 px-4 py-5 text-center backdrop-blur-md outline-none transition-transform focus:scale-105 focus:bg-white/30 focus:ring-4 focus:ring-white";

export function InfoGrid({
  pages,
  onSelect,
}: {
  pages: InfoPage[];
  onSelect: (page: InfoPage) => void;
}) {
  return (
    <>
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          data-tv-focusable
          onClick={() => onSelect(page)}
          className={TV_TILE_CLASSNAME}
        >
          <span className="text-3xl leading-none">{page.icon || "📄"}</span>
          <span className="text-base font-medium text-white">{page.title}</span>
        </button>
      ))}
    </>
  );
}
