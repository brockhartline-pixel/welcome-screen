import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InfoPageForm } from "@/components/admin/InfoPageForm";
import { updateInfoPage } from "../actions";
import type { InfoPage } from "@/lib/types";

export default async function EditInfoPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.from("info_pages").select("*").eq("id", id).maybeSingle();
  const page = data as InfoPage | null;
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Edit info page</h1>
      <InfoPageForm
        page={page}
        action={updateInfoPage.bind(null, page.id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
