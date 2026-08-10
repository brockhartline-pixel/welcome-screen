import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Room } from "@/lib/types";

/**
 * Server-only room lookup used by the public TV screen to resolve a room
 * number to its Mews resource id. Uses the service-role client because the
 * `rooms` table (which holds internal Mews identifiers) has no public read
 * policy - see supabase/migrations/0001_init.sql.
 */
export async function getRoomByNumber(roomNumber: string): Promise<Room | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_number", roomNumber)
      .maybeSingle();
    return (data as Room | null) ?? null;
  } catch {
    return null;
  }
}
