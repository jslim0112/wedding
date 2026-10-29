import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { prefersReducedMotion } from '../lib/motion'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Photo from './ui/Photo'

/* ---------------------------------------------------------------------------
   The gallery: a pile of polaroids with the top one on show. Swiping it to
   either way (or pressing Next) moves on to the next photo; only Previous
   goes back to the one before. Under the pile, each year
   is a station on a little railway, and a train rides it along with the
   photos; tapping a station brings that year's first photo to the top.

   Every move looks the same, whichever way it goes: the photo on top flies
   off the way it was swiped and fades out, then the new one fades in on top
   of the pile.

   While the pile is on screen the gallery also moves on by itself, every
   few seconds. It gives way to the guest: it waits a while after their own
   swipe or tap, holds still while a mouse rests on it or the keyboard is
   inside it, stops when it is scrolled away or the tab is hidden, and never
   runs at all for a guest who asked for reduced motion.

   Only the top polaroid moves. The three under it never change position -
   only the photos printed on them do - so the pile looks the same at every
   step and there is nothing to keep in sync.
--------------------------------------------------------------------------- */

/** How long the top polaroid takes to fly off and fade out. */
const TOSS_MS = 320

/** How long the new top polaroid takes to fade in. */
const FADE_IN_MS = 240

/** A drag further than this, either way, throws the photo off. */
const TOSS_DISTANCE = 70

/** Movement under this is a wobble of the finger, not a drag. */
const TAP_SLOP = 6

/** How long each photo stays on top while the gallery runs by itself. */
const AUTOPLAY_MS = 3000

/** How long it waits after a guest's own swipe or tap before running again. */
const RESUME_MS = 8000

/* Where the polaroids under the top one lie: nudged and turned a little,
   each its own way, so the edges of the pile show. Bottom first. */
const PILE = [
  'translate(-3px, 15px) rotate(-1.5deg)',
  'translate(11px, 11px) rotate(3.5deg)',
  'translate(-9px, 7px) rotate(-4deg)',
]

/* The top polaroid at rest: very nearly straight, as if just put down. */
const REST = 'rotate(1deg)'

/* The train's trip between two photos: a short hop between photos of one
   year is quick, a run along the whole line slower. Milliseconds, scaled
   from how far it goes along the line (0 to 1). */
const tripMs = (distance) => Math.round(Math.min(1100, Math.max(380, 300 + Math.abs(distance) * 720)))

const TRIP_EASE = 'ease-[cubic-bezier(0.45,0.05,0.3,1)]'

/** A point on the line, from 0 at the first station to 1 at the last. */
const along = (f) => `calc(22px + (100% - 44px) * ${f})`

/**
 * Where each photo puts the train, from 0 (the first station) to 1 (the
 * last). A year's first photo stops it at that year's station; each photo
 * after it moves it an equal share of the way on towards the next year - a
 * third at a time for a year of three photos. The last year's photos all
 * wait at its station, and a photo with no year leaves the train wherever the
 * one before it did.
 */
function trainSpots(photos, years) {
  const station = (k) => (years.length > 1 ? k / (years.length - 1) : 0)
  let spot = 0
  return photos.map((photo, i) => {
    const k = years.indexOf(photo.year)
    if (k === -1) return spot
    const ofYear = photos.filter((p) => p.year === photo.year).length
    const before = photos.slice(0, i).filter((p) => p.year === photo.year).length
    spot = k === years.length - 1 ? station(k) : station(k) + (before / ofYear) * (station(k + 1) - station(k))
    return spot
  })
}

/**
 * The little steam engine, facing right. Drawn flat in the palette, like the
 * agenda's spot illustrations; the wheels are separate so they can turn.
 */
