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

---

## Adding the music

A small player floats in the bottom-left corner of every screen with one button: play and
pause. The song starts by itself — see the note on autoplay below. Until you add a song the
player does not render at all.

1. Upload the file to Supabase **Storage → wedding-photos** — the same bucket as the photos.
   MP3 is the safe choice. Keep it under about 6 MB, or guests on mobile data will wait.
2. Put the **file name** into `music.path` in `src/config.js`, and name the song:

```js
music: {
  bucket: 'wedding-photos',
  path: 'our-song.mp3',
  title: 'Can’t Help Falling in Love',
  artist: 'Elvis Presley',
  volume: 0.55,
  autoplay: true,
},
```

No URL to paste — the public URL is worked out from the bucket and the file name. If the
song lives somewhere else entirely, put its full URL in `src` instead and it wins.

`volume` is 0 to 1; background music should sit under conversation, so 0.5–0.6 is about
right.

### Why there is an "Open invitation" screen

Guests land on a ticket with your names on it and one button. Tapping it opens the page and
starts the music.

That screen exists for a reason worth knowing, because it is the only way the music plays
for everyone. **A web page is not allowed to play sound until the visitor has interacted
with it** — Chrome, Safari and Firefox all enforce this, and no website can opt out. Worse,
**scrolling deliberately does not count as interacting.** A guest can scroll your entire
invitation top to bottom and the browser will still refuse to let it make a sound.

So the site asks for one tap and gives that tap a meaning. The music starts inside it.

Turn the screen off with `entryScreen: false` and the page opens directly, but then the
music only starts if and when a guest happens to tap something — and guests who only scroll
never hear it. `autoplay: true` still tries on load first, which succeeds on a return visit
where the browser has already learned to trust the site.

Once a guest presses pause, it stays paused for the rest of their visit.

Set `autoplay: false` if you would rather the page opened silent and let guests press play
themselves.

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

**The live site is blank, and the browser console shows 404s for `main.jsx` and
`%BASE_URL%favicon.svg`.**

This is the common one. Those two names only exist in the *uncompiled* source, so seeing them
means GitHub is publishing your repo folder as-is instead of the built site.

Fix: **Settings → Pages → Build and deployment → Source → GitHub Actions** (not "Deploy from a
branch"). Then **Actions** tab → re-run the latest workflow, or just push any commit. Give it
about a minute and hard-refresh with Ctrl+Shift+R.

**The site is blank but the asset paths look right.**
`base` in `vite.config.js` must match the repo name — it is `'/wedding/'`. If you rename the
repo or add a custom domain, update it (a custom domain uses `'/'`).

**RSVPs are not saving.**
Check, in order: did you run `schema.sql`; are both repo secrets spelled exactly
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; did the Actions run succeed. The form tells
the guest what to do when a save fails and keeps everything they typed, so nobody has to
retype anything.

**The fonts look wrong.** They load from Google Fonts, so the first visit needs a connection.

**The music does not play on my phone.** Check the silent switch first — on an iPhone, the
ring/silent switch mutes this kind of audio entirely, so the player will show "Now playing"
with no sound coming out. Then check the volume. If the label still reads "Tap to play"
after you have touched the screen, the file itself is probably not loading: open the URL in
`music.src` (or the bucket file in `music.path`) directly in the phone's browser and see
whether it plays there.

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

Design notes, if you ever hand this to someone else. The structure is still a ticket — a
perforated stub, notches, a stamp on submit — but the palette is wine and blush on warm
ivory rather than the railway colours it started from. All seven colours are `@theme` tokens
at the top of `src/index.css`; change one there and it changes everywhere.

Two typefaces. **Alex Brush** for names and section headings only, and **Open Sans** for
everything else including the letterspaced uppercase labels. Two things to respect if you
edit the type:

- Alex Brush exists in **one weight**. Asking for bold makes the browser fake it and the
  script smears. Keep display text at weight 400.
- Never set the script in uppercase or with negative letter-spacing — caps are near
  unreadable in a script, and tight tracking collides the joins.

Chinese characters render in Noto Serif SC via the `.zh` class, because Alex Brush has no
CJK glyphs at all.
