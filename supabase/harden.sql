-- Run this once in the Supabase SQL Editor, on the table you already have.
--
-- Why it exists: the anon key sits in the page source, so anyone can skip the
-- form and POST straight to the table. The checks in Rsvp.jsx are there to help
-- a guest, not to protect the data. These constraints are what protect it, and
-- they run inside the database whatever sends the row.
--
-- SQL injection is not possible through the form either way: supabase-js sends
-- each value as JSON to PostgREST, which passes it to Postgres as a bound
-- parameter. Nothing is ever joined into a SQL string, so there is nothing to
-- escape - and escaping on top would only mangle names like O'Brien.
--
-- NOT VALID means "enforce on every new row, don't re-check old ones", so a
-- row saved before today can never make this script fail.

alter table public.rsvps
  drop constraint if exists rsvps_full_name_check,
  drop constraint if exists rsvps_phone_check,
  drop constraint if exists rsvps_adults_check,
  drop constraint if exists rsvps_children_check,
  drop constraint if exists rsvps_pax_check,
  drop constraint if exists rsvps_seats_check;

alter table public.rsvps
  -- 2-100 characters, already trimmed, and none of the characters that do harm
  -- later: markup < > & ", code ` ; = $ | { } \, control characters, and a
  -- leading = + - @ (a spreadsheet runs those as formulas when you export the
  -- list to CSV and open it).
  add constraint rsvps_full_name_check check (
    char_length(full_name) between 2 and 100
    and full_name = btrim(full_name)
    and full_name !~ '^[=+@-]'
    and full_name !~ '[<>&"`;=$|{}\\\x01-\x1f\x7f]'
  ) not valid,

  -- The form stores the number as 60 followed by 8-10 digits, nothing else.
  add constraint rsvps_phone_check check (phone ~ '^60[0-9]{8,10}$') not valid,

  -- 30 matches rsvp.maxPax in config.js. It was 20 here, so a party of 21-30
  -- passed the page and was refused by the table.
  add constraint rsvps_adults_check   check (adults   between 0 and 30) not valid,
  add constraint rsvps_children_check check (children between 0 and 30) not valid,
  add constraint rsvps_pax_check      check (pax = adults + children and pax between 0 and 30) not valid,

  -- Coming means at least one adult; not coming means no seats at all.
  add constraint rsvps_seats_check check (
    (attending and adults >= 1) or (not attending and adults = 0 and children = 0)
  ) not valid;

-- Defence in depth: whatever policies exist, the anon role can only ever insert.
revoke all on public.rsvps from anon;
grant insert on public.rsvps to anon;

-- ---------------------------------------------------------------------------
-- Check it worked. Each of these should fail with a "violates check
-- constraint" error; run them one at a time in the SQL Editor:
--
--   insert into public.rsvps (full_name, phone, attending, adults, children, pax)
--   values ('=cmd|calc', '60123456789', true, 1, 0, 1);
--
--   insert into public.rsvps (full_name, phone, attending, adults, children, pax)
--   values ('<script>x</script>', '60123456789', true, 1, 0, 1);
--
--   insert into public.rsvps (full_name, phone, attending, adults, children, pax)
--   values ('Tan Mei Yean', '012-345 6789', true, 1, 0, 1);
--
--   insert into public.rsvps (full_name, phone, attending, adults, children, pax)
--   values ('Tan Mei Yean', '60123456789', true, 2, 1, 5);
--
-- And this one should save (then delete it from the Table Editor):
--
--   insert into public.rsvps (full_name, phone, attending, adults, children, pax)
--   values ('Test O''Brien', '60123456789', true, 2, 1, 3);
-- ---------------------------------------------------------------------------
