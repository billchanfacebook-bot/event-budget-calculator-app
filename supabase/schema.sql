create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  location text,
  attendee_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  currency text not null default 'HKD',
  budget_cap numeric(12, 2) not null default 0,
  notes text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events
add column if not exists budget_cap numeric(12, 2) not null default 0;

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  category_id uuid references public.budget_categories(id) on delete set null,
  item_name text not null,
  vendor text,
  estimated_cost numeric(12, 2) not null default 0,
  actual_cost numeric(12, 2) not null default 0,
  payment_status text not null default 'pending' check (
    payment_status in ('pending', 'partially_paid', 'paid', 'cancelled')
  ),
  due_date date,
  notes text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  budget_item_id uuid not null references public.budget_items(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_date date,
  payment_method text,
  note text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.event_collaborators (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  email text not null,
  role text not null default 'editor' check (role in ('editor')),
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists event_collaborators_event_email_unique
on public.event_collaborators (event_id, lower(email));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row execute procedure public.set_updated_at();

drop trigger if exists set_budget_items_updated_at on public.budget_items;
create trigger set_budget_items_updated_at
before update on public.budget_items
for each row execute procedure public.set_updated_at();

create or replace function public.current_user_email()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.owns_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events
    where events.id = target_event_id
      and events.created_by = auth.uid()
  );
$$;

create or replace function public.can_access_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.owns_event(target_event_id)
    or exists (
      select 1
      from public.event_collaborators
      where event_collaborators.event_id = target_event_id
        and lower(event_collaborators.email) = public.current_user_email()
    );
$$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_collaborators enable row level security;
alter table public.budget_categories enable row level security;
alter table public.budget_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_select_all_authenticated" on public.events;
drop policy if exists "events_select_by_owner_or_collaborator" on public.events;
create policy "events_select_by_owner_or_collaborator"
on public.events
for select
to authenticated
using (public.can_access_event(id));

drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_insert_all_authenticated" on public.events;
drop policy if exists "events_insert_owner" on public.events;
create policy "events_insert_owner"
on public.events
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_update_all_authenticated" on public.events;
drop policy if exists "events_update_by_owner_or_collaborator" on public.events;
create policy "events_update_by_owner_or_collaborator"
on public.events
for update
to authenticated
using (public.can_access_event(id))
with check (public.can_access_event(id));

drop policy if exists "events_delete_own" on public.events;
drop policy if exists "events_delete_all_authenticated" on public.events;
drop policy if exists "events_delete_owner" on public.events;
create policy "events_delete_owner"
on public.events
for delete
to authenticated
using (created_by = auth.uid());

drop policy if exists "event_collaborators_select_accessible" on public.event_collaborators;
create policy "event_collaborators_select_accessible"
on public.event_collaborators
for select
to authenticated
using (public.owns_event(event_id) or lower(email) = public.current_user_email());

drop policy if exists "event_collaborators_insert_owner" on public.event_collaborators;
create policy "event_collaborators_insert_owner"
on public.event_collaborators
for insert
to authenticated
with check (public.owns_event(event_id));

drop policy if exists "event_collaborators_delete_owner" on public.event_collaborators;
create policy "event_collaborators_delete_owner"
on public.event_collaborators
for delete
to authenticated
using (public.owns_event(event_id));

drop policy if exists "budget_categories_read_authenticated" on public.budget_categories;
create policy "budget_categories_read_authenticated"
on public.budget_categories
for select
to authenticated
using (true);

drop policy if exists "budget_categories_insert_authenticated" on public.budget_categories;
create policy "budget_categories_insert_authenticated"
on public.budget_categories
for insert
to authenticated
with check (true);

drop policy if exists "budget_categories_update_authenticated" on public.budget_categories;
create policy "budget_categories_update_authenticated"
on public.budget_categories
for update
to authenticated
using (true)
with check (true);

drop policy if exists "budget_categories_delete_authenticated" on public.budget_categories;
create policy "budget_categories_delete_authenticated"
on public.budget_categories
for delete
to authenticated
using (true);

drop policy if exists "budget_items_select_by_owner" on public.budget_items;
drop policy if exists "budget_items_select_all_authenticated" on public.budget_items;
drop policy if exists "budget_items_select_by_event_access" on public.budget_items;
create policy "budget_items_select_by_event_access"
on public.budget_items
for select
to authenticated
using (public.can_access_event(event_id));

drop policy if exists "budget_items_insert_by_owner" on public.budget_items;
drop policy if exists "budget_items_insert_all_authenticated" on public.budget_items;
drop policy if exists "budget_items_insert_by_event_access" on public.budget_items;
create policy "budget_items_insert_by_event_access"
on public.budget_items
for insert
to authenticated
with check (public.can_access_event(event_id));

drop policy if exists "budget_items_update_by_owner" on public.budget_items;
drop policy if exists "budget_items_update_all_authenticated" on public.budget_items;
drop policy if exists "budget_items_update_by_event_access" on public.budget_items;
create policy "budget_items_update_by_event_access"
on public.budget_items
for update
to authenticated
using (public.can_access_event(event_id))
with check (public.can_access_event(event_id));

drop policy if exists "budget_items_delete_by_owner" on public.budget_items;
drop policy if exists "budget_items_delete_all_authenticated" on public.budget_items;
drop policy if exists "budget_items_delete_by_event_access" on public.budget_items;
create policy "budget_items_delete_by_event_access"
on public.budget_items
for delete
to authenticated
using (public.can_access_event(event_id));

drop policy if exists "payments_select_by_owner" on public.payments;
drop policy if exists "payments_select_all_authenticated" on public.payments;
drop policy if exists "payments_select_by_event_access" on public.payments;
create policy "payments_select_by_event_access"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.budget_items
    where budget_items.id = payments.budget_item_id
      and public.can_access_event(budget_items.event_id)
  )
);

drop policy if exists "payments_insert_by_owner" on public.payments;
drop policy if exists "payments_insert_all_authenticated" on public.payments;
drop policy if exists "payments_insert_by_event_access" on public.payments;
create policy "payments_insert_by_event_access"
on public.payments
for insert
to authenticated
with check (
  exists (
    select 1
    from public.budget_items
    where budget_items.id = payments.budget_item_id
      and public.can_access_event(budget_items.event_id)
  )
);

drop policy if exists "payments_delete_by_owner" on public.payments;
drop policy if exists "payments_delete_all_authenticated" on public.payments;
drop policy if exists "payments_delete_by_event_access" on public.payments;
create policy "payments_delete_by_event_access"
on public.payments
for delete
to authenticated
using (
  exists (
    select 1
    from public.budget_items
    where budget_items.id = payments.budget_item_id
      and public.can_access_event(budget_items.event_id)
  )
);

insert into public.budget_categories (slug, name, sort_order)
values
  ('venue', 'Venue', 1),
  ('catering', 'Catering', 2),
  ('decoration', 'Decoration', 3),
  ('marketing', 'Marketing', 4),
  ('equipment', 'Equipment', 5),
  ('staffing', 'Staffing', 6),
  ('transport', 'Transport', 7),
  ('miscellaneous', 'Miscellaneous', 8)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order;
