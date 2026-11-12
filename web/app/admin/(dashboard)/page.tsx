import Link from "next/link";

const CARDS = [
  {
    href: "/admin/hotel",
    title: "Hotel branding",
    description: "Logo, colors, background image, WiFi, address, and weather location.",
  },
  {
    href: "/admin/info-pages",
    title: "Info pages",
    description: "The tiles guests see on the welcome screen (WiFi, dining, amenities, etc.).",
  },
  {
    href: "/admin/rooms",
    title: "Rooms",
    description: "Map room numbers to Mews so guests are greeted by name.",
  },
  {
    href: "/admin/orders",
    title: "Orders",
    description: "Incoming in-room shop orders - pack, deliver, and mark them done.",
  },
  {
    href: "/admin/shop",
    title: "Shop products",
    description: "What guests can order to their room, prices, stock, and delivery fee.",
  },
];

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
          >
            <h2 className="mb-1 font-semibold text-slate-900">{card.title}</h2>
            <p className="text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
