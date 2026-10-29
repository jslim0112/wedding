import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { MONTHS_EN, getMonthMatrix, getTimeLeft, googleMapsUrl, mapEmbedUrl, wazeUrl } from '../lib/format'
import { prefersReducedMotion } from '../lib/motion'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Divider from './ui/Divider'
import { FallingPetals, PlumBranch, PlumSprig } from './ui/Blossom'
import homestayLogo from '../assets/jaya-homestay.jpg'

/* ---------------------------------------------------------------------------
   The details, set as one wedding invitation card: the month with the day in
   a heart, the time, a countdown that rolls like an odometer, then where. The
   plum branch, the sprig and the falling petals are the calendar's old
   flourishes. Under the card, the map is a polaroid pinned to the page ("See
   you here!"), and the two ways to get directions sit beneath that.
--------------------------------------------------------------------------- */

/* The card runs Monday to Sunday, the way a Chinese wall calendar prints it. */
const WEEKDAYS_ZH = ['一', '二', '三', '四', '五', '六', '日']

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** How long the digits wait before rolling up from zero, and how long it takes. */
const ROLL_DELAY_MS = 450
const ROLL_MS = 900
const ROLL_STAGGER_MS = 90

/** The one flourish on the calendar: the wedding day sits inside a heart. */
function Heart() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="cal-heart absolute left-1/2 top-1/2 size-[2.4rem] -translate-x-1/2 -translate-y-1/2 fill-seal sm:size-[2.7rem]"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

/**
 * A number as a row of odometer wheels. Each digit is a column of 0-9 slid
 * up to the one showing, so a change rolls rather than swaps. While `intro`
 * is on, the wheels roll up from zero one after another; afterwards only the
 * digit that changed moves, and quickly.
 */
