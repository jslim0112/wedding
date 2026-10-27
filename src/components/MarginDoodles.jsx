import { config } from '../config'
import { XI } from './ui/XiPattern'

/* ---------------------------------------------------------------------------
   Faint line drawings in the empty margins either side of the document
   column on a wide screen - rings, doves, a cake, glasses, lanterns, 囍,
   plum blossom - the way someone doodles round the edge of a card.

   Kopi line at low strength, with the odd touch of seal red, so they read as
   part of the paper and never as something to look at instead of the page.
   They scroll with the page, scattered down its length, and each bobs very
   slightly on its own clock.

   Desktop only, like the route line: on anything narrower there is no margin
   to fill. Every drawing is placed from the column's edge outwards and kept
   inside the narrowest margin it can meet (172px, at 1024px wide), so none is
   ever cut off by the edge of the screen.
--------------------------------------------------------------------------- */

const COLUMN_HALF = 340

/* The plum sprig's two flowers, five petals each: [cx, cy, r]. */
const PLUM_FLOWERS = [
  [66, 32, 3.2], [69.8, 34.8, 3.2], [68.4, 39.2, 3.2], [63.6, 39.2, 3.2], [62.2, 34.8, 3.2],
  [38, 8, 2.8], [41.3, 10.4, 2.8], [40.1, 14.2, 2.8], [35.9, 14.2, 2.8], [34.7, 10.4, 2.8],
]

/* Outline drawings, each in its own box. Stroked in the doodle's colour unless
   a part says otherwise. */
const DRAWINGS = {
  rings: {
    box: [0, 0, 48, 48],
    art: (
      <>
        <circle cx="18" cy="30" r="10" />
        <circle cx="30" cy="24" r="10" />
        <path d="M30 8.5l4.2 4.6-4.2 4.6-4.2-4.6zM30 4v2M36 6.5l-1.4 1.4M24 6.5l1.4 1.4" />
      </>
    ),
  },
  dove: {
    box: [0, 0, 48, 48],
    art: (
      <>
        <path d="M6 30C12 22 24 20 32 24C36 26 40 24 42 20C43 26 39 31 33 33C25 37 12 36 6 30Z" />
        <path d="M18 26C19 16 27 9 37 8C33 14 29 20 25 25M42 20L45.5 19M33 33C34 37 36 39 39 40" />
        <circle cx="39.5" cy="21" r="0.6" />
        <path d="M10 13.2s-4-2.4-4-5.1A2.2 2.2 0 0 1 10 6.3a2.2 2.2 0 0 1 4 1.8c0 2.7-4 5.1-4 5.1z" className="stroke-seal" />
      </>
    ),
  },
  cake: {
    box: [0, 0, 48, 48],
    art: (
      <>
        <path d="M10 41h28M13 41V32h22v9M16 32v-7h16v7M19.5 25v-6h9v6" />
        <path d="M13 36c3 1.6 5-1.6 7.3 0s4.7 1.6 7.4 0 4.7-1.6 7.3 0" />
        <path d="M24 15.5s-3.5-2.1-3.5-4.5A1.9 1.9 0 0 1 24 9.6a1.9 1.9 0 0 1 3.5 1.4c0 2.4-3.5 4.5-3.5 4.5z" className="stroke-seal" />
      </>
    ),
  },
  cheers: {
    box: [0, 0, 48, 48],
    art: (
      <>
        <g transform="rotate(13 15 26)">
          <path d="M7.5 12h15l-3 13.5h-9zM15 25.5v12M10.5 38h9" />
        </g>
        <g transform="rotate(-13 33 26)">
          <path d="M25.5 12h15l-3 13.5h-9zM33 25.5v12M28.5 38h9" />
        </g>
        <path d="M24 3v3M19 5l1.5 2M29 5l-1.5 2" />
      </>
    ),
  },
  hearts: {
    box: [0, 0, 48, 48],
    art: (
      <>
        <path d="M18 38s-12-7.4-12-15.4A6.6 6.6 0 0 1 18 18.2a6.6 6.6 0 0 1 12 4.4C30 30.6 18 38 18 38z" />
        <path d="M32 26s-7-4.3-7-9A3.9 3.9 0 0 1 32 14.4a3.9 3.9 0 0 1 7 2.6c0 4.7-7 9-7 9z" className="stroke-seal" />
      </>
    ),
  },
  xi: {
    box: [0, 0, 24, 24],
    red: true,
    art: XI,
  },
  // Hung from a cord that runs up out of the top of its box.
  lantern: {
    box: [0, -40, 60, 140],
    red: true,
    art: (
      <>
        <path d="M30 -40V0" />
        <rect x="20" y="0" width="20" height="7" rx="1.5" />
        <ellipse cx="30" cy="30" rx="27" ry="23" />
        <path d="M30 7.5V52.5M19.5 8.8C12 18 12 42 19.5 51.2M40.5 8.8C48 18 48 42 40.5 51.2" />
        <rect x="20" y="53" width="20" height="7" rx="1.5" />
        <path d="M27 62L25 88M30 62V90M33 62L35 88" />
      </>
    ),
  },
  plum: {
    box: [0, 0, 120, 70],
    art: (
      <>
        <path d="M118 62C100 56 84 46 66 36C56 30 44 26 30 26M84 46C82 38 78 32 70 28M50 28C48 20 44 15 38 12" />
        {PLUM_FLOWERS.map(([cx, cy, r]) => (
          <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} className="stroke-seal" />
        ))}
        <circle cx="28" cy="26" r="2.2" />
        <circle cx="92" cy="51" r="2.4" />
      </>
    ),
  },
}

