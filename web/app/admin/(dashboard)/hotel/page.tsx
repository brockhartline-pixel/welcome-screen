import { getHotel } from "@/lib/hotel";
import { updateHotel } from "./actions";

export default async function HotelPage() {
  const hotel = await getHotel();

  if (!hotel) {
    return (
      <p className="text-slate-600">
        No hotel row found - run the SQL migration&apos;s seed insert first (see
        supabase/migrations/0001_init.sql).
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Hotel branding</h1>
      <form
        action={updateHotel}
        className="grid max-w-2xl gap-5 rounded-lg border border-slate-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={hotel.id} />
        <Field label="Hotel name" name="name" defaultValue={hotel.name} required />
        <Field
          label="Logo URL"
          name="logo_url"
          defaultValue={hotel.logo_url ?? ""}
          placeholder="https://…"
        />
        <Field
          label="Background image URL"
          name="background_image_url"
          defaultValue={hotel.background_image_url ?? ""}
          placeholder="https://…"
        />
        <div className="grid grid-cols-2 gap-5">
          <Field
            label="Primary color"
            name="primary_color"
            type="color"
            defaultValue={hotel.primary_color}
          />
          <Field
            label="Accent color"
            name="accent_color"
            type="color"
            defaultValue={hotel.accent_color}
          />
        </div>
        <Field label="Address" name="address" defaultValue={hotel.address ?? ""} />
        <div className="grid grid-cols-2 gap-5">
          <Field
            label="Latitude"
            name="latitude"
            type="number"
            step="any"
            defaultValue={hotel.latitude ?? ""}
            placeholder="for the weather widget"
          />
          <Field
            label="Longitude"
            name="longitude"
            type="number"
            step="any"
            defaultValue={hotel.longitude ?? ""}
            placeholder="for the weather widget"
          />
        </div>
        <Field
          label="Timezone (IANA, e.g. America/New_York)"
          name="timezone"
          defaultValue={hotel.timezone}
        />
        <div className="grid grid-cols-2 gap-5">
          <Field
            label="WiFi network name"
            name="wifi_ssid"
            defaultValue={hotel.wifi_ssid ?? ""}
          />
          <Field
            label="WiFi password"
            name="wifi_password"
            defaultValue={hotel.wifi_password ?? ""}
          />
        </div>
        <Field
          label="Checkout time"
          name="checkout_time"
          defaultValue={hotel.checkout_time ?? ""}
          placeholder="11:00 AM"
        />
        <Field
          label="Hulu Android package name"
          name="hulu_package_name"
          defaultValue={hotel.hulu_package_name}
          placeholder="com.hulu.plus"
        />
        <button
          type="submit"
          className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  step,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  required?: boolean;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-slate-300 px-3 py-2 font-normal"
      />
    </label>
  );
}
