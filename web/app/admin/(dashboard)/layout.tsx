import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { logout } from "@/app/admin/actions";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hotel", label: "Hotel branding" },
  { href: "/admin/info-pages", label: "Info pages" },
  { href: "/admin/rooms", label: "Rooms" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-slate-900">Welcome Screen Admin</span>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">
            Sign out
          </button>
        </form>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