function Engine({ face }) {
  return (
    <svg
      viewBox="0 0 32 22"
      className="train-body block h-[22px] w-8 transition-transform duration-200"
      style={{ transform: `scaleX(${face})` }}
    >
      <rect x="2" y="2" width="12" height="3" rx="1" className="fill-ink" />
      <rect x="3" y="4.5" width="10" height="10.5" className="fill-seal" />
      <rect x="5.5" y="6.5" width="5" height="4" rx="1" className="fill-paper" />
      <rect x="13" y="8" width="13.5" height="7" rx="3.5" className="fill-seal" />
      <rect x="17.5" y="8" width="1.3" height="7" className="fill-ochre" />
      <rect x="21" y="3.4" width="3.4" height="5" className="fill-ink" />
      <rect x="20.2" y="2.2" width="5" height="1.6" rx="0.5" className="fill-ink" />
      <circle cx="27.4" cy="10.4" r="1.1" className="fill-gilt" />
      <path d="M26 15L30.5 18.6H26Z" className="fill-ink" />
      <rect x="3" y="15" width="24" height="1.6" className="fill-ink" />
      {[
        [8, 18.4, 3],
        [16, 18.9, 2.5],
        [23, 18.9, 2.5],
      ].map(([cx, cy, r]) => (
        <g key={cx} className="train-wheel">
          <circle cx={cx} cy={cy} r={r} className="fill-ink" />
          <path
            d={`M${cx} ${cy - r + 0.4}V${cy + r - 0.4}M${cx - r + 0.4} ${cy}H${cx + r - 0.4}`}
            strokeWidth="0.8"
            className="stroke-ochre"
          />
        </g>
      ))}
    </svg>
  )
}

