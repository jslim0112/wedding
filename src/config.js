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
      first: 'Jet Sheng',
      full: 'Lim Jet Sheng',
      zh: '', // TODO: paste the Chinese characters, e.g. '林哲昇'
    },
    bride: {
      first: 'Mei Yean',
      full: 'Liew Mei Yean',
      zh: '', // TODO: paste the Chinese characters, e.g. '廖美燕'
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
    timeLabel: '7:00 PM — 10:00 PM',
    // Short form for the narrow ticket-card column on a phone.
    timeCompact: '7 – 10 PM',
    place: 'Kluang · Johor',
  },

  venue: {
    name: 'Jaya Homestay Kluang',
    address:
      'No. 9 Lorong 2, Jalan Sri Damai 1, Taman Sri Damai, 86000 Kluang, Johor',
    lat: 2.0522974,
    lng: 103.3280314,

    // Leave dressCode as an empty string to hide that row entirely.
    dressCode: '',

    parking:
      'Free street parking along Lorong 2 and the surrounding lanes. It is a quiet residential street, so please park considerately and leave the neighbours’ driveways clear. Come 15 minutes early if you would rather not walk far.',
  },

  rsvp: {
    deadlineISO: '2026-12-31',
    deadlineLabel: '31 December 2026',
    maxPax: 10,
    dietaryChips: ['Halal', 'Vegetarian', 'No beef'],
  },

  // First contact is the one shown in error messages.
  contacts: [
    { name: 'Jason', phone: '60106611189', display: '010-661 1189' },
    { name: 'Mei Yean', phone: '60169406935', display: '016-940 6935' },
  ],

  hero: {
    // TODO: paste the Supabase Storage public URL for the main photo.
    photo: { src: '', alt: 'Jet Sheng and Mei Yean', slot: 'Hero photo — the two of you, landscape' },
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
      { src: '', alt: 'Jet Sheng and Mei Yean', slot: 'Story photo 1 — portrait works best' },
      { src: '', alt: 'Jet Sheng and Mei Yean', slot: 'Story photo 2 — portrait works best' },
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

  footer: {
    thanks:
      'Thank you for making the trip. It is a long way to come for one evening, and it means a great deal that you would.',
    whatsappPrefill: 'Hi! I have a question about the wedding on 13 March.',
  },
}

export default config
