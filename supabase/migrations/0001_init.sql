-- =========================================================
-- RoutePilot schema
-- =========================================================

-- profiles: extends auth.users with company info
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  full_name text,
  phone text,
  home_base_address text,
  home_base_lat double precision,
  home_base_lng double precision,
  hourly_rate numeric not null default 150,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- technicians: field workers (receive SMS, not app users)
create table technicians (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,               -- E.164 format, e.g. +15551234567
  color text not null default '#b8f724',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- customers: optional saved/repeat customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  address text not null,
  lat double precision,
  lng double precision,
  notes text,
  created_at timestamptz not null default now()
);

-- jobs: the core unit — a stop to visit
create table jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  technician_id uuid references technicians(id) on delete set null,
  title text not null,
  customer_name text,
  address text not null,
  lat double precision,
  lng double precision,
  scheduled_date date not null default current_date,
  time_window_start time,
  time_window_end time,
  duration_min int not null default 30,
  sequence int,                      -- order in route after optimization
  eta timestamptz,
  status text not null default 'scheduled'
    check (status in ('scheduled','en_route','completed','canceled')),
  notes text,
  created_at timestamptz not null default now()
);

-- route_optimizations: log every optimize run (powers ROI metrics)
create table route_optimizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  technician_id uuid references technicians(id) on delete set null,
  route_date date not null,
  stop_count int not null default 0,
  baseline_distance_m int,
  baseline_duration_s int,
  optimized_distance_m int,
  optimized_duration_s int,
  distance_saved_m int,
  duration_saved_s int,
  created_at timestamptz not null default now()
);

-- subscriptions: Stripe billing
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'trial',
  status text not null default 'trialing',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_technicians_owner on technicians(owner_id);
create index idx_customers_owner on customers(owner_id);
create index idx_jobs_owner on jobs(owner_id);
create index idx_jobs_date_tech on jobs(scheduled_date, technician_id);
create index idx_routeopt_owner_date on route_optimizations(owner_id, route_date);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table technicians enable row level security;
alter table customers enable row level security;
alter table jobs enable row level security;
alter table route_optimizations enable row level security;
alter table subscriptions enable row level security;

-- RLS policies: each user only touches their own rows
create policy "own profile" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "own technicians" on technicians
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own customers" on customers
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own jobs" on jobs
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own route_optimizations" on route_optimizations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own subscription" on subscriptions
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Auto-create profile + trial subscription on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  insert into public.subscriptions (owner_id, plan, status)
  values (new.id, 'trial', 'trialing');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- keep updated_at fresh
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();
