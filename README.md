# The Kluang Line — wedding invitation site

A one-page invitation for **Lim Jet Sheng & Liew Mei Yean**, Saturday 13 March 2027 at
Jaya Homestay Kluang. Guests read the details and reserve their seats; the replies land in
Supabase.

Live at **https://jslim0112.github.io/wedding/** once deployed.

This README assumes you have used GitHub but do not write code. Nothing here needs you to
understand the code — every change you are likely to want is one line in one file.

---

## Two things to finish first

These are the only blanks left. The site works without them; it just looks unfinished.

1. **The Chinese characters for both names.** Open `src/config.js`, find the two `zh: ''`
   lines and paste the characters between the quotes. Leave them empty and the site simply
   shows the romanised names.
2. **The photos.** See [Adding your photos](#adding-your-photos) below. Until then every
   photo slot shows a labelled placeholder telling you which picture belongs there.

---

## What you need

- A **Supabase** account (free) — stores the RSVPs and the photos.
- This **GitHub** repo — `jslim0112/wedding`.
- **Node.js 22 or newer** if you want to preview the site on your own computer. You can skip
  this entirely and just edit files on github.com if you prefer.

---

## 1. Set up Supabase

### Create the table

Supabase dashboard → **SQL Editor** → New query. Open `supabase/schema.sql` in this repo,
paste the whole thing in, and click Run.

> As of the last check this had **not been run yet** — the site cannot save RSVPs until you
> do this.

### Understand the one thing that matters

That script creates the table and turns on Row Level Security with a **single** policy:
anyone may *insert* an RSVP, nobody may *read* the table.

Your Supabase "anon key" ends up visible in the website's source code. That is normal and by
design — it is a public key. What actually keeps your guests' phone numbers private is that
missing read policy. **If you ever add a `select` policy for `anon`, you publish every
guest's phone number to the internet.** Don't.

### Create the photo bucket

**Storage → New bucket →** name it `wedding-photos` → turn **Public** on → create.

Public is right here: these are photos you are showing to anyone with the link anyway, and a
public bucket means you can swap a photo without redeploying the site.

### Copy your keys

**Project Settings → API.** You need two values:

- **Project URL**
- the **anon** / **publishable** key

Never use the `service_role` key anywhere in this project. It bypasses all the protection
described above.

---

## 2. Run it on your computer

**Double-click `run-local.bat`.** That is the whole thing. It installs anything missing the
first time, starts the site, and opens your browser.

It can also do two other jobs, if you open a terminal in this folder:

| Command | What it does |
|---|---|
| `run-local.bat` | Live dev server. Every edit you save appears immediately. |
| `run-local.bat preview` | Builds the real site and serves exactly what gets deployed. Use this before pushing. |
| `run-local.bat check` | Checks Node and your Supabase keys, then exits without starting anything. |

**Testing on your actual phone.** The dev server prints two addresses. The **Network** one
(something like `http://192.168.0.2:5173/wedding/`) works from any phone on the same Wi-Fi.
Use it — most guests will open this on a phone, so that is the version worth checking.

Press **Ctrl+C** in the black window to stop the server, then answer `Y`.

<details>
<summary>Or run it by hand</summary>

```bash
npm install
cp .env.example .env.local     # then paste your two Supabase values into it
npm run dev
```

</details>

> A `.env` file already exists in this folder with your keys in it. That works too —
> Vite reads either. Both filenames are in `.gitignore`, so your keys never get committed.

Other commands:

- `npm run build` — produce the deployable site in `dist/`
- `npm run preview` — view exactly what will be deployed

---

## 3. Change any wedding detail

**Everything lives in `src/config.js`.** Names, date, time, venue, address, map pin,
parking notes, the story paragraphs, phone numbers, photo URLs, the RSVP deadline. Change the
venue at 11pm without touching a component.

A few worth knowing:

| What | Where in `config.js` | Note |
|---|---|---|
| Date & time | `wedding.startISO` / `endISO` | `+08:00` is Malaysia time. The countdown and the calendar file both read from here. |
| Displayed date text | `wedding.dateLong`, `dateShort`, `timeLabel` | Change these too — they are not generated from the ISO date. |
| Dress code | `venue.dressCode` | Currently empty, so that row is hidden. Type something and the row appears. |
| RSVP deadline | `rsvp.deadlineLabel` | Shown above the form. |
| Max seats per reply | `rsvp.maxPax` | Also capped at 10 by the database. |

---

## Adding your photos

1. Upload to Supabase **Storage → wedding-photos**.
2. Click a photo → **Get URL** → copy the public URL.
3. Paste it into the matching `src/config.js` slot:

```js
hero: {
  photo: { src: 'https://....supabase.co/storage/v1/object/public/wedding-photos/hero.jpg',
           alt: 'Jet Sheng and Mei Yean', slot: 'Hero photo — the two of you, landscape' },
},
```

The `slot` text is only the placeholder caption; you can ignore it once `src` is filled. Add
or remove entries in the `gallery` array freely — the grid adapts. Six to twelve reads best.

### The WhatsApp preview image

When someone shares the link on WhatsApp, the preview card looks for `public/og-image.jpg`,
sized 1200 × 630. It does not exist yet, so the preview currently shows the title and
description but no picture.

Easiest fix: crop one of your photos to 1200 × 630, name it `og-image.jpg`, and put it in the
`public/` folder. If you would rather have a typographic one, open
`tools/og-image-template.html` in Chrome — it has instructions at the top for exporting it.

---

## 4. Deploy

**Once**, set these up:

1. **Settings → Secrets and variables → Actions → New repository secret.** Add two:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. **Settings → Pages → Source: GitHub Actions.**

After that, every push to `main` rebuilds and republishes the site automatically. Watch it
run under the **Actions** tab; it takes about a minute.

> Using repo secrets does not hide these values from visitors — the build bakes them into the
> JavaScript either way. The benefit is that they stay out of your commit history. Your data
> is protected by Row Level Security, not by hiding the key.

---

## 5. Before you send the link to anyone

- [ ] Run `supabase/schema.sql` and confirm the `rsvps` table exists.
- [ ] Submit a test RSVP from your own phone. Check the row appears in **Table Editor**.
- [ ] Open the live site, press F12 for the console, and run:
      `await fetch('YOUR_PROJECT_URL/rest/v1/rsvps?select=*',{headers:{apikey:'YOUR_ANON_KEY'}}).then(r=>r.json())`
      It must come back as an empty list `[]`. **If it returns rows, stop and fix the policy
      before sending the link to anyone.**
- [ ] Upload the photos and paste the URLs into `config.js`.
- [ ] Send the link to yourself on WhatsApp. Check the preview card and that it loads on a phone.
- [ ] Tap **Open in Waze** on a real phone with Waze installed.
- [ ] Ask two relatives to try it before the real send — ideally one who is not comfortable
      with technology. That test finds more than any checklist.

---

## Reading the replies

**Table Editor → rsvps → Export → CSV.** There is no admin page and deliberately no way to
read the list from the website.

You will be holding names and mobile numbers that people trusted you with, which is personal
data under Malaysia's PDPA. Nothing onerous applies at this scale, but the sensible habits
are: don't paste the CSV into group chats, and delete the table once the thank-you messages
have gone out.

---

## If something goes wrong

**The site is a blank white page.**
`base` in `vite.config.js` must match the repo name — it is `'/wedding/'`. If you rename the
repo or add a custom domain, update it (a custom domain uses `'/'`).

**RSVPs are not saving.**
Check, in order: did you run `schema.sql`; are both repo secrets spelled exactly
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; did the Actions run succeed. The form tells
the guest what to do when a save fails and keeps everything they typed, so nobody has to
retype anything.

**The fonts look wrong.** They load from Google Fonts, so the first visit needs a connection.

**A photo does not appear.** The bucket must be **Public**, and the URL must be the public
one from *Get URL*.

---

## What's deliberately not here

Listed in case you want them later:

- A wishes wall — needs a second table, or a view exposing only name and message where a
  `show_publicly` flag is true. Never expose the `rsvps` table itself.
- Swapping the form for a "please WhatsApp us instead" message after the RSVP deadline.
- A Bahasa Malaysia / Chinese language toggle.
- A `?name=` link parameter so each WhatsApp invite opens already greeting that guest.

---

## How it is put together

Vite + React + Tailwind CSS v4, deployed as plain static files. No backend of its own.

```
src/
  config.js              every wedding detail — start here
  index.css              colours and fonts (the @theme block)
  lib/supabase.js        database client; insert only, never read
  lib/format.js          phone normalising, the .ics file, map links, countdown maths
  components/            one file per section of the page
supabase/schema.sql      the database setup
tools/                   og-image template; not part of the site
```

Design notes, if you ever hand this to someone else: the concept is the invitation as a
printed railway travel document, after Kluang's 1938 station kopitiam and the colour-coded
card tickets Malayan Railway used to print. Fraunces for the names, Karla for reading,
Courier Prime for anything that behaves like printed ticket data. The red `--seal` colour is
reserved for the confirmation stamp and is used nowhere else — that restraint is what makes
it land.
