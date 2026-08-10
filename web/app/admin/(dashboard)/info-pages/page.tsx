import Link from "next/link";
import { getAllInfoPages } from "@/lib/info-pages";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { deleteInfoPage } from "./actions";

export default async function InfoPagesPage() {
  const pages = await getAllInfoPages();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Info pages</h1>
        <Link
          href="/admin/info-pages/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          New page
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-4 py-3 text-slate-600">{page.sort_order}</td>
                <td className="px-4 py-3 text-xl">{page.icon}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{page.title}</td>
                <td className="px-4 py-3">
                  {page.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Published
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/info-pages/${page.id}`}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Edit
                    </Link>
                    <form action={deleteInfoPage}>
                      <input type="hidden" name="id" value={page.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Delete "${page.title}"? This can't be undone.`}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No info pages yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
