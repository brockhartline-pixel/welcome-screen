-- Hotel Welcome Screen - initial schema
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a
-- fresh project. Safe to run once; re-running will error on the seed
-- insert / existing objects rather than duplicate anything silently.

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table public.hotel (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Your Hotel',
  logo_url text,
  background_image_url text,
  primary_color text not null default '#0f172a',
  accent_color text not null default '#38bdf8',
  address text,
  latitude double precision,
  longitude double precision,
  timezone text not null default 'America/New_York',
  wifi_ssid text,
  wifi_password text,
  checkout_time text default '11:00 AM',
  hulu_package_name text not null default 'com.hulu.plus',
  updated_at timestamptz not null default now()
);
comment on table public.hotel is 'Single-row table: this hotel''s branding and config.';

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  mews_resource_id text,
  created_at timestamptz not null default now()
);
comment on table public.rooms is 'Maps a physical room number to its Mews resource id, for guest lookup.';

create table public.info_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  icon text not null default '📄',
  body text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.info_pages is 'The info tiles shown on the guest TV screen (WiFi, dining, amenities, ...).';

-- Seed the one hotel row the app expects to exist.
insert into public.hotel (name) values ('Your Hotel');

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger hotel_set_updated_at
before update on public.hotel
for each row execute function public.set_updated_at();

create trigger info_pages_set_updated_at
before update on public.info_pages
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- `hotel` and published `info_pages` are readable by anyone (the guest TV
-- screen is unauthenticated). Everything else - all writes, unpublished
-- info pages, and the entire `rooms` table (which holds internal Mews
-- identifiers) - requires an authenticated (staff) session. The public TV
-- screen never reads `rooms` directly anyway; it goes through the
-- service-role client server-side (see web/lib/rooms.ts), which bypasses
-- RLS entirely.
-- ---------------------------------------------------------------------

alter table public.hotel enable row level security;
alter table public.rooms enable row level security;
alter table public.info_pages enable row level security;

create policy "hotel_public_read" on public.hotel
  for select using (true);

create policy "hotel_staff_write" on public.hotel
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "info_pages_public_read_published" on public.info_pages
  for select using (published = true);

create policy "info_pages_staff_read_all" on public.info_pages
  for select using (auth.role() = 'authenticated');

create policy "info_pages_staff_write" on public.info_pages
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "rooms_staff_all" on public.rooms
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- After running this: create your one admin login in
-- Supabase Dashboard -> Authentication -> Users -> Add user
-- (email + password, "Auto Confirm User" on) - that's the account staff
-- use to sign in at /admin.
-- ---------------------------------------------------------------------
