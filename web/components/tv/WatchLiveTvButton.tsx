import { TV_TILE_CLASSNAME } from "@/components/tv/InfoGrid";

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
    <a href={intentUrl} data-tv-focusable className={TV_TILE_CLASSNAME}>
      <span className="text-3xl leading-none">📺</span>
      <span className="text-base font-medium text-white">Watch Live TV</span>
    </a>
  );
}
