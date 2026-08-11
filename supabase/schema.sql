-- Run this once in the Supabase SQL Editor.
-- It creates the RSVP table and locks it down.

create table public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text    not null check (char_length(trim(full_name)) between 2 and 100),
  phone       text    not null check (char_length(trim(phone)) between 7 and 20),
  attending   boolean not null,
  pax         int     not null default 1 check (pax between 0 and 10),
  guest_names text    check (char_length(guest_names) <= 500),
  dietary     text    check (char_length(dietary) <= 300),
  side        text    check (side in ('bride','groom','both')),
  message     text    check (char_length(message) <= 1000)
);

alter table public.rsvps enable row level security;

create policy "anyone can submit an rsvp"
  on public.rsvps for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------------
-- The part people get wrong.
--
-- There is exactly ONE policy above and it is INSERT only. No select policy
-- exists, so nobody can read this table from a browser - even though the anon
-- key is sitting in the page source where anyone can find it. That key is
-- designed to be public. Row Level Security is the lock, not the key.
--
-- If you add a select policy for anon to make something work, you have just
-- published every guest's phone number to the internet. Don't.
--
-- Read the list here instead: Table Editor -> rsvps -> Export -> CSV.
-- ---------------------------------------------------------------------------
