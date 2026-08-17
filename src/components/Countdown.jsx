import { useEffect, useState } from 'react'
import { config } from '../config'
import { getMonthMatrix, getTimeLeft } from '../lib/format'
import Section from './ui/Section'
import Reveal from './ui/Reveal'

/* The card runs Monday to Sunday, the way a Chinese wall calendar prints it. */
const WEEKDAYS_ZH = ['一', '二', '三', '四', '五', '六', '日']
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** The one flourish on the card: the wedding day sits inside a heart. */
function Heart() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="absolute left-1/2 top-1/2 size-[1.7rem] -translate-x-1/2 -translate-y-1/2 fill-seal sm:size-[2rem]"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

/** One rung of the ticking column beside the calendar. */
function Unit({ value, label, label_zh }) {
  return (
    <li className="text-center">
      <p className="font-ticket text-[1.4rem] leading-none font-semibold text-seal tabular-nums sm:text-[1.9rem]">
        {value}
      </p>
      <p className="zh mt-1 text-[0.8rem] leading-none text-seal/80 sm:text-[0.9rem]">{label_zh}</p>
      <p className="ticket-data mt-1 text-[0.45rem] text-rail sm:text-[0.5rem]">{label}</p>
    </li>
  )
}

export default function Countdown() {
  const { wedding } = config
  const [left, setLeft] = useState(() => getTimeLeft(wedding.startISO))

  useEffect(() => {
    const id = setInterval(() => setLeft(getTimeLeft(wedding.startISO)), 1000)
    return () => clearInterval(id)
  }, [wedding.startISO])

  const pad = (n) => String(n).padStart(2, '0')
  const month = getMonthMatrix(wedding.startISO)

  return (
    <Section id="countdown" label="Departure in" title="Time" title_zh="婚礼时间">
      <Reveal>
        {month && (
          <div className="mb-8 text-center">
          </div>
        )}

        {left.done ? (
          <p className="heading-display text-center text-[2.4rem] text-ink sm:text-[3.2rem]">
            Today’s the day.
          </p>
        ) : (
          <>
            <div className="flex items-stretch justify-center gap-3 sm:gap-6">
              {/* A double rule, the way the border is printed on a wall calendar:
                  a hard outer square with a softer one set just inside it. */}
              {month && (
                <div className="max-w-[26rem] flex-1 border border-seal/70 p-1">
                  <div className="h-full rounded-[3px] border border-seal/30 px-2.5 py-4 sm:px-5">
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

                    <div className="mt-2 grid grid-cols-7 text-center">
                      {month.weeks.flat().map((d, i) => (
                        <div key={i} className="relative flex h-8 items-center justify-center sm:h-9">
                          {d === month.day && <Heart />}
                          {d && (
                            <span
                              className={`relative text-[0.8rem] tabular-nums sm:text-[0.95rem] ${
                                d === month.day ? 'font-semibold text-paper' : 'text-kopi'
                              }`}
                            >
                              {d}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <ul className="flex w-[3.2rem] shrink-0 flex-col justify-around sm:w-[4.25rem]">
                <Unit value={left.days} label="Days" label_zh="天" />
                <Unit value={pad(left.hours)} label="Hours" label_zh="时" />
                <Unit value={pad(left.minutes)} label="Minutes" label_zh="分" />
                <Unit value={pad(left.seconds)} label="Seconds" label_zh="秒" />
              </ul>
            </div>

            {/* Not a live region - announcing every second would be unusable,
                so seconds are shown but never read out. */}
            <p className="sr-only">
              {left.days} days, {left.hours} hours and {left.minutes} minutes until the wedding.
            </p>
          </>
        )}
      </Reveal>
    </Section>
  )
}
