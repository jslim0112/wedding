-- Run this once in the Supabase SQL Editor.
-- It creates the RSVP table and locks it down.

create table public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text    not null check (char_length(trim(full_name)) between 2 and 100),
  phone       text    not null check (char_length(trim(phone)) between 7 and 20),
  attending   boolean not null,
  -- No default. The form makes this a required answer, so a row arriving
  -- without one is a bug worth failing loudly rather than quietly seating 1.
  pax         int     not null check (pax between 0 and 10)
);

alter table public.rsvps enable row level security;

create policy "anyone can submit an rsvp"
  on public.rsvps for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------------
-- Already ran an older version of this file?
--
-- The table used to carry side, message, guest_names and dietary columns. The
-- form no longer collects any of them. Run this once to bring an existing
-- table into line - it keeps every row you have already collected:
--
--   alter table public.rsvps
--     drop column if exists side,
--     drop column if exists message,
--     drop column if exists guest_names,
--     drop column if exists dietary,
--     alter column pax drop default;
--
-- Export the table to CSV first if you want to keep what those columns hold.
-- ---------------------------------------------------------------------------

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
