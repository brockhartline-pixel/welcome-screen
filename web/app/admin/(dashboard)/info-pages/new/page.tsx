import { InfoPageForm } from "@/components/admin/InfoPageForm";
import { createInfoPage } from "../actions";

export default function NewInfoPagePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">New info page</h1>
      <InfoPageForm action={createInfoPage} submitLabel="Create page" />
    </div>
  );
}