function Odometer({ value, length, intro }) {
  const still = prefersReducedMotion()
  const text = String(value).padStart(length, '0')

  return (
    <span
      aria-hidden="true"
      className="font-ticket inline-flex h-[1.9rem] overflow-hidden text-[1.3rem] leading-[1.9rem] font-bold text-seal tabular-nums"
    >
      {[...text].map((digit, i) => (
        <span key={i} className="block h-[1.9rem] w-[0.62em] overflow-hidden">
          <span
            className="block will-change-transform"
            style={{
              transform: `translateY(-${Number(digit) * 10}%)`,
              transition: still
                ? 'none'
                : `transform ${intro ? ROLL_MS : 380}ms cubic-bezier(0.2, 0.8, 0.2, 1) ${intro ? i * ROLL_STAGGER_MS : 0}ms`,
            }}
          >
            {DIGITS.map((n) => (
              <span key={n} className="block h-[1.9rem] text-center">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}

/** One unit of the countdown: the rolling number, then its name in both languages. */
function Unit({ value, length, intro, label, label_zh }) {
  return (
    <div className="grid min-w-[2.6rem] justify-items-center gap-[3px]">
      <Odometer value={value} length={length} intro={intro} />
      <span className="zh text-[0.85rem] leading-none text-seal/80">{label_zh}</span>
      <span className="ticket-data text-[0.5rem] text-rail">{label}</span>
    </div>
  )
}

/** A small ochre dot between the units. */
const Sep = () => (
  <span aria-hidden="true" className="text-[1.2rem] leading-[1.9rem] text-ochre">
    ·
  </span>
)

/** The small arrow on the direction buttons: this opens somewhere else. */
function OutArrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}

export default function Details() {
  const { wedding, venue } = config
  const month = getMonthMatrix(wedding.startISO)
  const blossoms = Boolean(config.decorations?.blossoms)
  // The sprig sits in the blank squares after the last day of the month, so
  // it only grows when there are enough of them to hold it clear of a date.
  const sprigRoom = month ? month.weeks[month.weeks.length - 1].filter((d) => d === null).length >= 4 : false

  const [left, setLeft] = useState(() => getTimeLeft(wedding.startISO))
  useEffect(() => {
    const id = setInterval(() => setLeft(getTimeLeft(wedding.startISO)), 1000)
    return () => clearInterval(id)
  }, [wedding.startISO])

  /* The countdown shows zeros until the card is on screen, then rolls up to
     the real time and, once that has landed, ticks plainly. A guest who asks
     for reduced motion just gets the time. */
  const cardRef = useRef(null)
  const [rolled, setRolled] = useState(prefersReducedMotion)
  const [intro, setIntro] = useState(!prefersReducedMotion())

  useEffect(() => {
    const card = cardRef.current
    if (rolled || !card) return
    const timers = []
    const start = () => {
      timers.push(window.setTimeout(() => setRolled(true), ROLL_DELAY_MS))
      timers.push(window.setTimeout(() => setIntro(false), ROLL_DELAY_MS + ROLL_MS + 2 * ROLL_STAGGER_MS + 100))
    }
    if (typeof IntersectionObserver === 'undefined') {
      start()
      return () => timers.forEach(window.clearTimeout)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        start()
      },
      { threshold: 0.4 },
    )
    observer.observe(card)
    return () => {
      observer.disconnect()
      timers.forEach(window.clearTimeout)
    }
  }, [rolled])

  const shown = rolled ? left : { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return (
    <Section id="details" title="Details" title_zh="详情">
      <Reveal>
        {/* Reaching out over the section's side padding and clipped only
            sideways: the branch runs off the edge of the screen on a phone
            rather than adding width to the page. */}
        <div className="-mx-6 overflow-x-clip px-6">
          <div ref={cardRef} className="relative mt-4">
            {/* A double rule, like a wall calendar's: a hard outer line with a
                softer one set just inside it. */}
            <div className="border border-seal/70 p-1">
              <div className="rounded-[3px] border border-seal/30 px-5 pt-6 pb-7 text-center sm:px-10">
                {month && (
                  <>
                    <div className="flex items-baseline justify-between px-1">
                      <span className="font-ticket text-[1.1rem] font-semibold text-seal tabular-nums sm:text-[1.4rem]">
                        {month.year}
                      </span>
                      <span className="font-ticket text-[1.9rem] leading-none font-semibold text-seal tabular-nums sm:text-[2.5rem]">
                        {month.month}
                        <span className="zh text-[0.9rem] font-normal sm:text-[1.1rem]">月</span>
                      </span>
                    </div>
                    <p className="ticket-data mt-0.5 px-1 text-right text-[0.5rem] text-rail">
                      {MONTHS_EN[month.month - 1]}
                    </p>

                    <div className="zh mt-3 grid grid-cols-7 rounded-full bg-seal py-1 text-center">
                      {WEEKDAYS_ZH.map((d) => (
                        <span key={d} className="text-[0.7rem] text-paper sm:text-[0.8rem]">
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="relative mt-1.5">
                      <div className="grid grid-cols-7 text-center">
                        {month.weeks.flat().map((d, i) => (
                          <div key={i} className="relative flex h-10 items-center justify-center sm:h-11">
                            {d === month.day && <Heart />}
                            {d && (
                              <span
                                className={`relative text-[0.8rem] tabular-nums sm:text-[0.95rem] ${
                                  d === month.day ? 'text-[1rem] font-semibold text-paper' : 'text-kopi'
                                }`}
                              >
                                {d}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {blossoms && sprigRoom && (
                        <PlumSprig className="pointer-events-none absolute -right-[6px] -bottom-[4px] h-11 w-[130px]" />
                      )}
                    </div>
                  </>
                )}

                <div className="my-5 h-px bg-seal/35" />

                {left.done ? (
                  <p className="heading-display mt-3 text-[2rem] text-ink">Today’s the day.</p>
                ) : (
                  <>
                    <div className="mt-4 flex justify-center gap-[clamp(8px,3vw,10px)]">
                      <Unit value={shown.days} length={Math.max(3, String(left.days).length)} intro={intro} label="Days" label_zh="天" />
                      <Sep />
                      <Unit value={shown.hours} length={2} intro={intro} label="Hours" label_zh="时" />
                      <Sep />
                      <Unit value={shown.minutes} length={2} intro={intro} label="Minutes" label_zh="分" />
                      <Sep />
                      <Unit value={shown.seconds} length={2} intro={intro} label="Seconds" label_zh="秒" />
                    </div>

                    {/* Not a live region - announcing every second would be
                        unusable, so the digits are never read out. */}
                    <p className="sr-only">
                      {left.days} days, {left.hours} hours and {left.minutes} minutes until the wedding.
                    </p>
                  </>
                )}

                <p className="ticket-data mt-6 text-[1.0rem] font-bold text-rail">
                  Time <span className="zh ml-1">时间</span>
                </p>
                <p className="ticket-data mt-1 text-[1.0rem] text-ink">{wedding.timeLabel}</p>

                <Divider className="my-6" />

                <p className="ticket-data text-[1.0rem] text-rail font-bold">
                  At <span className="zh ml-1">地点</span>
                </p>
                <img
                  src={homestayLogo}
                  alt="Jaya Homestay Kluang 家雅民宿"
                  width="500"
                  height="500"
                  className="mx-auto mt-2 size-28 rounded-full object-cover shadow-[0_1px_2px_rgba(74,27,41,0.18),0_4px_10px_rgba(74,27,41,0.15)] sm:size-28"
                />
                <p className="mx-auto mt-2.5 max-w-[17rem] text-[0.9rem] leading-relaxed text-kopi sm:max-w-sm">
                  {venue.address}
                </p>

                {venue.dressCode && (
                  <p className="mt-3 text-[0.85rem] text-kopi">
                    <span className="ticket-data mr-1.5 text-[1.0rem] text-rail">Dress code</span>
                    {venue.dressCode}
                  </p>
                )}

                {venue.parking && (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-card px-3.5 py-1.5 text-left text-[0.80rem] leading-snug text-ink">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-[30px] shrink-0 stroke-seal"
                    >
                      <path d="M5 16V11.5l2-5h10l2 5V16M5 16h14M5 16v2.5M19 16v2.5M3.5 11.5h17" />
                      <circle cx="8" cy="13.6" r="0.9" />
                      <circle cx="16" cy="13.6" r="0.9" />
                    </svg>
                    {/* Each language on its own line, so a phone never strands
                        the last character of the Chinese on a line by itself. */}
                    <span>
                      {venue.parking}
                      {venue.parking_zh && <span className="zh block">{venue.parking_zh}</span>}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* A branch reaching in over the card's top-right corner, from as
                far right as the screen edge on a phone, above the month. */}
            {blossoms && (
              <PlumBranch className="pointer-events-none absolute -top-[52px] -right-[60px] h-16 w-[190px]" />
            )}
            {blossoms && <FallingPetals />}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-10" delay={60}>
        {/* The map as a polaroid pinned to the page, a little crooked. The
            live map inside still pans and zooms as normal. */}
        <figure className="relative mx-auto w-full max-w-[20rem] -rotate-[2.5deg] bg-white p-2.5 pb-0 shadow-[0_1px_2px_rgba(74,27,41,0.14),0_10px_24px_rgba(74,27,41,0.15)] sm:max-w-[26rem]">
          <span
            aria-hidden="true"
            className="absolute -top-2.5 left-1/2 z-10 size-[18px] -translate-x-1/2 rounded-full shadow-[0_2px_3px_rgba(74,27,41,0.35)]"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-seal) 45%, white) 0 2px, var(--color-seal) 3px)',
            }}
          />
          <div className="h-52 overflow-hidden bg-card sm:h-64">
            <iframe
              title={`Map showing ${venue.name}`}
              src={mapEmbedUrl(venue.lat, venue.lng)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block size-full border-0"
            />
          </div>
          <figcaption className="flex items-baseline justify-between gap-3 px-1 pt-2.5 pb-3.5">
            <span className="font-caption text-[1.35rem] leading-tight text-ink">See you here!</span>
            <span className="zh text-[0.9rem] text-kopi">我们{wedding.city_zh}见</span>
          </figcaption>
        </figure>

        {/* Waze first - it is what most people in Malaysia actually navigate with. */}
        <div className="mt-7 flex gap-2.5">
          <a
            href={wazeUrl(venue.lat, venue.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-3.5 text-[0.95rem] font-semibold text-paper transition-colors hover:bg-kopi"
          >
            <span className="sr-only">Open in </span>Waze
            <OutArrow />
          </a>
          <a
            href={googleMapsUrl(venue.lat, venue.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-ink px-4 py-3.5 text-[0.95rem] font-semibold text-ink transition-colors hover:border-ochre hover:text-kopi"
          >
            <span className="sr-only">Open in </span>Google Maps
            <OutArrow />
          </a>
        </div>
      </Reveal>
    </Section>
  )
}
