export function ShopClosed({ hotelName }: { hotelName: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-8 text-center">
      <span className="text-5xl">🛎️</span>
      <h1 className="text-2xl font-semibold text-slate-900">The in-room shop is closed</h1>
      <p className="max-w-sm text-slate-600">
        {hotelName ? `${hotelName}'s` : "Our"} front desk is happy to help with anything you
        need - just give them a call from your room phone.
      </p>
    </div>
  );
}
