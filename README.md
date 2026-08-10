# Hotel Welcome Screen

An in-room Android TV welcome screen for the hotel, in the spirit of
[WelcomeScreen.com](https://www.welcomescreen.com/): a personalized greeting,
hotel branding, local weather, a WiFi/amenities/dining info board, and a
one-tap launch into **Hulu Live TV**. Guest personalization is pulled from
**Mews**, the hotel's PMS.

```
web/               Next.js app - the guest TV screen + the staff admin dashboard
supabase/          SQL migration defining the database schema
android-tv-app/    Android TV app - a kiosk WebView pointed at web/'s /tv/<room> page
```

## How it fits together

Each hotel TV runs the Android app, configured once with its room number.
On boot it opens `https://<your-domain>/tv/<room-number>`, which:

1. Loads hotel branding, WiFi info, and info-page tiles from Supabase (public read).
2. Looks up that room's active Mews reservation server-side and greets the guest by name (falls back to a generic greeting if the room's unoccupied or Mews isn't configured).
3. Shows current weather for the hotel's location (via Open-Meteo, no API key needed).
4. Offers a **Watch Live TV** button that deep-links straight into the Hulu app already installed on the TV.

Staff manage all of the above at `/admin` (password-protected, one shared login).

**Not included in v1, on purpose:** a live "what's on now" channel guide.
Hulu (like most streaming services) doesn't provide free third-party access
to its programming schedule - that requires a paid EPG data provider (e.g.
Gracenote/TMS). The Watch Live TV button instead deep-links directly into
Hulu, where guests browse channels themselves.

---

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`. This creates
   the `hotel`, `rooms`, and `info_pages` tables, sets up Row Level
   Security, and seeds one `hotel` row.
3. Go to **Authentication → Users → Add user** and create the one staff
   login (email + password, with "Auto Confirm User" on). This is what
   staff use to sign in at `/admin` - there's no self-serve signup page.
4. From **Project Settings → API**, note down the Project URL, `anon`
   public key, and `service_role` key - you'll need all three next.

## 2. Deploy the web app

The `web/` directory is a standard Next.js app - deploy it anywhere that
runs Next.js (Vercel is the path of least resistance).

1. Copy `web/.env.example` to `web/.env.local` for local development, or
   set the same variables in your hosting provider's dashboard for
   production:

   | Variable | Where it comes from |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret - server-only) |
   | `MEWS_CLIENT_TOKEN` | Mews Marketplace / your Mews rep |
   | `MEWS_ACCESS_TOKEN` | Mews Marketplace / your Mews rep |
   | `MEWS_BASE_URL` | `https://api.mews.com` (production) or `https://api.mews-demo.com` (sandbox) |

2. `cd web && npm install && npm run build` to confirm it builds, then
   deploy (`vercel deploy` if using Vercel, or `npm run build && npm run
   start` on any Node host).
3. Sign in at `https://<your-domain>/admin` with the staff login from step
   1.3, then fill in **Hotel branding** (name, logo, background image,
   colors, address, WiFi, latitude/longitude for weather, checkout time,
   and the Hulu Android package name - `com.hulu.plus` is the default and
   usually correct) and add a few **Info pages**.

### Wiring up Mews

`web/lib/mews.ts` calls the Mews Connector API's `reservations/getAll` and
`customers/getAll` endpoints to find the guest currently checked into a
room and get their first name. This was written against the documented
Connector API shape (developers.mews.com) but **could not be tested
against a live Mews account** from this build environment - double-check
the request/response fields there before relying on it in production.

Once you have Mews credentials in the env vars above, map each physical
room to its Mews resource ID under **Rooms** in the admin dashboard (find
the resource ID in Mews under Configuration → Resources). Rooms without a
mapping just show a generic "Welcome to `<hotel>`" greeting instead of a
guest name - nothing breaks if Mews is unreachable or misconfigured.

## 3. Build and sideload the Android app

The TVs need `android-tv-app/` built into an APK and installed directly
(no Google Play Console publishing in v1 - see below on the tradeoffs).

**This project could not be compiled or tested in the sandbox this was
built in** - there's no Android SDK available there, and the environment's
network policy blocks Google's Maven repo (`dl.google.com`), which is
where the Android Gradle Plugin itself is hosted. Build it locally in
Android Studio (which bundles everything needed) before sideloading:

1. Open `android-tv-app/` in Android Studio (Meerkat or later). Let it sync
   - this downloads the Android SDK/AGP/Kotlin toolchain automatically.
2. Set your deployed web app's URL: either edit the
   `WELCOME_SCREEN_BASE_URL` line in `android-tv-app/gradle.properties`, or
   pass it at build time:
   ```
   ./gradlew assembleDebug -PWELCOME_SCREEN_BASE_URL=https://your-domain.com
   ```
3. **Replace the placeholder icon/banner** (`app/src/main/res/drawable/ic_launcher.xml`
   and `tv_banner.xml` are flat placeholder shapes) with real hotel-branded
   assets - Android Studio's Image Asset tool (right-click `res/` → New →
   Image Asset) is the easiest way.
4. Build the APK: `./gradlew assembleDebug` (output lands in
   `app/build/outputs/apk/debug/app-debug.apk`).
5. Enable Developer Options + USB/network debugging on each Android TV
   (Settings → Device Preferences → About → click "Build" 7 times, then
   Developer Options → USB debugging / Network debugging), then:
   ```
   adb connect <tv-ip-address>
   adb install app-debug.apk
   ```
6. On first launch the app shows a **room number setup screen** - type in
   the room number using the remote (a software keyboard pops up) and
   save. It then loads the welcome screen for that room and stays there.
   To reconfigure a TV later, long-press the remote's **Back** button.
7. The app relaunches itself automatically after the TV reboots.

### Why sideload instead of the Play Store?

Publishing to the Play Store (even on the internal testing track) needs a
Google Play Console developer account and goes through Google's review -
slower, and unnecessary for TVs the hotel already owns and controls.
Sideloading is faster to iterate on. If you'd rather distribute through
Play later (e.g. easier updates across many rooms), the app scaffold here
doesn't need structural changes - just a signed release build and a Play
Console listing.

---

## What you'll want to double check before rollout

- **Mews field/endpoint names** (see above) - verify against Mews' current
  API docs with a real sandbox account.
- **Hulu's Android package name** - `com.hulu.plus` is correct as of this
  build, but confirm on the actual hotel TVs (Settings → Apps → Hulu → App
  info shows the package name) and update it in **Admin → Hotel branding**
  if different.
- **Real launcher icon/banner assets** for the Android app (see step 3 above).
- **A11y/legibility pass on an actual TV** - the layout was built and
  screenshotted at a 1920×1080 desktop viewport, not on physical TV
  hardware; TV overscan and viewing-distance legibility are worth a
  once-over.

## Local development

```bash
cd web
cp .env.example .env.local   # fill in Supabase (and optionally Mews) values
npm install
npm run dev                  # http://localhost:3000/tv/101, http://localhost:3000/admin
```

The TV screen renders gracefully with a "not set up yet" message if
Supabase isn't reachable/configured yet, and Mews/weather failures always
fall back quietly rather than breaking the page - so it's safe to develop
against without live credentials for everything at once.
