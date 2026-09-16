-- Run this once in the Supabase SQL Editor.
-- It creates the RSVP table and locks it down.

create table public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text    not null check (char_length(trim(full_name)) between 2 and 100),
  phone       text    not null check (char_length(trim(phone)) between 7 and 20),
  attending   boolean not null,
  -- The form asks for these two separately - the caterer counts a child's seat
  -- differently from an adult's. A guest who cannot come sends 0 and 0.
  adults      int     not null check (adults   between 0 and 20),
  children    int     not null check (children between 0 and 20),
  -- No default. The form makes this a required answer, so a row arriving
  -- without one is a bug worth failing loudly rather than quietly seating 1.
  -- Kept as the total of the two above: it is what the seating plan is counted
  -- from, and it keeps rows collected before the split comparable with the
  -- ones after it.
  pax         int     not null check (pax between 0 and 20)
);

alter table public.rsvps enable row level security;

create policy "anyone can submit an rsvp"
  on public.rsvps for insert
  to anon
  with check (true);

-- ---------------------------------------------------------------------------
-- Already ran an older version of this file?
--
-- RUN THIS BEFORE THE SPLIT FORM GOES LIVE. Until these columns exist, every
-- RSVP fails with "Couldn't save your RSVP" - the insert names adults and
-- children, and Postgres rejects a column it does not have.
--
-- Existing rows keep their pax and are backfilled as all-adults, which is what
-- they meant when the form only asked for a total:
--
--   alter table public.rsvps
--     add column if not exists adults   int not null default 0,
--     add column if not exists children int not null default 0;
--
--   update public.rsvps set adults = pax where adults = 0 and pax > 0;
--
--   alter table public.rsvps
--     alter column adults   drop default,
--     alter column children drop default;
--
-- The pax ceiling used to be 10 while the form allowed up to 20, so a party of
-- 11 was accepted by the page and then refused by the table. Lift it to match
-- config.js (rsvp.maxPax) and constrain the two new columns the same way:
--
--   alter table public.rsvps
--     drop constraint if exists rsvps_pax_check,
--     add  constraint rsvps_pax_check      check (pax      between 0 and 20),
--     add  constraint rsvps_adults_check   check (adults   between 0 and 20),
--     add  constraint rsvps_children_check check (children between 0 and 20);
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
