import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-16 text-center text-white">
      <h1 className="text-3xl font-semibold">Hotel Welcome Screen</h1>
      <p className="max-w-md text-slate-400">
        The guest screen lives at <span className="font-mono">/tv/&lt;room-number&gt;</span> and
        is meant to be opened by the in-room Android TV app, not visited directly here.
      </p>
      <Link
        href="/admin"
        className="mt-4 rounded-md bg-white px-5 py-2.5 font-medium text-slate-950 hover:bg-slate-200"
      >
        Staff admin dashboard
      </Link>
    </div>
  );
}
