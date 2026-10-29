import { useId } from 'react'

/* ---------------------------------------------------------------------------
   The agenda's spot illustrations. Flat drawings, three colours at most, all
   from the ticket palette — blush stock, kopi outline, ochre and seal for the
   one warm accent each. The cutlery is the one exception: it is silver.
   Hand-drawn as paths so they scale, print and recolour with the theme
   rather than shipping as images.

   Every drawing lives in a 48x48 box and is centred with a little air around
   the edge, so they sit at a consistent optical size beside one another.
   Add a key here and it becomes usable as `icon` in config.js.

   Five of them move - the tea steams, the camera flashes, the cutlery
   gleams, the fireworks go off and the glasses clink. The motion is all in
   index.css, on the `art-` classes here, and each loops with a rest of its
   own so the five never go off together. Still, each one is the plain
   drawing: anything that only exists while moving (the flash, the sparks,
   the sheen) is invisible until its animation shows it, so a guest who asks
   for reduced motion simply sees the picture.

   A drawing is either the shapes themselves or, when it needs an id of its
   own (the cutlery's sheen is masked to its shape), a function given one.
--------------------------------------------------------------------------- */

/* Polished silver, cool against the blush ticket stock. */
const SILVER = 'fill-[#d4d5db]'

const ART = {
  /* Arrival — a polaroid, mid-print. The photo is drawn first so the body
     covers it and it reads as sliding out of the slot. */
  camera: (
    <>
      <rect x="14" y="34" width="20" height="12" rx="1.5" className="fill-paper stroke-kopi" strokeWidth="1.6" />
      <rect x="5.5" y="13" width="37" height="26" rx="4" className="fill-card stroke-kopi" strokeWidth="1.6" />
      <circle cx="24" cy="25" r="8" className="fill-paper stroke-kopi" strokeWidth="1.6" />
      <circle cx="24" cy="25" r="3.6" className="fill-rail" />
      <rect x="32" y="17.5" width="6" height="4" rx="1.2" className="art-flash-bulb fill-ochre" />
      <path d="M10 17.5h5" className="stroke-kopi" strokeWidth="1.6" />
      {/* The flash going off: a burst of light and a few rays from the bulb. */}
      <circle cx="35" cy="19.5" r="4" className="art-flash fill-white" />
      <path d="M35 12v-3M40.5 14.5l2-2M42.5 19.5h3M29.5 14.5l-2-2" className="art-flash-rays stroke-gilt" strokeWidth="1.4" />
    </>
  ),

  /* Check-in — a card ticket with the stub perforation and a tick. */
  ticket: (
    <>
      <path
        d="M5 17a2 2 0 0 1 2-2h34a2 2 0 0 1 2 2v3.2a3.8 3.8 0 0 0 0 7.6V31a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3.2a3.8 3.8 0 0 0 0-7.6z"
        className="fill-card stroke-kopi"
        strokeWidth="1.6"
      />
      <path d="M31 16v16" className="stroke-kopi" strokeWidth="1.4" strokeDasharray="2 3" />
      <path d="M15 24.2l2.6 2.6 4.6-5" className="stroke-seal" strokeWidth="2.2" />
    </>
  ),

  /* 敬茶 — a cup on its saucer, still steaming. */
  tea: (
    <>
      {/* Three wisps, each rising and fading on its own beat. */}
      <path d="M17 15c2.5-2.5 0-4 1.5-6.5" className="art-steam stroke-seal/60" strokeWidth="1.8" />
      <path d="M22.5 15.5c2.5-2.5 0-4 1.5-6.5" className="art-steam art-steam-2 stroke-seal/60" strokeWidth="1.8" />
      <path d="M28 15c2.5-2.5 0-4 1.5-6.5" className="art-steam art-steam-3 stroke-seal/60" strokeWidth="1.8" />
      <path d="M12 18h22l-2.6 11.5a9 9 0 0 1-16.8 0z" className="fill-card stroke-kopi" strokeWidth="1.6" />
      <path d="M33 21.5a5.5 5.5 0 0 1 0 8" className="stroke-kopi" strokeWidth="1.6" />
      <ellipse cx="23" cy="38" rx="15" ry="3.2" className="fill-paper stroke-kopi" strokeWidth="1.6" />
    </>
  ),

  rings: (
    <>
      <circle cx="18" cy="30" r="10" className="stroke-ochre" strokeWidth="3" />
      <circle cx="30" cy="24" r="10" className="stroke-ochre" strokeWidth="3" />
      <path d="M30 8.5l4.2 4.6-4.2 4.6-4.2-4.6z" className="fill-paper stroke-kopi" strokeWidth="1.4" />
    </>
  ),

  /* The ceremony arch: two posts under a round top, a swag of fabric hung
     across it, and blooms clustered on the two upper corners. */
  arch: (
    <>
      <path d="M11 44V25a13 13 0 0 1 26 0v19" className="stroke-kopi" strokeWidth="2.2" />
      <path d="M13.5 20.5c3.5 6 7 8 10.5 8s7-2 10.5-8" className="stroke-seal/35" strokeWidth="3.5" />
      <circle cx="13" cy="21" r="2.6" className="fill-seal" />
      <circle cx="17.5" cy="15" r="2.2" className="fill-ochre" />
      <circle cx="30.5" cy="15" r="2.2" className="fill-seal" />
      <circle cx="35" cy="21" r="2.6" className="fill-ochre" />
      <circle cx="24" cy="12" r="2" className="fill-seal/70" />
    </>
  ),

  /* Dinner — a cloche over a plate. */
  plate: (
    <>
      <path d="M9 32a15 15 0 0 1 30 0z" className="fill-card stroke-kopi" strokeWidth="1.6" />
      <circle cx="24" cy="15.5" r="2" className="fill-ochre" />
      <ellipse cx="24" cy="34" rx="19" ry="3.4" className="fill-paper stroke-kopi" strokeWidth="1.6" />
    </>
  ),

  /* The buffet — a silver fork and spoon. A band of light sweeps across them
     every so often, masked to their shape so it only ever lights the metal,
     and a gold glint twinkles after it. */
  cutlery: (id) => (
    <>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <path d="M15 7v8a3.5 3.5 0 0 0 7 0V7M18.5 8v7" stroke="white" strokeWidth="1.6" fill="none" />
          <rect x="17.1" y="18" width="2.8" height="24" rx="1.4" fill="white" />
          <ellipse cx="32" cy="14" rx="5" ry="7" fill="white" />
          <rect x="30.6" y="20.5" width="2.8" height="21.5" rx="1.4" fill="white" />
        </mask>
      </defs>
      <path d="M15 7v8a3.5 3.5 0 0 0 7 0V7" className="stroke-kopi" strokeWidth="1.6" />
      <path d="M18.5 8v7" className="stroke-kopi" strokeWidth="1.3" />
      <rect x="17.1" y="18" width="2.8" height="24" rx="1.4" className={`${SILVER} stroke-kopi`} strokeWidth="1.1" />
      <ellipse cx="32" cy="14" rx="5" ry="7" className={`${SILVER} stroke-kopi`} strokeWidth="1.6" />
      <path d="M29.6 10.6c.6-1.6 1.5-2.6 2.7-3" className="stroke-white" strokeWidth="1" />
      <rect x="30.6" y="20.5" width="2.8" height="21.5" rx="1.4" className={`${SILVER} stroke-kopi`} strokeWidth="1.1" />
      <g mask={`url(#${id})`}>
        <g transform="rotate(20 24 24)">
          <rect x="-12" y="-8" width="6" height="64" className="art-shine fill-white" />
        </g>
      </g>
      <path d="M38.5 3l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z" className="art-glint fill-gilt" />
    </>
  ),

  /* Free & easy — two glasses tipped towards each other, mid-clink. Each one
     leans in (SVG rotates clockwise for a positive angle), so the bowls meet
     at the top and the feet stay apart.

     Moving, they swing apart and back together on their feet, and the ding
     sparks where the rims touch. The swing is on an inner group: a CSS
     transform would replace the outer group's lean rather than add to it. */
  cheers: (
    <>
      <g transform="rotate(13 15 26)">
        <g className="art-glass-left">
          <path d="M7.5 12h15l-3 13.5h-9z" className="fill-card stroke-kopi" strokeWidth="1.6" />
          <path d="M15 25.5v12" className="stroke-kopi" strokeWidth="1.8" />
          <path d="M10.5 38h9" className="stroke-kopi" strokeWidth="1.8" />
        </g>
      </g>
      <g transform="rotate(-13 33 26)">
        <g className="art-glass-right">
          <path d="M25.5 12h15l-3 13.5h-9z" className="fill-card stroke-kopi" strokeWidth="1.6" />
          <path d="M33 25.5v12" className="stroke-kopi" strokeWidth="1.8" />
          <path d="M28.5 38h9" className="stroke-kopi" strokeWidth="1.8" />
        </g>
      </g>
      <path d="M24 10V7M20.5 10.6l-2-1.6M27.5 10.6l2-1.6" className="art-ding stroke-ochre" strokeWidth="1.4" />
      <circle cx="24" cy="6.5" r="1.7" className="art-fizz fill-ochre" />
      <circle cx="31" cy="3.5" r="1.2" className="art-fizz art-fizz-2 fill-ochre" />
    </>
  ),

  guitar: (
    <>
      <rect x="20" y="3" width="7" height="5" rx="1.5" className="fill-kopi" />
      <path d="M23.5 8v12" className="stroke-kopi" strokeWidth="2.6" />
      {/* Two bouts and a waist — the small upper one, then the wide lower. */}
      <path
        d="M23.5 19.5c4 0 5.8 2.6 5.8 5.4 0 2.2-1.6 3-1.6 4.6 0 2 2.6 2.8 2.6 6.2 0 4.2-3 7.3-6.8 7.3s-6.8-3.1-6.8-7.3c0-3.4 2.6-4.2 2.6-6.2 0-1.6-1.6-2.4-1.6-4.6 0-2.8 1.8-5.4 5.8-5.4z"
        className="fill-card stroke-kopi"
        strokeWidth="1.6"
      />
      <circle cx="23.5" cy="30.5" r="2.3" className="fill-kopi" />
      <circle cx="38" cy="17" r="2.6" className="fill-seal" />
      <path d="M40.6 17V7l4.2 1.7" className="stroke-seal" strokeWidth="1.8" />
    </>
  ),

  music: (
    <>
      <path d="M18 34V11l20-3.5V30" className="stroke-seal" strokeWidth="2" />
      <path d="M18 18l20-3.5" className="stroke-seal" strokeWidth="2" />
      <circle cx="13.6" cy="34" r="4.6" className="fill-seal" />
      <circle cx="33.6" cy="30" r="4.6" className="fill-seal" />
    </>
  ),

  beer: (
    <>
      <path d="M12 18h17v18a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4z" className="fill-ochre/45 stroke-kopi" strokeWidth="1.6" />
      <path d="M29 22a5.5 5.5 0 0 1 0 11" className="stroke-kopi" strokeWidth="1.6" />
      <path d="M12 18a4.5 4.5 0 0 1 4.2-4.5 4.5 4.5 0 0 1 8.4-1A4.2 4.2 0 0 1 29 18z" className="fill-paper stroke-kopi" strokeWidth="1.6" />
      <path d="M34 12l2.5-4M38.5 16.5l4.5-2" className="stroke-ochre" strokeWidth="1.8" />
    </>
  ),

  /* Fireworks. Moving, a rocket climbs and the big red one bursts open from
     its centre, the small gold one answers a beat later, and the two loose
     sparks twinkle. */
  fireworks: (
    <>
      <path d="M20 44V25" className="art-rocket stroke-seal/50" strokeWidth="1.4" strokeDasharray="4 30" />
      <g className="art-burst">
        <path
          d="M20 22V11M20 22l-8.5-6.5M20 22l8.5-6.5M20 22l-9.5 4M20 22l9.5 4M20 22l-5 9.5M20 22l5 9.5"
          className="stroke-seal"
          strokeWidth="2"
        />
        <circle cx="20" cy="22" r="2.4" className="fill-seal" />
      </g>
      <g className="art-burst art-burst-2">
        <path d="M37 37v-6.5M37 37l-5.5-3.2M37 37l5.5-3.2M37 37l-3.2 5.5M37 37l3.2 5.5" className="stroke-ochre" strokeWidth="1.8" />
        <circle cx="37" cy="37" r="1.6" className="fill-ochre" />
      </g>
      <circle cx="8.5" cy="38" r="1.4" className="art-twinkle fill-ochre" />
      <circle cx="42" cy="13" r="1.4" className="art-twinkle art-twinkle-2 fill-seal" />
    </>
  ),

  hearts: (
    <path
      d="M24 41s-15-9.2-15-19.2A8.3 8.3 0 0 1 24 15a8.3 8.3 0 0 1 15 6.8C39 31.8 24 41 24 41z"
      className="fill-seal/80"
    />
  ),
}

export const ART_NAMES = Object.keys(ART)

/**
 * One spot illustration. An unknown or missing name draws nothing at all —
 * a stop with no `icon` simply has no picture, rather than a broken box.
 */
export default function Art({ name, className = '' }) {
  // Ids are document-wide, so each drawing that needs one gets its own.
  const id = `art-${useId().replace(/[^\w-]/g, '')}`
  const art = ART[name]
  if (!art) return null
  const drawing = typeof art === 'function' ? art(id) : art

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {drawing}
    </svg>
  )
}
