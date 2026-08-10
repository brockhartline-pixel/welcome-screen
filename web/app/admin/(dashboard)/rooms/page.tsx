import { createClient } from "@/lib/supabase/server";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createRoom, updateRoom, deleteRoom } from "./actions";
import type { Room } from "@/lib/types";

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("*").order("room_number");
  const rooms = (data as Room[] | null) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Rooms</h1>
        <p className="text-sm text-slate-600">
          Map each room number to its Mews resource ID so the welcome screen can greet the
          checked-in guest by name. Find a room&apos;s resource ID in Mews under
          Configuration → Resources. Rooms without a mapping just show a generic greeting.
        </p>
      </div>

      <form
        action={createRoom}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Room number
          <input
            name="room_number"
            required
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-slate-700">
          Mews resource ID
          <input
            name="mews_resource_id"
            className="rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add room
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Room number</th>
              <th className="px-4 py-3">Mews resource ID</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td colSpan={3} className="p-0">
                  <form
                    action={updateRoom.bind(null, room.id)}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <input type="hidden" name="id" value={room.id} />
                    <input
                      name="room_number"
                      defaultValue={room.room_number}
                      required
                      className="w-32 rounded-md border border-slate-300 px-3 py-2"
                    />
                    <input
                      name="mews_resource_id"
                      defaultValue={room.mews_resource_id ?? ""}
                      placeholder="e.g. a1b2c3d4-…"
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      Save
                    </button>
                    <ConfirmSubmitButton
                      formAction={deleteRoom}
                      confirmMessage={`Remove room ${room.room_number}?`}
                      className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </td>
              </tr>
            ))}
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No rooms yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
