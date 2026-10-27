import { useId } from 'react'

/* ---------------------------------------------------------------------------
   The agenda card's backdrop: 囍 set in a diamond lattice, after the brocade
   and window lattice on a Chinese wedding invitation. Seal red at low
   strength, and fainter still towards the middle of the card where the text
   is, so it reads as the paper the evening is printed on rather than as
   something competing with it.
--------------------------------------------------------------------------- */

/* One tile, in CSS pixels: a 囍 in the middle of a lattice diamond, whose
   corners meet the neighbouring tiles' with a small knot where they touch. */
const TILE = 112
const MID = TILE / 2

/* The 囍 is drawn on a 24-unit grid and scaled up to this many units. */
const XI_SIZE = 32
const XI_SCALE = XI_SIZE / 24

/* Geometric, paper-cut style: two 喜 side by side, with the long strokes
   running straight through both as they do when the character is cut from
   one sheet of red paper. Drawn rather than set in a font, so it looks the
   same on every phone.

   Exported for the other things that carry a 囍 - the balloons, the hero
   lanterns, the margin doodles. Bare paths with no paint of their own: the
   group they are dropped into sets the stroke. */
export const XI = (
  <>
    <path d="M1 2H23M6 0.6V5.4M18 0.6V5.4M3 5.4H9M15 5.4H21" />
    <path d="M3.6 7.6h4.8v3.6H3.6zM15.6 7.6h4.8v3.6h-4.8z" />
    <path d="M4.6 12.8l.9 1.4M7.4 12.8l-.9 1.4M16.6 12.8l.9 1.4M19.4 12.8l-.9 1.4" />
    <path d="M1 15.6H23" />
    <path d="M3.6 17.8h4.8v4.6H3.6zM15.6 17.8h4.8v4.6h-4.8z" />
  </>
)

/* Full strength at the card's edges, down to under a third behind the text. */
const FADE = 'radial-gradient(ellipse 75% 70% at 50% 50%, rgb(0 0 0 / 0.3) 15%, black 100%)'

const knot = (x, y) => (
  <path key={`${x},${y}`} d={`M${x} ${y - 4.3}l4.3 4.3-4.3 4.3-4.3-4.3z`} fill="currentColor" />
)

export default function XiPattern({ className = '' }) {
  // Pattern ids are document-wide, so each copy gets its own.
  const id = `xi-${useId().replace(/[^\w-]/g, '')}`

  return (
    <svg
      aria-hidden="true"
      className={`text-seal opacity-15 ${className}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <defs>
        {/* Centred on the card, then shifted half a tile, so one column and
            one row of 囍 run through the very middle and the rest fall in
            pairs either side. The agenda's trail covers the middle column; on
            a phone the next ones sit well inside the edges instead of being
            cut in half by them. */}
        <pattern
          id={id}
          x="50%"
          y="50%"
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${MID} ${MID})`}
        >
          <path
            d={`M0 ${MID}L${MID} 0L${TILE} ${MID}L${MID} ${TILE}Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.7"
          />
          <g
            transform={`translate(${MID - XI_SIZE / 2} ${MID - XI_SIZE / 2}) scale(${XI_SCALE})`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          >
            {XI}
          </g>
          {/* Each tile draws half of every knot on its edges; the tile next
              door draws the other half. */}
          {[knot(0, MID), knot(TILE, MID), knot(MID, 0), knot(MID, TILE)]}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