/* Where they go: a share of the way down the page, which side, how far out
   from the column's edge (px) and how wide. Alternating sides, never level
   with each other, so the two margins never mirror. */
const PLACES = [
  { drawing: 'rings', side: 'left', top: '2%', inset: 56, width: 84 },
  { drawing: 'cake', side: 'right', top: '5%', inset: 40, width: 92 },
  { drawing: 'dove', side: 'left', top: '13%', inset: 24, width: 96 },
  { drawing: 'lantern', side: 'right', top: '18%', inset: 64, width: 50 },
  { drawing: 'xi', side: 'left', top: '27%', inset: 72, width: 60 },
  { drawing: 'hearts', side: 'right', top: '32%', inset: 28, width: 80 },
  { drawing: 'cheers', side: 'left', top: '41%', inset: 40, width: 84 },
  { drawing: 'plum', side: 'right', top: '47%', inset: 24, width: 128 },
  { drawing: 'rings', side: 'right', top: '59%', inset: 60, width: 76 },
  { drawing: 'dove', side: 'left', top: '64%', inset: 48, width: 88, flip: true },
  { drawing: 'xi', side: 'right', top: '74%', inset: 52, width: 56 },
  { drawing: 'cake', side: 'left', top: '80%', inset: 36, width: 84 },
  { drawing: 'cheers', side: 'right', top: '89%', inset: 44, width: 80 },
  { drawing: 'hearts', side: 'left', top: '94%', inset: 64, width: 72 },
]

export default function MarginDoodles() {
  if (!config.decorations?.margins) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {PLACES.map((place, i) => {
        const { box, art, red } = DRAWINGS[place.drawing]
        const [, , w, h] = box
        const edge = `calc(50% + ${COLUMN_HALF + place.inset}px)`

        return (
          <svg
            key={i}
            viewBox={box.join(' ')}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`doodle absolute overflow-visible opacity-30 ${red ? 'stroke-seal' : 'stroke-kopi'}`}
            style={{
              top: place.top,
              [place.side === 'left' ? 'right' : 'left']: edge,
              width: place.width,
              height: (place.width * h) / w,
              scale: place.flip ? '-1 1' : undefined,
              // Each on its own clock, so they never bob together.
              animationDuration: `${7 + (i % 3) * 2}s`,
              animationDelay: `${-((i * 1.7) % 7).toFixed(1)}s`,
            }}
          >
            {art}
          </svg>
        )
      })}
    </div>
  )
}
