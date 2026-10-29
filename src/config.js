import heroPhoto from './assets/hero.jpg'
import songFile from './assets/its-you.mp3'
import photo_2026_rom from './assets/gallery/2026_rom.jpg'
import photo_2026_krabi from './assets/gallery/2026_krabi.jpg'
import photo_2026_bangkok from './assets/gallery/2026_bangkok.jpg'
import photo_2025_alin_concert from './assets/gallery/2025_alin_concert.jpg'
import photo_2025_guangzhou from './assets/gallery/2025_guangzhou.jpg'
import photo_2025_phuket from './assets/gallery/2025_phuket.jpg'
import photo_2025_cameron from './assets/gallery/2025_cameron.jpg'
import photo_2024_ipoh from './assets/gallery/2024_ipoh.jpg'
import photo_2024_taiwan from './assets/gallery/2024_taiwan.jpg'
import photo_2024_baking from './assets/gallery/2024_baking.jpg'
import photo_2023 from './assets/gallery/2023.jpg'
import photo_2022_my_convo from './assets/gallery/2022_my_convo.jpg'
import photo_2022_js_convo from './assets/gallery/2022_js_convo.jpg'
import photo_2021 from './assets/gallery/2021.jpg'
import photo_2020 from './assets/gallery/2020.jpg'

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
    // 6:30 PM is when guests check in — the 5:00 PM tea ceremony is a family
    // affair and appears in the agenda only, so it is deliberately not the
    // time the countdown runs to or the calendar file books.
    startISO: '2027-03-13T18:30:00+08:00',
    endISO: '2027-03-13T22:00:00+08:00',

    dayLabel: 'Saturday',
    dayLabel_zh: '星期六',
    dateLong: '13 March 2027',
    dateShort: '13.03.2027',
    // Slashed short form, used on the RSVP confirmation stub.
    dateNumeric: '13/03/2027',
    timeLabel: '6:30 PM — 10:00 PM',
    // The same in Chinese, under the time on the details card. Leave it
    // blank and that line is not shown.
    timeLabel_zh: '晚上 6:30 至 10:00',
    // Short form for the narrow ticket-card column on a phone.
    timeCompact: '6.30 – 10 PM',
    // Just the start, for lines that only need "when to turn up".
    timeStart: '6:30 p.m.',
    place: 'Kluang · Johor',
    // The town on its own, for sentences that read badly with the state.
    city: 'Kluang',
    city_zh: '居銮',
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

  /* The run of the evening, printed as a line of stops.
     Times are shown exactly as typed here — nothing is parsed — so write them
     however they should read. Add or remove stops and the timeline follows.

     `icon` picks the drawing above each stop. One of: camera, ticket, tea,
     rings, arch, plate, cutlery, cheers, guitar, music, beer, fireworks,
     hearts. Leave it out and the stop simply has no picture.

     Stops alternate left and right of the ribbon in the order written here,
     so adding or removing one re-flows the whole timeline.
     Leave `items` empty and the section disappears from the page. */
  agenda: {
    items: [
      { time: '5:00 PM', title: 'Tea ceremony', title_zh: '长辈敬茶', icon: 'tea' },
      { time: '6:30 PM', title: 'Check-in & photo session', title_zh: '签到 & 拍照留念', icon: 'camera' },
      { time: '7:00 PM', title: 'Wedding buffet', title_zh: '自助式晚餐', icon: 'cutlery' },
      {
        time: '8:30 PM',
        title: 'Toasts, lucky draw & fireworks',
        title_zh: '敬酒环节、幸运抽奖、烟花表演',
        icon: 'fireworks',
      },
      { time: '9:00 PM', title: 'Free & easy', title_zh: '自由活动', icon: 'cheers' },
    ],

    // An optional line under the timeline. Both blank and it does not render.
    // e.g. note: 'Capture the love, share the joy — tag us @jason @meiyean'
    note: '',
    note_zh: '',
  },

  rsvp: {
    deadlineISO: '2026-12-30',
    deadlineLabel: '30/12/2026',
    maxPax: 30,
  },

  // First contact is the one shown in error messages.
  contacts: [
    { name: 'Jason', phone: '', display: '' },
    { name: 'Mei Yean', phone: '', display: '' },
  ],

  hero: {
    // TODO: paste the Supabase Storage public URL for the main photo.
    photo: { src: heroPhoto, alt: 'Jason and Mei Yean', slot: 'Hero photo — the two of you, landscape' },
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

  /* The gallery: a pile of polaroids, flicked through one at a time in the
     order written here — newest first. Under the pile, each year is a station
     on a little railway, and a train rides along it with the photos.

     `caption` is written on the polaroid, and `caption_zh` under it — write
     either, both, or neither.

     Put the year on the caption's first line and the event after a \n, as in
     'YEAR 2026\nOur ROM'. The polaroid then prints "Our ROM" with "2026"
     beside it, and the photo's year becomes a station on the railway. A
     caption with no year on its first line is printed whole, and that photo
     leaves the train where the photo before it did.
     TODO: paste Supabase Storage public URLs and write the captions. */
  gallery: [
    { src: photo_2026_rom, alt: '', slot: 'Gallery 8', caption: 'YEAR 2026\nOur ROM', caption_zh: '' },
    { src: photo_2026_krabi, alt: '', slot: 'Gallery 1', caption: 'YEAR 2026\nKrabi Trip', caption_zh: '' },
    { src: photo_2026_bangkok, alt: '', slot: 'Gallery 2', caption: 'YEAR 2026\nBangkok Trip', caption_zh: '' },
    { src: photo_2025_alin_concert, alt: '', slot: 'Gallery 3', caption: 'YEAR 2025\nA-Lin Concert', caption_zh: '' },
    { src: photo_2025_guangzhou, alt: '', slot: 'Gallery 4', caption: 'YEAR 2025\nGuangzhou Trip', caption_zh: '' },
    { src: photo_2025_phuket, alt: '', slot: 'Gallery 5', caption: 'YEAR 2025\nPhuket Trip', caption_zh: '' },
    { src: photo_2025_cameron, alt: '', slot: 'Gallery 6', caption: 'YEAR 2025\nCameron Trip', caption_zh: '' },
    { src: photo_2024_ipoh, alt: '', slot: 'Gallery 7', caption: 'YEAR 2024\nIpoh Trip ', caption_zh: '' },
    { src: photo_2024_taiwan, alt: '', slot: 'Gallery 8', caption: 'YEAR 2024\nTaiwan Trip ', caption_zh: '' },
    { src: photo_2024_baking, alt: '', slot: 'Gallery 9', caption: 'YEAR 2024\nBaking Day', caption_zh: '' },
    { src: photo_2023, alt: '', slot: 'Gallery 10', caption: 'YEAR 2023\nValentine\'s Day ', caption_zh: '' },
    { src: photo_2022_my_convo, alt: '', slot: 'Gallery 11', caption: 'YEAR 2022\nMeiyean\'s Convo', caption_zh: '' },
    { src: photo_2022_js_convo, alt: '', slot: 'Gallery 12', caption: 'YEAR 2022\nJason\'s Convo ', caption_zh: '' },
    { src: photo_2021, alt: '', slot: 'Gallery 13', caption: 'YEAR 2021\nValentine\'s Day ', caption_zh: '' },
    { src: photo_2020, alt: '', slot: 'Gallery 14', caption: 'YEAR 2020\nFirst Dating', caption_zh: '' },
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
    path: '',
    src: songFile,
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

  /* The ornaments around the page. Each one switches off on its own — set it
     to false and it is simply not drawn. Anything that moves also holds still
     (or stays away) for a guest whose phone asks for reduced motion. */
  decorations: {
    // A bouquet of balloons goes up as the invitation opens, then a stray one
    // drifts up now and then, along the edges on a phone and in the side
    // margins on a wide screen. A tap pops one; they pop by themselves near
    // the top.
    balloons: true,
    // Roughly how often a stray balloon goes up after the bouquet, in seconds.
    // Never more than three strays are in the air at once.
    balloonEverySeconds: 3,
    // Two 囍 lanterns and a string of fairy lights across the top of the hero.
    lanterns: true,
    // Plum blossom on the calendar card, and petals drifting down the
    // countdown section.
    blossoms: true,
    // The small line–diamond–heart rule between sections.
    dividers: true,
    // Confetti and a few balloons when a guest says they are coming, and
    // again whenever they tap the stamp. A "can't make it" reply stays quiet.
    rsvpCelebration: true,
    // Faint line drawings in the empty margins either side of the page. Wide
    // screens only — a phone has no margins to fill.
    margins: true,
  },

  footer: {
    thanks:
      'THANK YOU & SEE YOU SOON!',
    whatsappPrefill: 'Hi! I have a question about the wedding on 13 March.',
  },
}

export default config
