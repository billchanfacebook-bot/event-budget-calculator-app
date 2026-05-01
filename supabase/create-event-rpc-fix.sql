create or replace function public.create_event_for_current_user(
  p_name text,
  p_event_date date default null,
  p_location text default null,
  p_attendee_count integer default 0,
  p_status text default 'draft',
  p_currency text default 'HKD',
  p_budget_cap numeric default 0,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_event_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.profiles (id, email)
  values (current_user_id, lower(coalesce(auth.jwt() ->> 'email', '')))
  on conflict (id) do update
  set email = excluded.email;

  insert into public.events (
    name,
    event_date,
    location,
    attendee_count,
    status,
    currency,
    budget_cap,
    notes,
    created_by
  )
  values (
    p_name,
    p_event_date,
    nullif(trim(coalesce(p_location, '')), ''),
    greatest(coalesce(p_attendee_count, 0), 0),
    coalesce(p_status, 'draft'),
    upper(coalesce(p_currency, 'HKD')),
    greatest(coalesce(p_budget_cap, 0), 0),
    nullif(trim(coalesce(p_notes, '')), ''),
    current_user_id
  )
  returning id into new_event_id;

  return new_event_id;
end;
$$;

grant execute on function public.create_event_for_current_user(
  text,
  date,
  text,
  integer,
  text,
  text,
  numeric,
  text
) to authenticated;
