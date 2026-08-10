import { login } from "@/app/admin/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <form
        action={login}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-2xl font-semibold text-slate-900">Staff sign in</h1>
        <p className="mb-6 text-sm text-slate-500">Hotel Welcome Screen admin</p>
        {error ? (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <label className="mb-3 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="mb-6 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
