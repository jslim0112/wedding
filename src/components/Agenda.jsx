import { config } from '../config'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Art from './ui/AgendaArt'
import XiPattern from './ui/XiPattern'

/* Stops are staggered: each one is two half-rows tall and starts one half-row
   below the last, so a stop rises into the empty space beside its neighbour
   instead of clearing a whole row of its own. Five stops therefore need six
   half-rows rather than five full ones — a little over half the height.

   This is the trail's own coordinate box, stretched over the real column, so
   the number sets only the shape of the curve and never its size on screen. */
const HALF = 50

/* How far the trail swings either side of centre, as a percentage of the
   timeline's width. The gutter column it swings inside must stay wider than
   twice this (plus the stroke), or the curve rides out over the text — at a
   680px column, 5% is ±29px against a 4.5rem gutter's ±36px. */
const SWING = 5

/** Total height of the trail's box: one half-row per stop, plus one. */
const boxHeight = (count) => (count + 1) * HALF

/**
 * The trail: one soft S-curve winding down the middle of the timeline, drawn
 * as a dashed line with a heart on it at every stop.
 *
 * It is phased to cross the centre line exactly once per stop, at that stop's
 * midpoint — which with the staggered layout falls every half-row. That is
 * what lets the hearts, laid out by the grid rather than by this path, sit
 * precisely on the curve, and it puts the widest part of each swing halfway
 * between two stops where only the gutter is.
 */
function trailPath(count) {
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

/* The trail draws itself down the card the first time the card is revealed:
   this long after the card starts to fade in, over this long, at an even pace
   so that it reaches each stop at a time that can be worked out. */
const DRAW_DELAY = 300
const DRAW_MS = 1800

/** When a stop starts to fade in: just before the trail reaches it. */
const stopDelay = (index, count) => DRAW_DELAY + (DRAW_MS * (index + 1)) / (count + 1) - 200

/* Once the trail is down and the last heart has landed, the hearts start to
   beat — each a little after the one above it, so the pulse runs down the
   trail the way the trail itself was drawn. */
const BEAT_START = DRAW_DELAY + DRAW_MS + 300
const BEAT_STAGGER = 150

/* The trail's two ends fade out rather than stopping dead. */
const SOFT_ENDS = 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'

/**
 * One stop. Odd-numbered stops sit on the right of the trail and even on the
 * left, but the markup order never changes — a screen reader and a printer
 * both read the evening straight down in time order.
 *
 * Each stop is two half-rows tall and begins one half-row after the one
 * before, so neighbours overlap by half their height. Their boxes overlap;
 * their contents never do, because consecutive stops are on opposite sides.
 */
function Stop({ time, title, title_zh, icon, index, count }) {
  const onLeft = index % 2 === 0

  return (
    <li
      /* The column is pinned as well as the row. Given a row but no column,
         auto-placement refuses to let two items share a cell and invents a new
         column for each stop — which is the opposite of the overlap wanted. */
      style={{
        gridRow: `${index + 1} / span 2`,
        gridColumn: 1,
        // Read by the stop's fade and its heart's pop and beat, in index.css.
        '--stop-delay': `${stopDelay(index, count)}ms`,
        '--beat-delay': `${BEAT_START + index * BEAT_STAGGER}ms`,
      }}
      className="trail-stop grid grid-cols-[1fr_4rem_1fr] items-center py-3.5 sm:grid-cols-[1fr_5rem_1fr] sm:py-5"
    >
      {/* Both cells state their row as well as their column. Without the row,
          a stop placed in column 3 leaves the auto-placement cursor past
          column 2, and the heart that follows it is pushed into an implicit
          second row — dropping every right-hand heart off the trail. */}
      {/* Plain blocks rather than a flex column. A column flex box with its
          items aligned to one end sizes them to max-content, so a long label
          would run out over the trail instead of wrapping in its column. */}
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

      {/* The heart sits on the trail where it crosses the centre line, level
          with the stop. Its fill is solid, so the dashes pass behind it. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="trail-heart col-start-2 row-start-1 mx-auto size-5 overflow-visible fill-[color-mix(in_srgb,var(--color-seal)_40%,var(--color-paper))] stroke-seal sm:size-6"
      >
        <path
          d="M12 20.5s-7.6-4.5-9.5-9.3C1.1 7.7 3.3 4 6.8 4c2.2 0 3.7 1.3 5.2 3.2C13.5 5.3 15 4 17.2 4c3.5 0 5.7 3.7 4.3 7.2-1.9 4.8-9.5 9.3-9.5 9.3z"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
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
        <div className="relative border border-rail/40 bg-card/30 px-2 py-2 sm:px-6 sm:py-8">
          <XiPattern className="pointer-events-none absolute inset-0 size-full" />

          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox={`0 0 100 ${boxHeight(items.length)}`}
              preserveAspectRatio="none"
              className="trail pointer-events-none absolute inset-0 h-full w-full"
              style={{
                transitionDelay: `${DRAW_DELAY}ms`,
                transitionDuration: `${DRAW_MS}ms`,
                maskImage: SOFT_ENDS,
                WebkitMaskImage: SOFT_ENDS,
              }}
            >
              {/* non-scaling-stroke keeps the trail an even width even though
                  the box is stretched to whatever height the stops come out
                  at, and measures the dashes in screen pixels too, so they
                  stay the same length on every card. Round caps add half the
                  stroke to each end: 8 + 10 draws an 11.5px dash and a 6.5px
                  gap. */}
              <path
                d={trailPath(items.length)}
                fill="none"
                strokeWidth="3.5"
                strokeDasharray="8 10"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                className="stroke-kopi/70"
              />
            </svg>

            {/* Equal fr half-rows: a stop spanning two of them contributes
                half its height to each, so every half-row ends up half the
                tallest stop — whatever its text wraps to — and the trail,
                which divides its own box the same way, stays in step. */}
            <ol
              className="relative grid grid-cols-1"
              style={{ gridTemplateRows: `repeat(${items.length + 1}, minmax(0, 1fr))` }}
            >
              {items.map((item, i) => (
                <Stop key={`${item.time}-${item.title}`} {...item} index={i} count={items.length} />
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
