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

create or replace function public.set_created_by_to_current_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.created_by = auth.uid();
  end if;

  return new;
end;
$$;

alter table public.events
alter column created_by set default auth.uid();

alter table public.budget_items
alter column created_by set default auth.uid();

alter table public.payments
alter column created_by set default auth.uid();

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do update
set email = excluded.email;

drop trigger if exists set_events_created_by on public.events;
create trigger set_events_created_by
before insert on public.events
for each row execute procedure public.set_created_by_to_current_user();

drop trigger if exists set_budget_items_created_by on public.budget_items;
create trigger set_budget_items_created_by
before insert on public.budget_items
for each row execute procedure public.set_created_by_to_current_user();

drop trigger if exists set_payments_created_by on public.payments;
create trigger set_payments_created_by
before insert on public.payments
for each row execute procedure public.set_created_by_to_current_user();

alter table public.event_collaborators enable row level security;

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
with check (auth.uid() is not null);

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
