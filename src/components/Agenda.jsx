import { config } from '../config'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Art from './ui/AgendaArt'

/* Stops are staggered: each one is two half-rows tall and starts one half-row
   below the last, so a stop rises into the empty space beside its neighbour
   instead of clearing a whole row of its own. Five stops therefore need six
   half-rows rather than five full ones — a little over half the height.

   This is the ribbon's own coordinate box, stretched over the real column, so
   the number sets only the shape of the curve and never its size on screen. */
const HALF = 50

/* How far the ribbon swings either side of centre, as a percentage of the
   timeline's width. The gutter column it swings inside must stay wider than
   twice this (plus the stroke), or the curve rides out over the text — at a
   680px column, 5% is ±29px against a 4.5rem gutter's ±36px. */
const SWING = 5

/** Total height of the ribbon's box: one half-row per stop, plus one. */
const boxHeight = (count) => (count + 1) * HALF

/**
 * The ribbon: one soft S-curve winding down the middle of the timeline.
 *
 * It is phased to cross the centre line exactly once per stop, at that stop's
 * midpoint — which with the staggered layout falls every half-row. That is
 * what lets the marker dots, laid out by the grid rather than by this path,
 * sit precisely on the curve, and it puts the widest part of each swing
 * halfway between two stops where only the gutter is.
 */
function ribbonPath(count) {
  // A cubic with both handles pushed out by `bow` peaks at 0.75 × bow, so
  // divide back out to swing by a known number of units.
  const bow = SWING / 0.75
  const side = (i) => (i % 2 === 0 ? -1 : 1)

  // The top edge down to the first stop's centre, leaning the opposite way to
  // the first full bend so the wave stays continuous.
  let d = `M 50 0 C ${50 - side(0) * bow * 0.6} ${HALF * 0.4}, ${50 - side(0) * bow * 0.8} ${HALF * 0.6}, 50 ${HALF}`

  for (let i = 0; i < count - 1; i++) {
    const y = HALF * (i + 1)
    const x = 50 + side(i) * bow
    d += ` C ${x} ${y + HALF * 0.25}, ${x} ${y + HALF * 0.75}, 50 ${y + HALF}`
  }

  // ...and out through the bottom edge.
  const y = HALF * count
  const x = 50 + side(count - 1) * bow * 0.8
  d += ` C ${x} ${y + HALF * 0.4}, ${x} ${y + HALF * 0.6}, 50 ${boxHeight(count)}`

  return d
}

/**
 * One stop. Odd-numbered stops sit on the right of the ribbon and even on the
 * left, but the markup order never changes — a screen reader and a printer
 * both read the evening straight down in time order.
 *
 * Each stop is two half-rows tall and begins one half-row after the one
 * before, so neighbours overlap by half their height. Their boxes overlap;
 * their contents never do, because consecutive stops are on opposite sides.
 */
function Stop({ time, title, title_zh, icon, index }) {
  const onLeft = index % 2 === 0

  return (
    <li
      /* The column is pinned as well as the row. Given a row but no column,
         auto-placement refuses to let two items share a cell and invents a new
         column for each stop — which is the opposite of the overlap wanted. */
      style={{ gridRow: `${index + 1} / span 2`, gridColumn: 1 }}
      className="grid grid-cols-[1fr_4rem_1fr] items-center py-3.5 sm:grid-cols-[1fr_5rem_1fr] sm:py-5"
    >
      {/* Both cells state their row as well as their column. Without the row,
          a stop placed in column 3 leaves the auto-placement cursor past
          column 2, and the marker that follows it is pushed into an implicit
          second row — dropping every right-hand dot off the ribbon. */}
      {/* Plain blocks rather than a flex column. A column flex box with its
          items aligned to one end sizes them to max-content, so a long label
          would run out over the ribbon instead of wrapping in its column. */}
      <div
        className={
          onLeft
            ? 'col-start-1 row-start-1 pr-1.5 text-right'
            : 'col-start-3 row-start-1 pl-1.5 text-left'
        }
      >
        <Art
          name={icon}
          className={`mb-1 size-12 sm:mb-1.5 sm:size-12 ${onLeft ? 'ml-auto' : 'mr-auto'}`}
        />

        <p className="font-ticket text-[0.95rem] leading-none font-semibold text-seal tabular-nums sm:text-[1.15rem]">
          {time}
        </p>

        {title_zh && (
          <p className="zh mt-1 text-[0.85em] leading-snug text-ink sm:mt-1.5 sm:text-[0.90rem]">
            {title_zh}
          </p>
        )}

        <p className="ticket-data mt-1 text-[0.85rem] leading-snug text-kopi sm:text-[0.90rem]">
          {title}
        </p>
      </div>

      {/* The dot rides the crossing point of the curve. */}
      <span
        aria-hidden="true"
        className="col-start-2 row-start-1 mx-auto size-2 rounded-full border border-seal/50 bg-paper"
      />
    </li>
  )
}

export default function Agenda() {
  const { agenda } = config
  const items = agenda?.items ?? []

  // Nothing scheduled, nothing printed.
  if (items.length === 0) return null

  return (
    <Section id="agenda" label="" title="Agenda" title_zh="婚礼流程">
      <Reveal>
        <div className="border border-rail/40 bg-card/30 px-2 py-2 sm:px-6 sm:py-8">
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox={`0 0 100 ${boxHeight(items.length)}`}
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              {/* non-scaling-stroke keeps the ribbon an even width even though
                  the box below it is stretched to whatever height the stops
                  come out at. */}
              <path
                d={ribbonPath(items.length)}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="stroke-seal/20"
              />
            </svg>

            {/* Equal fr half-rows: a stop spanning two of them contributes
                half its height to each, so every half-row ends up half the
                tallest stop — whatever its text wraps to — and the ribbon,
                which divides its own box the same way, stays in step. */}
            <ol
              className="relative grid grid-cols-1"
              style={{ gridTemplateRows: `repeat(${items.length + 1}, minmax(0, 1fr))` }}
            >
              {items.map((item, i) => (
                <Stop key={`${item.time}-${item.title}`} {...item} index={i} />
              ))}
            </ol>
          </div>
        </div>
      </Reveal>

      {(agenda.note || agenda.note_zh) && (
        <Reveal delay={60}>
          <div className="mt-6 text-center">
            {agenda.note && <p className="text-[0.95rem] text-kopi">{agenda.note}</p>}
            {agenda.note_zh && <p className="zh mt-1 text-[0.95rem] text-kopi">{agenda.note_zh}</p>}
          </div>
        </Reveal>
      )}
    </Section>
  )
}
