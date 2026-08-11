import { useEffect, useState } from 'react'
import { config } from '../config'
import { getTimeLeft } from '../lib/format'
import Section from './ui/Section'
import Reveal from './ui/Reveal'

function Cell({ value, unit }) {
  return (
    <div className="border border-rail bg-card px-2 py-4 text-center sm:px-4 sm:py-5">
      <p className="font-ticket text-[1.75rem] leading-none text-ink tabular-nums sm:text-4xl">
        {value}
      </p>
      <p className="ticket-data mt-2 text-[0.56rem] text-rail">{unit}</p>
    </div>
  )
}

export default function Countdown() {
  const { wedding } = config
  const [left, setLeft] = useState(() => getTimeLeft(wedding.startISO))

  useEffect(() => {
    const id = setInterval(() => setLeft(getTimeLeft(wedding.startISO)), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <Section id="countdown" label="Departure in">
      <Reveal>
        {left.done ? (
          <p className="heading-display text-center text-[1.6rem] text-ink sm:text-3xl">
            Today’s the day.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Cell value={left.days} unit="Days" />
              <Cell value={pad(left.hours)} unit="Hours" />
              <Cell value={pad(left.minutes)} unit="Minutes" />
            </div>
            {/* Not a live region - announcing every second would be unusable. */}
            <p className="sr-only">
              {left.days} days, {left.hours} hours and {left.minutes} minutes until the wedding.
            </p>
          </>
        )}
      </Reveal>
    </Section>
  )
}
