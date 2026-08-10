import type { InfoPage } from "@/lib/types";

export function InfoPageForm({
  page,
  action,
  submitLabel,
}: {
  page?: InfoPage;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-6"
    >
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Title
        <input
          name="title"
          defaultValue={page?.title}
          required
          className="rounded-md border border-slate-300 px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Icon (emoji)
        <input
          name="icon"
          defaultValue={page?.icon ?? "📄"}
          className="w-24 rounded-md border border-slate-300 px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Body text (shown as-is, line breaks preserved)
        <textarea
          name="body"
          defaultValue={page?.body}
          rows={8}
          className="rounded-md border border-slate-300 px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Sort order (lower shows first)
        <input
          type="number"
          name="sort_order"
          defaultValue={page?.sort_order ?? 0}
          className="w-24 rounded-md border border-slate-300 px-3 py-2 font-normal"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" name="published" defaultChecked={page?.published ?? true} />
        Published (visible on the TV screen)
      </label>
      <button
        type="submit"
        className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