/** Chevron for the arrows. `back` mirrors it. */
function Chevron({ back = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-4 ${back ? 'rotate-180' : ''}`}
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

const ARROW =
  'flex size-11 items-center justify-center rounded-full border border-rail/60 bg-paper text-ink transition-colors hover:border-ochre hover:text-kopi'

/**
 * Splits a caption into the year on its first line and the event after it,
 * so 'YEAR 2026\nOur ROM' prints as "Our ROM" with "2026" beside it. A
 * caption whose first line has no year in it is all title, and has no year.
 */
function captionParts(caption = '') {
  const [first, ...rest] = caption.split('\n')
  const year = first.match(/\b\d{4}\b/)?.[0]
  if (year && rest.join('').trim()) return { year, title: rest.join(' ').trim() }
  return { year: null, title: caption.trim() }
}

/**
 * One polaroid: the photo cropped to the print's tall shape, a little above
 * centre where faces usually are, with its caption written underneath.
 */
function Polaroid({ photo, className = '', style, ...props }) {
  return (
    <div
      className={`mx-auto block w-[280px] bg-white p-3 pb-0 shadow-[0_1px_2px_rgba(74,27,41,0.14),0_10px_26px_rgba(74,27,41,0.16)] select-none sm:w-[340px] sm:p-3.5 sm:pb-0 ${className}`}
      style={style}
      {...props}
    >
      <div className="aspect-[4/5] overflow-hidden bg-card">
        <Photo photo={photo} imgClassName="pointer-events-none object-[50%_35%]" />
      </div>
      <div className="flex items-baseline justify-between gap-2 px-1 pt-3.5 pb-4">
        <div className="min-w-0">
          {photo.title && (
            <p className="font-caption text-[1.4rem] leading-tight text-ink sm:text-[1.65rem]">{photo.title}</p>
          )}
          {photo.caption_zh && (
            <p className="zh mt-0.5 text-[0.85rem] leading-snug text-ink">{photo.caption_zh}</p>
          )}
        </div>
        {photo.year && <p className="ticket-data shrink-0 text-[0.7rem] text-rail">{photo.year}</p>}
      </div>
    </div>
  )
}

export default function Gallery() {
  // In the order written in config.js - newest first - each with its
  // caption split for the polaroid. A slot with no URL yet still takes its
  // turn on the pile, as a labelled placeholder, so you can see which
  // pictures are still missing.
  const photos = config.gallery.map((photo) => ({ ...photo, ...captionParts(photo.caption) }))
  const count = photos.length

  // The stations on the line: each year once, in the order the photos reach
  // it, and the point on the line that each photo puts the train.
  const years = [...new Set(photos.map((p) => p.year).filter(Boolean))]
  const spots = trainSpots(photos, years)

  /* `index` is the photo on top, and `base` the one the pile underneath is
     counted from. `base` catches up with `index` only once a new photo has
     faded in, so the pile never changes under a photo while it is still see-
     through. `fly` is -1 or 1 while the top polaroid is flying off to that
     side, and 0 otherwise. `entering` holds it invisible and a touch small,
     ready to fade in. `snap` turns its transition off for a moment, so it can
     be changed without being seen to travel there. */
  const [pile, setPile] = useState({ index: 0, base: 0, fly: 0, entering: false, snap: false })
  const [dragX, setDragX] = useState(null)

  /* The train sets off the moment a move starts, rather than waiting for
     the photo to change, so `at` is the photo it is heading for. `face` is
     the way it points, `trip` how long this run takes, `moving` whether the
     wheels are turning, and `puff` counts the stops, each of which lets out
     a fresh puff of steam. */
  const [at, setAt] = useState(0)
  const [train, setTrain] = useState({ face: 1, trip: 0, moving: false, puff: 0 })

  const dragRef = useRef(null)
  // Set once a press has moved far enough to count as a drag.
  const draggedRef = useRef(false)
  // Read by handlers that would otherwise see the state from before a toss.
  const busyRef = useRef(false)
  const timersRef = useRef([])
  const arriveRef = useRef(0)

  const later = useCallback((fn, ms) => {
    timersRef.current.push(window.setTimeout(fn, ms))
  }, [])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(window.clearTimeout)
      window.clearTimeout(arriveRef.current)
    }
  }, [])

  /* Running by itself. `onScreen` is whether at least half the pile is in
     view; `paused` whether a mouse rests on the gallery or the keyboard is
     inside it. `lastMoveRef` holds when the pile last moved and how long the
     photo on top should then be left alone - a normal turn after the
     gallery's own move, a longer one after the guest's. The timer outlives
     renders, so it calls the latest `next` through `nextRef` rather than the
     one it was made with, which would keep aiming at the same photo. */
  const stackRef = useRef(null)
  const nextRef = useRef(null)
  const lastMoveRef = useRef({ at: 0, wait: AUTOPLAY_MS })
  const [onScreen, setOnScreen] = useState(false)
  const [paused, setPaused] = useState(false)
  const autoplay = count > 1 && onScreen && !paused && !prefersReducedMotion()

  useEffect(() => {
    const stack = stackRef.current
    if (!stack || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      threshold: 0.5,
    })
    observer.observe(stack)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!autoplay) return
    // Coming into view, or out from under the mouse, gives the photo on top
    // a full turn first - unless the guest's own wait is still running.
    const { at, wait } = lastMoveRef.current
    if (Date.now() - at >= wait) lastMoveRef.current = { at: Date.now(), wait: AUTOPLAY_MS }

    const id = window.setInterval(() => {
      // Nobody is looking, or a finger is on the photo: the clock waits too.
      if (document.hidden || dragRef.current) {
        lastMoveRef.current = { ...lastMoveRef.current, at: Date.now() }
        return
      }
      if (busyRef.current || Date.now() - lastMoveRef.current.at < lastMoveRef.current.wait) return
      lastMoveRef.current = { at: Date.now(), wait: AUTOPLAY_MS }
      nextRef.current?.()
    }, 250)
    return () => window.clearInterval(id)
  }, [autoplay])

  if (count === 0) return null

  /**
   * Put photo `target` on top: the one there now flies off towards side
   * `dir` (1 right, -1 left) and fades out, then `target` fades in.
   */
  const go = (target, dir) => {
    if (count < 2 || busyRef.current || target === pile.index) return
    setDragX(null)
    ride(target)

    if (prefersReducedMotion()) {
      setPile({ index: target, base: target, fly: 0, entering: false, snap: false })
      return
    }

    busyRef.current = true
    setPile((p) => ({ ...p, fly: dir, snap: false }))
    later(() => {
      // Swap the photo while the polaroid is invisible, and bring it back
      // to rest, still invisible, without being seen to travel there...
      setPile((p) => ({ ...p, index: target, fly: 0, entering: true, snap: true }))
      // ...then, a frame later so the browser has drawn it there, fade in.
      later(() => {
        setPile((p) => ({ ...p, entering: false, snap: false }))
        later(() => {
          setPile((p) => ({ ...p, base: p.index }))
          busyRef.current = false
        }, FADE_IN_MS)
      }, 40)
    }, TOSS_MS)
  }

  /** Send the train along the line to where photo `target` puts it. */
  const ride = (target) => {
    const distance = spots[target] - spots[at]
    setAt(target)
    if (Math.abs(distance) < 0.001) return

    const trip = tripMs(distance)
    window.clearTimeout(arriveRef.current)
    setTrain((t) => ({ ...t, face: distance > 0 ? 1 : -1, trip, moving: true }))
    arriveRef.current = window.setTimeout(() => {
      setTrain((t) => ({ ...t, moving: false, puff: t.puff + 1 }))
    }, trip)
  }

  const next = () => go((pile.index + 1) % count, 1)
  const back = () => go((pile.index - 1 + count) % count, -1)
  nextRef.current = next

  /** A guest moved it themselves: let them look before running on again. */
  const hold = () => {
    lastMoveRef.current = { at: Date.now(), wait: RESUME_MS }
  }

  /** The first photo of that year. Older years lie further on, to the right. */
  const jumpTo = (year) => {
    hold()
    const k = photos.findIndex((p) => p.year === year)
    if (k >= 0) go(k, k > pile.index ? 1 : -1)
  }

  /* A mouse resting on the gallery holds it still - a finger touching it
     does not, or it would stay paused until the guest tapped somewhere else.
     So does keyboard focus inside it, but not the focus a click leaves on a
     button, for the same reason. */
  const onGalleryPointerEnter = (event) => {
    if (event.pointerType === 'mouse') setPaused(true)
  }

  const onGalleryPointerLeave = (event) => {
    if (event.pointerType === 'mouse') setPaused(false)
  }

  const onGalleryFocus = (event) => {
    if (event.target.matches?.(':focus-visible')) setPaused(true)
  }

  const onGalleryBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
  }

  /* Dragging the top polaroid. touch-action on it leaves vertical swipes to
     the browser, so a guest scrolling past with a thumb on the photo still
     scrolls the page - the browser then sends pointercancel, and the drag is
     dropped. Only a sideways drag is ours. */
  const onCardPointerDown = (event) => {
    if (!event.isPrimary || count < 2 || busyRef.current) return
    hold()
    dragRef.current = { x: event.clientX }
    draggedRef.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onCardPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return
    const dx = event.clientX - drag.x
    if (!draggedRef.current && Math.abs(dx) < TAP_SLOP) return
    draggedRef.current = true
    setDragX(dx)
  }

  const onCardPointerUp = (event) => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    hold()
    const dx = event.clientX - drag.x
    // A swipe either way moves on to the next photo, the polaroid flying off
    // the side it was thrown towards.
    if (draggedRef.current && Math.abs(dx) > TOSS_DISTANCE) go((pile.index + 1) % count, dx > 0 ? 1 : -1)
    else setDragX(null)
  }

  const onCardPointerCancel = () => {
    dragRef.current = null
    draggedRef.current = false
    setDragX(null)
  }

  /* Where the top polaroid is, and how it gets there: flying off and fading
     out, held invisible to fade in, following a finger, or springing back to
     rest with a small overshoot. */
  let topTransform = REST
  let topTransition = `transform 280ms cubic-bezier(0.2, 0.9, 0.3, 1.25), opacity ${FADE_IN_MS}ms ease-out`
  let topOpacity = 1
  if (pile.fly) {
    topTransform = `translate(${pile.fly * 150}%, 30px) rotate(${pile.fly * 26}deg)`
    topTransition = `transform ${TOSS_MS}ms ease-in, opacity ${TOSS_MS}ms ease-in`
    topOpacity = 0
  } else if (pile.entering) {
    topTransform = `${REST} scale(0.96)`
    topOpacity = 0
  } else if (dragX !== null) {
    topTransform = `translate(${dragX}px, ${Math.abs(dragX) * 0.08}px) rotate(${1 + dragX / 16}deg)`
    topTransition = 'none'
  }
  if (pile.snap) topTransition = 'none'

  const top = photos[pile.index]
  // The line follows the train, which is already on its way to `at`.
  const spot = spots[at]
  const atYear = years.indexOf(photos[at].year)
  const stations = years.map((_, k) => k / Math.max(years.length - 1, 1))
  // Up to three under the top one, bottom of the pile first.
  const under = PILE.slice(-Math.min(count - 1, PILE.length)).map((transform, i, list) => ({
    photo: photos[(pile.base + list.length - i) % count],
    transform,
  }))

  return (
    // First section under the hero: the dark-to-light change is its divider.
    <Section id="gallery" label="" title="Ours" title_zh="我们" divider={false}>
      <div
        onPointerEnter={onGalleryPointerEnter}
        onPointerLeave={onGalleryPointerLeave}
        onFocus={onGalleryFocus}
        onBlur={onGalleryBlur}
      >
        <Reveal>
          {/* Reaching out over the section's side padding, and clipped only
              sideways: a polaroid thrown off the pile fades out past the edge
              of the screen on a phone rather than at a line inside it, and
              never adds width to the page. */}
          <div ref={stackRef} className="-mx-6 overflow-x-clip px-6">
            <div className="relative pt-2.5 pb-4">
              {under.map(({ photo, transform }, i) => (
                <Polaroid
                  key={i}
                  photo={photo}
                  aria-hidden="true"
                  className="absolute inset-x-0 top-2.5"
                  style={{ transform }}
                />
              ))}

              <Polaroid
                photo={top}
                onPointerDown={onCardPointerDown}
                onPointerMove={onCardPointerMove}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerCancel}
                className={`relative touch-pan-y ${count > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ transform: topTransform, transition: topTransition, opacity: topOpacity }}
              />
            </div>
          </div>
        </Reveal>

        {count > 1 && (
          <Reveal delay={60}>
            <div className="mt-2 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={() => {
                  hold()
                  back()
                }}
                aria-label="Previous photo"
                className={ARROW}
              >
                <Chevron back />
              </button>
              {/* Read out when the guest moves the pile, but not while it runs
                  by itself - announcing a new photo every few seconds would
                  drown out everything else. */}
              <p
                aria-live={autoplay ? 'off' : 'polite'}
                className="ticket-data min-w-16 text-center text-[0.75rem] text-kopi tabular-nums"
              >
                {pile.index + 1} / {count}
              </p>
              <button
                type="button"
                onClick={() => {
                  hold()
                  next()
                }}
                aria-label="Next photo"
                className={ARROW}
              >
                <Chevron />
              </button>
            </div>

            {/* The years as stations on a little railway, and a train that
                rides it along with the photos. The track behind the train is
                seal, ahead of it rail grey. */}
            {years.length > 1 && (
              <div className="relative mx-auto mt-6 h-[74px] max-w-md">
                <span aria-hidden="true" className="train-track absolute top-[30px] right-[22px] left-[22px]" />
                <span
                  aria-hidden="true"
                  className={`train-track train-track-lit absolute top-[30px] right-[22px] left-[22px] transition-[clip-path] ${TRIP_EASE}`}
                  style={{ clipPath: `inset(0 ${(1 - spot) * 100}% 0 0)`, transitionDuration: `${train.trip}ms` }}
                />

                <ol>
                  {years.map((year, k) => {
                    const station = stations[k]
                    const on = k === atYear
                    return (
                      <li key={year} className="absolute top-0 h-[70px] w-11 -translate-x-1/2" style={{ left: along(station) }}>
                        <button
                          type="button"
                          onClick={() => jumpTo(year)}
                          aria-label={`Photos from ${year}`}
                          aria-current={on ? 'true' : undefined}
                          className="relative block size-full"
                        >
                          <span
                            className={`absolute top-[29px] left-1/2 size-2.5 -translate-x-1/2 rounded-full border-2 transition-colors ${
                              station <= spot + 0.001 ? 'border-seal bg-seal' : 'border-rail bg-paper'
                            }`}
                          />
                          <span
                            className={`ticket-data absolute inset-x-0 top-[46px] text-center text-[0.625rem] tracking-[0.06em] transition-colors ${
                              on ? 'font-bold text-seal' : 'text-rail'
                            }`}
                          >
                            {year}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>

                {/* Above the stations, and deaf to taps, so a tap meant for the
                    station under it still reaches the station. */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-[9px] h-[22px] w-8 -translate-x-1/2 transition-[left] ${TRIP_EASE} ${
                    train.moving ? 'train-moving' : ''
                  }`}
                  style={{ left: along(spot), transitionDuration: `${train.trip}ms` }}
                >
                  <Engine face={train.face} />
                  {/* Steam from the chimney each time it stops. A new key for
                      each stop starts a fresh puff rather than reusing the last. */}
                  {train.puff > 0 && (
                    <span key={train.puff} className="train-puff" style={{ left: train.face === 1 ? 22.5 : 9.5 }}>
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                </div>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </Section>
  )
}
