/**
 * Deep-links straight into the hotel's Hulu Live TV app.
 *
 * This renders a standard Android "intent://" URL. It does nothing useful
 * in a desktop browser (which is expected - it only matters on the TV).
 * The Android wrapper app's WebView intercepts this specific URL scheme in
 * MainActivity.shouldOverrideUrlLoading and starts the Hulu app natively,
 * falling back to its Play Store listing if Hulu isn't installed. See
 * /android-tv-app/app/src/main/java/.../MainActivity.kt.
 */
export function WatchLiveTvButton({ huluPackageName }: { huluPackageName: string }) {
  const intentUrl =
    `intent://launch#Intent;` +
    `package=${huluPackageName};` +
    `action=android.intent.action.MAIN;` +
    `category=android.intent.category.LEANBACK_LAUNCHER;` +
    `end`;

  return (
    <a
      href={intentUrl}
      data-tv-focusable
      className="flex items-center gap-3 rounded-2xl bg-[var(--tv-accent)] px-8 py-6 text-2xl font-semibold text-black outline-none transition-transform focus:scale-105 focus:ring-4 focus:ring-white"
    >
      <span className="text-3xl leading-none">📺</span>
      Watch Live TV
    </a>
  );
}
