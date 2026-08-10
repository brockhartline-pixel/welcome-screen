import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Renamed from `middleware.ts` in Next.js 16 - same mechanism, new file name.
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and image optimization files.
     * We still want this to run on /admin/* and /tv/* (auth + session
     * refresh), which is the default without a narrower matcher.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
