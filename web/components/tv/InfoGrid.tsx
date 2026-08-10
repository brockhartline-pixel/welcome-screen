import type { InfoPage } from "@/lib/types";

export function InfoGrid({
  pages,
  onSelect,
}: {
  pages: InfoPage[];
  onSelect: (page: InfoPage) => void;
}) {
  if (pages.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          data-tv-focusable
          onClick={() => onSelect(page)}
          className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-6 text-center backdrop-blur-sm outline-none transition-transform focus:scale-105 focus:bg-white/25 focus:ring-4 focus:ring-white"
        >
          <span className="text-4xl leading-none">{page.icon || "📄"}</span>
          <span className="text-lg font-medium text-white">{page.title}</span>
        </button>
      ))}
    </div>
  );
}
