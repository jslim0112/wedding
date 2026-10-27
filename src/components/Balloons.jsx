import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { onBalloonRelease } from '../lib/balloons'
import { entryGateEnabled } from '../lib/music'
import { prefersReducedMotion } from '../lib/motion'
import { XI } from './ui/XiPattern'

/* ---------------------------------------------------------------------------
   Balloons, over the whole page.

   A bouquet goes up the moment the guest opens the invitation (or sends a
   yes on the RSVP), and after the first one a stray drifts up every so often.
   Each rises from below the screen, sways on its string, slows near the top
   and pops there by itself - or sooner, if someone taps it.

   The layer is fixed over everything but takes no pointer events of its own,
   so it never blocks a scroll, a link or the form; only a balloon itself
   catches a tap. It sits under the music player, the gallery's full-screen
   view and the entry screen.

   Strays keep out of the way of the text: on a wide screen they rise only in
   the margins either side of the document column, and on a phone they hug an
   edge rather than crossing the middle.
--------------------------------------------------------------------------- */

/** The document column, px. Strays rise outside it when there is room. */
const COLUMN = 680
/** The opening bouquet. */
const BOUQUET = 7
/** At most this many strays in the air at once. */
const MAX_STRAYS = 3
/** A guest hammering the stamp should not be able to fill the screen. */
const MAX_IN_FLIGHT = 24
/** How long a popped balloon's burst plays before it is taken away. */
const BURST_MS = 900

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

/* Every skin is drawn in a 60x70 box: body, knot, a shaded crescent down the
   right side, and a highlight. The body takes the balloon's colour from
   currentColor, so one drawing serves every colour. */
const ROUND = (
  <>
    <path className="balloon-body" d="M30 3C45.5 3 55 15.5 55 31C55 49 42 62 30 64C18 62 5 49 5 31C5 15.5 14.5 3 30 3Z" />
    <path className="balloon-body" d="M26 69L30 63L34 69Q30 70.5 26 69Z" />
    <path className="balloon-shade" d="M43 9C51 15 55 23 55 31C55 47 44 59 32 63.5C42 56 49 45 49 32C49 23 47 15 43 9Z" />
  </>
)

const SKINS = {
  round: (
    <>
      {ROUND}
      <path className="balloon-shine" d="M16 19C17.5 13 22 9.5 27 9" />
    </>
  ),
  // A red balloon with a gold 囍 printed on it, as on the agenda's lattice.
  xi: (
    <>
      {ROUND}
      <g className="balloon-xi" transform="translate(20.5 21) scale(0.79)">
        {XI}
      </g>
      <path className="balloon-shine" d="M14 19C15.5 13 20 9.5 25 9" />
    </>
  ),
  heart: (
    <>
      <path className="balloon-body" d="M30 63C30 63 5 48 5 25C5 13 13 6 21.5 6C26 6 28.8 8.8 30 12C31.2 8.8 34 6 38.5 6C47 6 55 13 55 25C55 48 30 63 30 63Z" />
      <path className="balloon-body" d="M26.5 69L30 62L33.5 69Q30 70.5 26.5 69Z" />
      <path className="balloon-shade" d="M45 8.5C51 11 55 17 55 25C55 43 38 56 31.5 61.5C40 53 49 41 49 27C49 18 47.5 12 45 8.5Z" />
      <path className="balloon-shine" d="M11.5 22C12 16.5 15.5 12.5 20 12" />
    </>
  ),
}

const KINDS = [
  { fill: 'var(--color-seal)', shape: 'xi' },
  { fill: 'var(--color-seal)', shape: 'heart' },
  { fill: 'var(--color-blush)', shape: 'round' },
  { fill: 'var(--color-ochre)', shape: 'round' },
  { fill: 'var(--color-blush)', shape: 'heart' },
  { fill: 'var(--color-seal)', shape: 'round' },
]

/* Ivory only reads against the ink hero, so it joins a bouquet only while the
   hero is what is on screen behind it. */
const IVORY = { fill: 'var(--color-paper)', shape: 'round' }

/* The burst: a ring, and ten pieces thrown out evenly around it. */
const BITS = ['bg-ochre', 'heart-seal', 'balloon-bit-dot bg-blush', 'balloon-bit-strip bg-seal', 'heart-ochre']

const between = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

let nextId = 0

function makeBalloon({ left, width, delay, duration, kinds }) {
  return {
    id: ++nextId,
    ...pick(kinds),
    left,
    width,
    delay,
    duration,
    // Where the bottom of the balloon ends up, measured up from the bottom of
    // the screen. It pops somewhere in the top quarter or so.
    rise: -window.innerHeight * between(0.7, 0.86),
    drift: between(-18, 18),
    sway: between(2400, 3800),
    popped: false,
  }
}

