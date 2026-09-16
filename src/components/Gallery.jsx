import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { config } from '../config'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Photo from './ui/Photo'

/* The photo frame's shape. The arrows are centred on the photo rather than on
   the whole slide, so their overlay is given the same aspect — change this in
   one place and the two stay aligned however tall the captions run. */
const FRAME_ASPECT = 'aspect-square'

/** Chevron for the two carousel arrows. `back` mirrors it. */
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
  'pointer-events-auto flex size-9 items-center justify-center rounded-full border border-rail/30 bg-paper/85 text-kopi shadow-sm transition-colors hover:bg-paper hover:text-ink sm:size-10'

export default function Gallery() {
  const photos = config.gallery
  const count = photos.length
  // Only slots with a real URL can be opened full screen. Placeholders stay
  // inert, but they still take a turn in the carousel so you can see which
  // pictures are still missing.
  const viewable = photos.map((photo, slide) => ({ ...photo, slide })).filter((p) => p.src)

  /* The strip carries a copy of the last photo before the first, and a copy of
     the first after the last. Swiping off either end lands on a copy, and the
     moment it settles there the strip is moved — without animation, so it is
     invisible — to the real photo at the other end. That is what makes the
     carousel loop under a swipe and not just under the arrows.

     Positions run over this padded strip; `index` is the real photo showing. */
  const loop = count > 1
  const slides = loop ? [photos[count - 1], ...photos, photos[0]] : photos
  const positionOf = (photoIndex) => (loop ? photoIndex + 1 : photoIndex)
  const photoAt = (position) => (loop ? (position - 1 + count) % count : position)

  const trackRef = useRef(null)
  const triggersRef = useRef([])
  const dialogRef = useRef(null)
  const settleRef = useRef(0)
  // Where the strip is heading. `index` only catches up once a scroll event
  // lands, so stepping off it would make two quick presses of Next aim at the
  // same photo twice; this is updated the moment a press is handled.
  const targetRef = useRef(0)
  const [index, setIndex] = useState(0)
  const [openAt, setOpenAt] = useState(null)

  /* ---------------------------------------------------------------------
     The carousel is a scroll-snap strip rather than a transform slider, so
     a phone swipe is the browser's own scrolling — nothing to implement,
     and it stays in step with the arrows because both read scrollLeft.
  --------------------------------------------------------------------- */
  const scrollToPosition = useCallback((position, animate = true) => {
    const track = trackRef.current
    if (!track) return

    const left = position * track.clientWidth
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (animate && !reduce) {
      track.scrollTo({ left, behavior: 'smooth' })
      return
    }

    // scrollTo with behavior 'auto' still defers to the CSS scroll-behavior,
    // which is smooth here — so the jump has to suppress it outright.
    const previous = track.style.scrollBehavior
    track.style.scrollBehavior = 'auto'
    track.scrollLeft = left
    track.style.scrollBehavior = previous
  }, [])

  /** Jump straight to a photo — used by the dots and the full-screen viewer. */
  const goTo = useCallback(
    (photoIndex) => {
      const clamped = Math.max(0, Math.min(photoIndex, count - 1))
      targetRef.current = clamped
      scrollToPosition(positionOf(clamped))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, loop, scrollToPosition],
  )

  /**
   * Step one photo either way from where the strip is heading. Stepping off
   * an end scrolls onto the copy there, so the picture slides in from the
   * expected side; the settle below then swaps in the real one.
   */
  const step = (delta) => {
    const next = targetRef.current + delta

    if (!loop) {
      goTo(next)
      return
    }

    targetRef.current = (next + count) % count
    scrollToPosition(next + 1)
  }

  const onScroll = () => {
    const track = trackRef.current
    if (!track || !track.clientWidth) return

    const exact = track.scrollLeft / track.clientWidth
    const position = Math.round(exact)
    setIndex(photoAt(position))

    // Only a settled strip re-aims the target or gets moved. Acting on the
    // halfway positions of a running animation would undo the point of it.
    if (Math.abs(exact - position) > 0.02) return
    targetRef.current = photoAt(position)

    if (!loop || (position !== 0 && position !== slides.length - 1)) return

    // Landed on a copy. Let any momentum die down, then move across.
    window.clearTimeout(settleRef.current)
    settleRef.current = window.setTimeout(() => {
      scrollToPosition(position === 0 ? count : 1, false)
    }, 80)
  }

  // Open on the first real photo rather than on the copy that precedes it.
  useLayoutEffect(() => {
    if (loop) scrollToPosition(1, false)
    return () => window.clearTimeout(settleRef.current)
  }, [loop, scrollToPosition])

  /* ---------------------------------------------------------------------
     The full-screen viewer, opened by tapping the photo on show.
  --------------------------------------------------------------------- */
  const close = useCallback(() => {
    setOpenAt((current) => {
      if (current !== null) {
        const slide = viewable[current]?.slide
        requestAnimationFrame(() => triggersRef.current[slide]?.focus())
      }
      return null
    })
  }, [viewable])

  useEffect(() => {
    if (openAt === null) return

    const onKey = (event) => {
      if (event.key === 'Escape') {
        close()
      } else if (event.key === 'ArrowRight') {
        setOpenAt((i) => (i + 1) % viewable.length)
      } else if (event.key === 'ArrowLeft') {
        setOpenAt((i) => (i - 1 + viewable.length) % viewable.length)
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [openAt, viewable.length, close])

  // Stepping through the viewer with the arrow keys carries the carousel
  // along, so closing it leaves the strip on the photo last looked at.
  useEffect(() => {
    if (openAt === null) return
    const slide = viewable[openAt]?.slide
    if (slide !== undefined && slide !== index) goTo(slide)
  }, [openAt, viewable, index, goTo])

  const current = openAt === null ? null : viewable[openAt]

  return (
    <Section id="gallery" label="" title="A Fews of Our Favourites">
      <Reveal>
        {/* overflow-x-clip stops the strip's width reaching the page. Even
            though the track scrolls and clips its own content, the slides
            still count towards the document's scrollable width — 5325px
            against a 390px phone — and a swipe that reaches the end of the
            strip then chains outwards and pans the whole page, leaving a band
            of empty paper down the right. `clip` rather than `hidden`: hidden
            would turn this into a scroll container on the other axis too. */}
        <div className="relative overflow-x-clip">
          <ul
            ref={trackRef}
            onScroll={onScroll}
            tabIndex={0}
            aria-label="Photo carousel — scroll or use the arrows"
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {slides.map((photo, position) => {
              const isCopy = loop && (position === 0 || position === slides.length - 1)
              const photoIndex = photoAt(position)
              const openable = viewable.findIndex((p) => p.slide === photoIndex)
              const frame = `${FRAME_ASPECT} overflow-hidden border border-rail`

              return (
                <li
                  key={position}
                  aria-hidden={isCopy ? 'true' : undefined}
                  className="w-full shrink-0 snap-start px-px"
                >
                  <figure>
                    {/* A copy is scenery for the swipe — never a control, and
                        never announced, or every photo would be read twice. */}
                    {isCopy || openable === -1 ? (
                      <div className={frame}>
                        <Photo photo={photo} loading={position <= 1 ? 'eager' : 'lazy'} />
                      </div>
                    ) : (
                      <button
                        type="button"
                        ref={(el) => {
                          triggersRef.current[photoIndex] = el
                        }}
                        onClick={() => setOpenAt(openable)}
                        className={`${frame} w-full transition-opacity hover:opacity-85`}
                      >
                        <Photo photo={photo} loading={position <= 1 ? 'eager' : 'lazy'} />
                        <span className="sr-only">
                          Open photo {openable + 1} of {viewable.length} full screen
                        </span>
                      </button>
                    )}

                    {(photo.caption || photo.caption_zh) && (
                      <figcaption className="mt-3 px-1 text-center">
                        {photo.caption && (
                          <p className="font-caption text-[1.8rem] leading-snug text-ink">
                            {photo.caption}
                          </p>
                        )}
                        {photo.caption_zh && (
                          <p className="zh mt-0.5 text-[0.9rem] leading-snug text-ink">
                            {photo.caption_zh}
                          </p>
                        )}
                      </figcaption>
                    )}
                  </figure>
                </li>
              )
            })}
          </ul>

          {/* The arrows ride the edges of the photo itself. The overlay copies
              the frame's aspect and hangs from the top of the strip, so the
              buttons stay centred on the picture however tall a caption runs
              underneath. It lets pointer events through, or it would swallow
              the swipe. */}
          {count > 1 && (
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 flex ${FRAME_ASPECT} items-center justify-between px-2 sm:px-3`}
            >
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className={ARROW}
              >
                <Chevron back />
              </button>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className={ARROW}
              >
                <Chevron />
              </button>
            </div>
          )}
        </div>
      </Reveal>

      {count > 1 && (
        <Reveal delay={60}>
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-4 bg-seal' : 'w-1.5 bg-rail/40 hover:bg-rail'
                }`}
              />
            ))}
          </div>
        </Reveal>
      )}

      {current && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt || current.caption || `Photo ${openAt + 1} of ${viewable.length}`}
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 p-4"
        >
          <img
            src={current.src}
            alt={current.alt || ''}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[78svh] max-w-full object-contain"
          />

          {(current.caption || current.caption_zh) && (
            <div
              className="mt-4 max-w-[36rem] text-center"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Same face full screen, sized to sit with the photo. The
                  Chinese below keeps its serif — the caption face, like any
                  Latin display face, carries no CJK glyphs. */}
              {current.caption && (
                <p className="font-caption text-[1.6rem] leading-snug text-paper/90">
                  {current.caption}
                </p>
              )}
              {current.caption_zh && (
                <p className="zh mt-0.5 text-[0.9rem] text-paper/70">{current.caption_zh}</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={close}
            className="ticket-data absolute top-4 right-4 border border-paper/40 px-3 py-2 text-[0.6rem] text-paper transition-colors hover:border-ochre hover:text-ochre"
          >
            Close
          </button>

          {viewable.length > 1 && (
            <p className="ticket-data absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] text-paper/60">
              {openAt + 1} / {viewable.length}
            </p>
          )}
        </div>
      )}
    </Section>
  )
}
