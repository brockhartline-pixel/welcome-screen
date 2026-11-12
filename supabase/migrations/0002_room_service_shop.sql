-- In-room shop ("order to your room") - convenience-store style ordering
-- for guests, fulfilled by hotel staff from the hotel's own inventory.
--
-- Run after 0001_init.sql. Money is stored in integer cents everywhere.

-- ---------------------------------------------------------------------
-- Shop settings on the existing hotel row
-- ---------------------------------------------------------------------

alter table public.hotel
  add column shop_enabled boolean not null default true,
  add column shop_delivery_fee_cents integer not null default 0 check (shop_delivery_fee_cents >= 0),
  add column shop_note text default 'Delivered to your door in about 20 minutes.';

-- ---------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------

create table public.shop_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '🛍️',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
comment on table public.shop_categories is 'Aisles in the in-room shop (Snacks, Drinks, Essentials, ...).';

create table public.shop_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.shop_categories (id) on delete set null,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  emoji text not null default '🛍️',
  in_stock boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.shop_products is 'Items guests can order to their room.';

create trigger shop_products_set_updated_at
before update on public.shop_products
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------

create type public.shop_order_status as enum (
  'received', 'preparing', 'on_the_way', 'delivered', 'cancelled'
);

create table public.shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001),
  room_number text not null,
  guest_name text not null,
  guest_phone text,
  notes text,
  -- true when the guest's last name matched the room's checked-in Mews
  -- reservation; false when Mews wasn't available to check (staff should
  -- confirm before charging the room).
  guest_verified boolean not null default false,
  payment_method text not null default 'room_charge',
  subtotal_cents integer not null,
  delivery_fee_cents integer not null default 0,
  total_cents integer not null,
  status public.shop_order_status not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.shop_orders is 'Guest orders. Written only server-side via the service role.';

create index shop_orders_created_at_idx on public.shop_orders (created_at desc);

create trigger shop_orders_set_updated_at
before update on public.shop_orders
for each row execute function public.set_updated_at();

create table public.shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders (id) on delete cascade,
  product_id uuid references public.shop_products (id) on delete set null,
  -- Name and price are snapshotted so later catalog edits don't rewrite history.
  product_name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0 and quantity <= 20)
);

create index shop_order_items_order_id_idx on public.shop_order_items (order_id);

-- ---------------------------------------------------------------------
-- Row Level Security
--
-- Categories and active products are public (the guest shop page is
-- unauthenticated). Orders are never readable/writable by anon: the guest
-- page places and reads orders through server code using the service-role
-- client (web/lib/shop.ts), which re-prices every item from the database.
-- ---------------------------------------------------------------------

alter table public.shop_categories enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;

create policy "shop_categories_public_read" on public.shop_categories
  for select using (true);
create policy "shop_categories_staff_write" on public.shop_categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "shop_products_public_read_active" on public.shop_products
  for select using (active = true);
create policy "shop_products_staff_read_all" on public.shop_products
  for select using (auth.role() = 'authenticated');
create policy "shop_products_staff_write" on public.shop_products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "shop_orders_staff_all" on public.shop_orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "shop_order_items_staff_all" on public.shop_order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- Starter catalog - edit prices/items in Admin -> Shop products.
-- ---------------------------------------------------------------------

with cats as (
  insert into public.shop_categories (name, icon, sort_order) values
    ('Snacks', '🍿', 10),
    ('Drinks', '🥤', 20),
    ('Sweets', '🍫', 30),
    ('Essentials', '🪥', 40),
    ('Health', '💊', 50)
  returning id, name
)
insert into public.shop_products (category_id, name, description, price_cents, emoji, sort_order)
select cats.id, p.name, p.description, p.price_cents, p.emoji, p.sort_order
from cats
join (values
  ('Snacks', 'Potato Chips', 'Classic salted, 2 oz bag', 350, '🥔', 10),
  ('Snacks', 'Mixed Nuts', 'Roasted & salted, 3 oz', 600, '🥜', 20),
  ('Snacks', 'Pretzels', 'Mini twists, 4 oz', 350, '🥨', 30),
  ('Snacks', 'Popcorn', 'Microwave, butter', 400, '🍿', 40),
  ('Snacks', 'Instant Noodles', 'Cup, chicken flavor', 300, '🍜', 50),
  ('Drinks', 'Bottled Water', 'Still, 1 L', 300, '💧', 10),
  ('Drinks', 'Sparkling Water', 'Lime, 12 oz can', 300, '🫧', 20),
  ('Drinks', 'Cola', '12 oz can', 300, '🥤', 30),
  ('Drinks', 'Orange Juice', '12 oz bottle', 450, '🍊', 40),
  ('Drinks', 'Cold Brew Coffee', '11 oz bottle', 550, '☕', 50),
  ('Drinks', 'Energy Drink', '16 oz can', 500, '⚡', 60),
  ('Sweets', 'Chocolate Bar', 'Milk chocolate, 1.5 oz', 300, '🍫', 10),
  ('Sweets', 'Gummy Bears', '5 oz bag', 400, '🐻', 20),
  ('Sweets', 'Ice Cream Pint', 'Vanilla', 800, '🍨', 30),
  ('Sweets', 'Cookies', 'Chocolate chip, 6-pack', 450, '🍪', 40),
  ('Essentials', 'Toothbrush & Paste', 'Travel kit', 500, '🪥', 10),
  ('Essentials', 'Phone Charger', 'USB-C, 6 ft', 1800, '🔌', 20),
  ('Essentials', 'Razor', 'Disposable, 2-pack', 600, '🪒', 30),
  ('Essentials', 'Deodorant', 'Travel size', 500, '🧴', 40),
  ('Essentials', 'Earplugs', 'Foam, 4 pairs', 300, '🔇', 50),
  ('Health', 'Pain Reliever', 'Ibuprofen, 24 ct', 800, '💊', 10),
  ('Health', 'Antacid', 'Chewable, 12 ct', 600, '🌿', 20),
  ('Health', 'Bandages', 'Assorted, 20 ct', 500, '🩹', 30),
  ('Health', 'Allergy Relief', 'Non-drowsy, 10 ct', 1000, '🤧', 40)
) as p(category, name, description, price_cents, emoji, sort_order)
  on p.category = cats.name;
