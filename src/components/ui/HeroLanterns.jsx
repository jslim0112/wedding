import { config } from '../../config'
import { XI } from './XiPattern'

/* ---------------------------------------------------------------------------
   Two red 囍 lanterns hung over the hero, one either side of the ticket
   header, with a string of fairy lights swagged between their cords along the
   very top edge.

   They hang at the outside edges of the document column, where nothing else
   is: the header and "You are invited" are centred and stop well short of
   them, and the lights dip only as far as the gap above the header text. The
   two cords are different lengths on purpose - a matched pair reads as a
   frame, an uneven one as something actually hung up for the day.
--------------------------------------------------------------------------- */

/**
 * The lights' wire in a 100x24 box: `count` swags hung from the top edge,
 * each dipping to y=13, with three bulbs along each. The box is stretched to
 * whatever width the cords are apart, so the bulbs are placed as percentages
 * in HTML rather than drawn in the SVG, where they would stretch to ovals.
 */
function swags(count) {
  const span = 100 / count
  let d = 'M0 2'
  const bulbs = []

  for (let i = 0; i < count; i++) {
    const x = i * span
    d += ` Q${x + span / 2} 24 ${x + span} 2`
    // Points along that quadratic, which is symmetric so x is linear in t.
    for (const t of [0.25, 0.5, 0.75]) bulbs.push({ x: x + t * span, y: 2 + 44 * t * (1 - t) })
  }

  return { d, bulbs }
}

/* Three swags on a phone; five across the wider column. */
const NARROW = swags(3)
const WIDE = swags(5)

function Lights({ swag, className }) {
  return (
    <div className={`absolute top-0 right-[36px] left-[36px] h-6 sm:right-[41px] sm:left-[41px] ${className}`}>
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        <path d={swag.d} fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" className="stroke-paper/35" />
      </svg>
      {swag.bulbs.map((bulb, i) => (
        <span
          key={i}
          className="fairy-bulb absolute size-[5.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gilt"
          style={{ left: `${bulb.x}%`, top: bulb.y, animationDelay: `${-((i * 0.53) % 2.2).toFixed(2)}s` }}
        />
      ))}
    </div>
  )
}

/** One lantern on its cord. It swings from the top of the cord. */
function Lantern({ cord, className = '', style }) {
  return (
    <div className={`lantern absolute top-0 w-[46px] sm:w-[56px] ${className}`} style={style}>
      <div className="mx-auto w-[1.5px] bg-ochre/75" style={{ height: cord }} />
      <div className="relative">
        <div className="lantern-glow" />
        <svg viewBox="0 0 60 100" fill="none" className="relative block h-auto w-full overflow-visible">
          <rect x="20" y="0" width="20" height="7" rx="1.5" className="fill-ochre" />
          <ellipse cx="30" cy="30" rx="27" ry="23" className="fill-seal" />
          {/* Lit from inside: a warmer heart to the paper. */}
          <ellipse cx="30" cy="30" rx="15" ry="19" className="fill-ochre/20" />
          <path
            d="M30 7.5V52.5M19.5 8.8C12 18 12 42 19.5 51.2M40.5 8.8C48 18 48 42 40.5 51.2M10 14.5C3 22 3 38 10 45.5M50 14.5C57 22 57 38 50 45.5"
            strokeWidth="1.3"
            className="stroke-ink/45"
          />
          <g transform="translate(19.2 19.6) scale(0.9)" strokeWidth="1.7" strokeLinecap="square" className="stroke-gilt">
            {XI}
          </g>
          <rect x="20" y="53" width="20" height="7" rx="1.5" className="fill-ochre" />
          <circle cx="30" cy="64" r="3" className="fill-ochre" />
          <rect x="26" y="67" width="8" height="3" rx="1" className="fill-ochre" />
          <path
            d="M27 70L25 96M28.5 70L27.5 97M30 70V98M31.5 70L32.5 97M33 70L35 96"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="stroke-ochre"
          />
        </svg>
      </div>
    </div>
  )
}

export default function HeroLanterns() {
  if (!config.decorations?.lanterns) return null

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
      <div className="relative mx-auto w-full max-w-[680px]">
        <Lights swag={NARROW} className="sm:hidden" />
        <Lights swag={WIDE} className="hidden sm:block" />
        <Lantern cord={58} className="left-[13px]" />
        {/* Out of step with the left one, so the pair never swings in time. */}
        <Lantern cord={92} className="right-[13px]" style={{ animationDuration: '4.8s', animationDelay: '-2.1s' }} />
      </div>
    </div>
  )
}
