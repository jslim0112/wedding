/* ---------------------------------------------------------------------------
   Every wedding detail lives here.
   Change the venue at 11pm without opening a single component.

   Two things are still blank and marked TODO: the Chinese characters for both
   names, and the photo URLs. The site renders correctly with them blank -
   names fall back to romanised only, and photos show a labelled placeholder
   panel telling you which picture belongs in that slot.
--------------------------------------------------------------------------- */

export const config = {
  site: {
    // Used for absolute links. Keep the trailing slash.
    url: 'https://jslim0112.github.io/wedding/',
  },

  couple: {
    // Order here is the order they appear on the page.
    groom: {
      first: 'Jason',
      full: 'Jason',
      zh: '林杰圣', // TODO: paste the Chinese characters, e.g. '林哲昇'
    },
    bride: {
      first: 'Mei Yean',
      full: 'Mei Yean',
      zh: '刘美宴', // TODO: paste the Chinese characters, e.g. '廖美燕'
    },
  },

  wedding: {
    // The source of truth for the countdown and the calendar file.
    // Malaysia is UTC+8, so the offset is baked in and the countdown is
    // correct for a guest opening this from anywhere in the world.
    startISO: '2027-03-13T19:00:00+08:00',
    endISO: '2027-03-13T22:00:00+08:00',

    dayLabel: 'Saturday',
    dateLong: '13 March 2027',
    dateShort: '13.03.2027',
    // Slashed short form, used on the RSVP confirmation stub.
    dateNumeric: '13/03/2027',
    timeLabel: '7:00 PM — 10:00 PM',
    // Short form for the narrow ticket-card column on a phone.
    timeCompact: '7 – 10 PM',
    // Just the start, for lines that only need "when to turn up".
    timeStart: '7:00 p.m.',
    place: 'Kluang · Johor',
    // The town on its own, for sentences that read badly with the state.
    city: 'Kluang',
  },

  venue: {
    name: 'Jaya Homestay Kluang',
    name_zh: '居銮家雅民宿',
    address:
      'No. 9 Lorong 2, Jalan Sri Damai 1, Taman Sri Damai, 86000 Kluang, Johor',
    lat: 2.0522974,
    lng: 103.3280314,

    // Leave dressCode as an empty string to hide that row entirely.
    dressCode: '',

    parking:
      'Parking is provided',
    parking_zh: '民宿旁边有提供停车位',
  },

  rsvp: {
    deadlineISO: '2026-12-31',
    deadlineLabel: '31/12/2026',
    maxPax: 20,
  },

  // First contact is the one shown in error messages.
  contacts: [
    { name: 'Jason', phone: '', display: '' },
    { name: 'Mei Yean', phone: '', display: '' },
  ],

  hero: {
    // TODO: paste the Supabase Storage public URL for the main photo.
    photo: { src: 'https://jdenqrfjrdvgtpfqimts.supabase.co/storage/v1/object/sign/Wedding%20bucket/cover_photo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80N2NkNTRjMi01YTEzLTQyNDEtYjFiZC1mNTIxZTcxNjBiMWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWRkaW5nIGJ1Y2tldC9jb3Zlcl9waG90by5qcGVnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4Njc5ODM5MywiZXhwIjoxODE4MzM0MzkzfQ.FWozQLwgnQUflKO_uarltn_1Fco5Ab3CmUWOj7zb8c8', alt: 'Jason and Mei Yean', slot: 'Hero photo — the two of you, landscape' },
  },

  story: {
    title: 'How we got here',
    paragraphs: [
      'We met in Johor, kept missing each other by a few weeks, and then didn’t. Most of what followed happened over long drives, late suppers and a lot of ordinary evenings that turned out to be the good ones.',
      'Kluang is where Jet Sheng’s family is from. It is a small town built around a railway station, and it is the place we keep coming back to — for the coffee, for the quiet, and for the people who are already there.',
      'So that is where we are getting married. We would like you to come.',
    ],
    photos: [
      // TODO: paste Supabase Storage public URLs.
      { src: '', alt: 'Jason and Mei Yean', slot: 'Story photo 1 — portrait works best' },
      { src: '', alt: 'Jason and Mei Yean', slot: 'Story photo 2 — portrait works best' },
    ],
  },

  // 6 to 12 photos reads best. TODO: paste Supabase Storage public URLs.
  gallery: [
    { src: '', alt: '', slot: 'Gallery 1' },
    { src: '', alt: '', slot: 'Gallery 2' },
    { src: '', alt: '', slot: 'Gallery 3' },
    { src: '', alt: '', slot: 'Gallery 4' },
    { src: '', alt: '', slot: 'Gallery 5' },
    { src: '', alt: '', slot: 'Gallery 6' },
  ],

  /* The floating music player, bottom-left of every screen.
     Leave `src` and `path` both blank and the player does not render at all.

     Two ways to point it at the song, in this order of preference:
       path — the file name inside the Supabase Storage bucket named in
              `bucket`, e.g. 'our-song.mp3'. The public URL is worked out for
              you, so you never paste a long URL.
       src  — a full URL, if the file lives somewhere else entirely.

     MP3 is the safe format. m4a and ogg work on most phones; wav is enormous.
     Keep it under about 6 MB or guests on mobile data will wait for it. */
  music: {
    bucket: 'wedding-photos',
    path: 'its_you_opening_cut.mp3',
    src: 'https://jdenqrfjrdvgtpfqimts.supabase.co/storage/v1/object/sign/Wedding%20bucket/its_you_opening_cut.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80N2NkNTRjMi01YTEzLTQyNDEtYjFiZC1mNTIxZTcxNjBiMWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJXZWRkaW5nIGJ1Y2tldC9pdHNfeW91X29wZW5pbmdfY3V0Lm1wMyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODY2MzExODUsImV4cCI6MTgxODE2NzE4NX0.5X9xRyOIg2_ANZ3hM9W-olbKkkxgbWbs0MTtr98OX7o',
    title: 'Our song',
    artist: 'Henry',
    // 0 to 1. Background music wants to sit under conversation, not over it.
    volume: 0.55,
    // Start the song as soon as the page opens. Browsers block unprompted
    // sound on a first visit, so when that happens the player falls back to
    // starting on the guest's first tap or key press anywhere on the page —
    // which browsers do allow. Either way it plays without them pressing
    // anything. Once a guest presses pause it stays paused.
    // Set to false to have the page open silent until play is pressed.
    autoplay: true,

    // The "Open invitation" screen that greets a guest before the page.
    // It exists because browsers will not play sound until a guest taps
    // something - and scrolling deliberately does not count. This turns that
    // required tap into the opening of the invitation, so the music starts
    // for everyone instead of only for guests who happen to tap.
    // Set to false to open straight onto the page.
    entryScreen: true,
  },

  footer: {
    thanks:
      'Thank you for making the trip. It is a long way to come for one evening, and it means a great deal that you would.',
    whatsappPrefill: 'Hi! I have a question about the wedding on 13 March.',
  },
}

export default config