/** A bouquet, spread evenly across the screen and let go one after another. */
function bouquet(count) {
  const width = window.innerWidth
  const overHero = window.scrollY < window.innerHeight * 0.5
  const kinds = overHero ? [...KINDS, IVORY] : KINDS

  // Shuffle which slot goes first, so they don't leave in a line.
  const slots = Array.from({ length: count }, (_, i) => i).sort(() => Math.random() - 0.5)

  return slots.map((slot, i) => {
    const size = Math.round(between(44, 62))
    const left = ((width - size) * (slot + between(0.15, 0.85))) / count
    return makeBalloon({ left, width: size, delay: i * 240, duration: between(6400, 8800), kinds })
  })
}

/** One stray: in a side margin if there is room for it, else along an edge. */
function stray() {
  const width = window.innerWidth
  const size = Math.round(between(40, 56))
  const margin = (width - COLUMN) / 2

  const inset =
    margin >= size + 32
      ? between(16, margin - size - 16)
      : between(0, Math.max(width * 0.1, 4))
  const left = Math.random() < 0.5 ? inset : width - size - inset

  return makeBalloon({ left, width: size, delay: 0, duration: between(10000, 14000), kinds: KINDS })
}

function Burst() {
  return (
    <span className="balloon-burst">
      <span className="balloon-ring" />
      {Array.from({ length: 10 }, (_, i) => {
        const bit = BITS[i % BITS.length]
        return (
          <span key={i} className="balloon-ray" style={{ transform: `rotate(${i * 36}deg)` }}>
            {bit.startsWith('heart') ? (
              <svg
                viewBox="0 0 24 24"
                className={`balloon-bit balloon-bit-heart ${bit === 'heart-seal' ? 'fill-seal' : 'fill-ochre'}`}
              >
                <path d={HEART} />
              </svg>
            ) : (
              <span className={`balloon-bit ${bit}`} />
            )}
          </span>
        )
      })}
    </span>
  )
}

function Balloon({ balloon, onPop }) {
  return (
    <button
      type="button"
      // Decoration: reachable by finger and mouse, never by Tab.
      tabIndex={-1}
      onClick={() => onPop(balloon.id)}
      // The rise ending is the balloon reaching the top. Only the button's own
      // animation counts - the sway never ends, and the burst's pieces finish
      // after the pop has already happened.
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onPop(balloon.id)
      }}
      className={`balloon ${balloon.popped ? 'balloon-popped' : ''}`}
      style={{
        left: balloon.left,
        width: balloon.width,
        color: balloon.fill,
        animationDuration: `${balloon.duration}ms`,
        animationDelay: `${balloon.delay}ms`,
        '--rise': `${balloon.rise}px`,
        '--drift': `${balloon.drift}px`,
      }}
    >
      <span className="balloon-sway" style={{ animationDuration: `${balloon.sway}ms` }}>
        <svg viewBox="0 0 60 70" className="balloon-skin">
          {SKINS[balloon.shape]}
        </svg>
        <svg viewBox="0 0 60 44" className="balloon-string">
          <path d="M30 0C26 8 34 14 30 22C26.5 29 33 35 30 44" />
        </svg>
      </span>
      {balloon.popped && <Burst />}
    </button>
  )
}

export default function Balloons() {
  const { decorations } = config
  const enabled = Boolean(decorations?.balloons) && !prefersReducedMotion()
  const [balloons, setBalloons] = useState([])
  const timers = useRef(new Set())

  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timers.current.delete(id)
      fn()
    }, ms)
    timers.current.add(id)
  }, [])

  const pop = useCallback(
    (id) => {
      setBalloons((list) => list.map((b) => (b.id === id && !b.popped ? { ...b, popped: true } : b)))
      later(() => setBalloons((list) => list.filter((b) => b.id !== id)), BURST_MS)
    },
    [later],
  )

  useEffect(() => {
    if (!enabled) return
    const pending = timers.current
    const every = Math.max(Number(decorations.balloonEverySeconds) || 8, 2) * 1000
    let straying = false

    // Strays start after the first bouquet, at an uneven pace so they never
    // feel like a metronome. A hidden tab sends none up to greet nobody.
    const scheduleStray = () =>
      later(() => {
        if (!document.hidden) {
          setBalloons((list) =>
            list.filter((b) => !b.popped).length >= MAX_STRAYS ? list : [...list, stray()],
          )
        }
        scheduleStray()
      }, every * between(0.6, 1.4))

    const release = (count) => {
      setBalloons((list) => (list.length >= MAX_IN_FLIGHT ? list : [...list, ...bouquet(count)]))
      if (!straying) {
        straying = true
        scheduleStray()
      }
    }

    const unsubscribe = onBalloonRelease(release)
    // With no entry screen there is no tap to wait for.
    if (!entryGateEnabled()) later(() => release(BOUQUET), 600)

    return () => {
      unsubscribe()
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [enabled, decorations, later])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden print:hidden">
      {balloons.map((balloon) => (
        <Balloon key={balloon.id} balloon={balloon} onPop={pop} />
      ))}
    </div>
  )
}
