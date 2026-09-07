import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { normalisePhone, isValidPhone, whatsappUrl } from '../lib/format'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Field, { inputClass } from './ui/Field'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  attending: null, // null until chosen, so "required" means something
  pax: '', // blank on purpose - a prefilled number gets submitted unread
  website: '', // honeypot
}

export default function Rsvp() {
  const { rsvp, contacts, couple, wedding } = config
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | saving | done | error
  const [submitError, setSubmitError] = useState(null)
  const confirmationRef = useRef(null)

  const primary = contacts[0]

  const set = (key) => (event) => {
    const value = event?.target?.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  useEffect(() => {
    if (status === 'done') confirmationRef.current?.focus()
  }, [status])

  function validate() {
    const next = {}
    const name = form.fullName.trim()

    if (name.length < 2) next.fullName = 'Please tell us your name so we know who to expect.'
    else if (name.length > 100) next.fullName = 'That is longer than we can save — please shorten it.'

    if (!form.phone.trim()) next.phone = 'We need a number in case plans change on the day.'
    else if (!isValidPhone(form.phone))
      next.phone = 'That does not look like a Malaysian mobile number. Try 012-345 6789.'

    if (form.attending === null) next.attending = 'Let us know if you can make it.'

    if (form.attending === true) {
      const pax = form.pax.trim()
      const paxNumber = Number(pax)
      if (!pax) next.pax = 'Tell us how many seats to keep.'
      else if (!Number.isInteger(paxNumber) || paxNumber < 1 || paxNumber > rsvp.maxPax)
        next.pax = `Pick a number between 1 and ${rsvp.maxPax}.`
    }

    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)

    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      const firstKey = Object.keys(found)[0]
      document.getElementById(firstKey === 'attending' ? 'attending-yes' : firstKey)?.focus()
      return
    }

    setErrors({})
    setStatus('saving')

    // Honeypot: a bot filled a field no human can see. Pretend it worked and
    // write nothing.
    if (form.website.trim()) {
      setStatus('done')
      return
    }

    if (!isSupabaseConfigured) {
      setStatus('error')
      setSubmitError(
        'This site is not connected to its database yet. Please WhatsApp us instead — we will add you by hand.',
      )
      return
    }

    // INSERT only. Never chain .select() here — RLS allows insert and not
    // select, so a select would error on a row that saved perfectly well.
    const { error } = await supabase.from('rsvps').insert([
      {
        full_name: form.fullName.trim(),
        phone: normalisePhone(form.phone),
        attending: form.attending,
        pax: form.attending ? Number(form.pax) : 0,
      },
    ])

    if (error) {
      // The guest sees a calm sentence; we need the real reason. Without this,
      // a missing table and a dropped connection look identical from the page.
      console.error('RSVP insert failed:', error)
      setStatus('error')
      setSubmitError('Couldn’t save your RSVP. Check your connection and try again.')
      return
    }

    setStatus('done')
  }

  /* ---------------------------------------------------------------- done */
  if (status === 'done') {
    const attending = form.attending === true

    return (
      <Section id="rsvp" label="Your reply">
        <div className="perforation relative border-x border-b border-rail bg-card">
          <span aria-hidden="true" className="notch notch-left" />
          <span aria-hidden="true" className="notch notch-right" />

          <div
            ref={confirmationRef}
            tabIndex={-1}
            className="relative overflow-hidden px-6 pt-12 pb-44 text-center sm:px-8 sm:pt-14"
          >
            <p className="heading-display text-[2.5rem] text-rail">
              {couple.groom.first}{' '}
              <br/>
              <span aria-hidden="true" className="text-seal text-[1.6rem]">
                ♥
              </span>
              <br/>
              <span className="sr-only">and</span> {couple.bride.first}
            </p>
            <p className="ticket-data mt-3 text-[2.0rem] text-ink">Thank you</p>
            <p className="mx-auto mt-3 max-w-sm text-[1.0rem] leading-relaxed text-kopi">
              {attending
                ? `See you on ${wedding.dateNumeric}, ${wedding.dayLabel} ${wedding.timeStart} at ${wedding.city}`
                : `We will miss you! Thanks for getting us know.`}
            </p>

            {/* The one bold moment. It lands in the lower band of the stub so it
                reads as stamped onto the ticket without burying the message. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-15 flex justify-center">
              <div
                className={`stamp mix-blend-multiply ${attending ? 'text-seal' : 'text-rail'}`}
                aria-hidden="true"
              >
                <div
                  className={`border-[3px] p-1 opacity-90 ${attending ? 'border-seal' : 'border-rail'}`}
                >
                  <div
                    className={`border px-8 py-5 ${attending ? 'border-seal/60' : 'border-rail/60'}`}
                  >
                    <p className="ticket-data text-[1.0rem] font-bold whitespace-nowrap">
                      {attending ? 'Reserved' : 'Received'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[0.9rem] text-kopi">
          Something changed?{' '}
          <a
            href={whatsappUrl(primary.phone, config.footer.whatsappPrefill)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rail underline-offset-4 transition-colors hover:text-ink hover:decoration-ochre"
          >
            WhatsApp {primary.name}
          </a>{' '}
          and we will sort it out.
        </p>
      </Section>
    )
  }

  /* ---------------------------------------------------------------- form */
  return (
    <Section id="rsvp" title="Reserve" title_zh="预留位子">
      <Reveal>
        <p className="mb-6 text-[1rem] leading-relaxed text-kopi">
          Kindly reply by{' '}
          <span className="font-ticket text-ink">{rsvp.deadlineLabel}</span> so we can get the seating
          right.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="perforation relative border-x border-b border-rail bg-card"
        >
          <span aria-hidden="true" className="notch notch-left" />
          <span aria-hidden="true" className="notch notch-right" />

          <div className="space-y-6 px-5 py-7 sm:px-7">
            <div className="flex items-baseline justify-between border-b border-rail/60 pb-4">
              <span className="ticket-data text-[0.6rem] text-rail">Wedding Ticket</span>
              <span className="ticket-data text-[0.6rem] text-rail">{wedding.dateNumeric}</span>
            </div>

            <Field id="fullName" label="Full name" required error={errors.fullName}>
              {(p) => (
                <input
                  {...p}
                  type="text"
                  autoComplete="name"
                  className={inputClass}
                  value={form.fullName}
                  onChange={set('fullName')}
                />
              )}
            </Field>

            <Field
              id="phone"
              label="Phone"
              required
              hint=""
              error={errors.phone}
            >
              {(p) => (
                <input
                  {...p}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="012-345 6789"
                  className={inputClass}
                  value={form.phone}
                  onChange={set('phone')}
                />
              )}
            </Field>

            <fieldset>
              <legend className="ticket-data text-[0.66rem] text-kopi">
                Can you make it?
                <span aria-hidden="true" className="text-ochre"> *</span>
                <span className="sr-only"> (required)</span>
              </legend>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { id: 'attending-yes', value: true, label: 'Joyfully yes' },
                  { id: 'attending-no', value: false, label: 'Sadly can’t' },
                ].map((option) => {
                  const checked = form.attending === option.value
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-[0.95rem] transition-colors ${
                        checked
                          ? 'border-ink bg-ink text-paper'
                          : 'border-rail text-ink hover:border-kopi/60'
                      }`}
                    >
                      <input
                        id={option.id}
                        type="radio"
                        name="attending"
                        className="sr-only"
                        checked={checked}
                        onChange={() => {
                          setForm((f) => ({ ...f, attending: option.value }))
                          setErrors((e) => ({ ...e, attending: undefined }))
                        }}
                        aria-describedby={errors.attending ? 'attending-error' : undefined}
                      />
                      <span
                        aria-hidden="true"
                        className={`size-3 shrink-0 rounded-full border ${
                          checked ? 'border-paper bg-ochre' : 'border-rail'
                        }`}
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>

              {errors.attending && (
                <p id="attending-error" className="mt-1.5 text-[0.82rem] font-medium text-kopi">
                  {errors.attending}
                </p>
              )}
            </fieldset>

            {form.attending === true && (
              <Field
                id="pax"
                label="Number of seats"
                required
                hint="Including yourself."
                error={errors.pax}
              >
                {(p) => (
                  <input
                    {...p}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={rsvp.maxPax}
                    step="1"
                    className={`${inputClass} font-ticket`}
                    value={form.pax}
                    onChange={set('pax')}
                  />
                )}
              </Field>
            )}

            {/* Honeypot. Bots fill this in; nobody else can see or tab to it. */}
            <div aria-hidden="true" className="absolute -left-[9999px] size-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={set('website')}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'saving'}
                className="w-full bg-ink px-5 py-4 text-[1rem] font-medium text-paper transition-colors hover:bg-kopi disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'saving' ? 'Reserving…' : 'Reserve your seats'}
              </button>

              {submitError && (
                <p role="alert" className="mt-3 text-[0.9rem] leading-relaxed text-kopi">
                  {submitError}{' '}
                  <a
                    href={whatsappUrl(primary.phone, config.footer.whatsappPrefill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-rail underline-offset-4 transition-colors hover:text-ink hover:decoration-ochre"
                  >
                    Or WhatsApp {primary.name} at {primary.display}
                  </a>
                  . Nothing you typed has been lost.
                </p>
              )}
            </div>
          </div>
        </form>
      </Reveal>
    </Section>
  )
}
