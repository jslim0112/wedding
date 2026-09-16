import { useEffect, useRef, useState } from 'react'
import { config } from '../config'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { normalisePhone, isValidPhone, whatsappUrl } from '../lib/format'
import { downloadWeddingIcs, weddingGoogleCalendarUrl } from '../lib/calendar'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Field, { inputClass } from './ui/Field'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  attending: null, // null until chosen, so "required" means something
  // Both blank on purpose - a prefilled number gets submitted unread. Adults is
  // required; children stays optional, and blank counts as none.
  adults: '',
  children: '',
  website: '', // honeypot
}

/** Blank means none. Kept in one place so the form and the insert agree. */
function seatCount(value) {
  return value.trim() === '' ? 0 : Number(value)
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

  // Every message is a pair - the guest reads whichever half they read.
  function validate() {
    const next = {}
    const name = form.fullName.trim()

    if (name.length < 2)
      next.fullName = {
        en: 'Please tell us your name so we know who to expect.',
        zh: '请填写您的姓名，让我们知道是谁来。',
      }
    else if (name.length > 100)
      next.fullName = {
        en: 'That is longer than we can save — please shorten it.',
        zh: '名字太长了，请缩短一些。',
      }

    if (!form.phone.trim())
      next.phone = {
        en: 'We need a number in case plans change on the day.',
        zh: '请留下联络电话，以便当天有变动时联系您。',
      }
    else if (!isValidPhone(form.phone))
      next.phone = {
        en: 'That does not look like a Malaysian mobile number. Try 012-345 6789.',
        zh: '这看来不像马来西亚手机号码，例如 012-345 6789。',
      }

    if (form.attending === null)
      next.attending = {
        en: 'Let us know if you can make it.',
        zh: '请告诉我们您能否出席。',
      }

    if (form.attending === true) {
      const adults = seatCount(form.adults)
      const children = seatCount(form.children)

      if (!form.adults.trim())
        next.adults = {
          en: 'Tell us how many adults to seat.',
          zh: '请填写成人人数。',
        }
      else if (!Number.isInteger(adults) || adults < 1 || adults > rsvp.maxPax)
        next.adults = {
          en: `Pick a number between 1 and ${rsvp.maxPax}.`,
          zh: `请填写 1 至 ${rsvp.maxPax} 之间的数字。`,
        }

      if (form.children.trim() && (!Number.isInteger(children) || children < 0 || children > rsvp.maxPax))
        next.children = {
          en: `Pick a number between 0 and ${rsvp.maxPax}, or leave it blank.`,
          zh: `请填写 0 至 ${rsvp.maxPax} 之间的数字，或留空。`,
        }

      // Only worth saying once both halves are otherwise sound - otherwise a
      // typo in one box reads as two complaints about the same mistake.
      if (!next.adults && !next.children && adults + children > rsvp.maxPax)
        next.adults = {
          en: `That is ${adults + children} seats in total — we can hold up to ${rsvp.maxPax}. WhatsApp us for a larger party.`,
          zh: `总共 ${adults + children} 位，我们最多只能预留 ${rsvp.maxPax} 位。人数较多请 WhatsApp 我们。`,
        }
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
      setSubmitError({
        en: 'This site is not connected to its database yet. Please WhatsApp us instead — we will add you by hand.',
        zh: '网站尚未连接数据库，请直接 WhatsApp 我们，我们会为您手动登记。',
      })
      return
    }

    const adults = form.attending ? seatCount(form.adults) : 0
    const children = form.attending ? seatCount(form.children) : 0

    // INSERT only. Never chain .select() here — RLS allows insert and not
    // select, so a select would error on a row that saved perfectly well.
    //
    // pax stays the total of the two. It is what the seating plan is counted
    // from, and keeping it means every row exported before the split still
    // lines up with the ones after it.
    const { error } = await supabase.from('rsvps').insert([
      {
        full_name: form.fullName.trim(),
        phone: normalisePhone(form.phone),
        attending: form.attending,
        adults,
        children,
        pax: adults + children,
      },
    ])

    if (error) {
      // The guest sees a calm sentence; we need the real reason. Without this,
      // a missing table and a dropped connection look identical from the page.
      console.error('RSVP insert failed:', error)
      setStatus('error')
      setSubmitError({
        en: 'Couldn’t save your RSVP. Check your connection and try again.',
        zh: '无法保存您的回复，请检查网络后再试一次。',
      })
      return
    }

    setStatus('done')
  }

  /* ---------------------------------------------------------------- done */
  if (status === 'done') {
    const attending = form.attending === true
    const adults = seatCount(form.adults)
    const children = seatCount(form.children)

    // Printed back so a guest can see the seats they actually asked for
    // without having to remember what they typed.
    const seatsEn = [
      `${adults} ${adults === 1 ? 'adult' : 'adults'}`,
      children > 0 ? `${children} ${children === 1 ? 'child' : 'children'}` : null,
    ]
      .filter(Boolean)
      .join(' · ')
    const seatsZh = [`成人 ${adults} 位`, children > 0 ? `小孩 ${children} 位` : null]
      .filter(Boolean)
      .join(' · ')

    return (
      <Section id="rsvp" label="Your reply" label_zh="您的回复">
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
            <p className="zh text-[1.4rem] leading-tight text-ink">谢谢您</p>
            <p className="mx-auto mt-3 max-w-sm text-[1.0rem] leading-relaxed text-kopi">
              {attending
                ? `See you on ${wedding.dateNumeric}, ${wedding.dayLabel} ${wedding.timeStart} at ${wedding.city}`
                : `We will miss you! Thanks for getting us know.`}
              <span className="zh mt-1 block">
                {attending
                  ? `${wedding.dateNumeric}（${wedding.dayLabel_zh}）${wedding.timeStart}，${wedding.city_zh}见`
                  : '我们会想念您！谢谢您的回复。'}
              </span>
            </p>

            {attending && (
              <p className="mt-4 border-t border-rail/40 pt-4 mx-auto max-w-[16rem]">
                <span className="ticket-data text-[0.62rem] text-rail">Seats reserved</span>
                <span className="ticket-data mt-1 block text-[1rem] text-ink">{seatsEn}</span>
                <span className="zh block text-[0.9rem] text-kopi">{seatsZh}</span>
              </p>
            )}

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

        {/* Only for guests who are coming - there is nothing to save for the
            ones who can't. Sits under the stub rather than on it so the stamp
            stays the last thing on the ticket. */}
        {attending && (
          <div className="mt-8">
            <p className="ticket-data text-center text-[0.66rem] text-rail">
              Keep the date
              <span className="zh ml-1.5 normal-case">记下这个日子</span>
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <a
                href={weddingGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink px-5 py-3.5 text-center text-[0.95rem] font-medium text-paper transition-colors hover:bg-kopi"
              >
                Add to Google Calendar
                <span className="zh mt-0.5 block text-[0.85rem]">加入 Google 日历</span>
              </a>
              <button
                type="button"
                onClick={downloadWeddingIcs}
                className="border border-ink px-5 py-3.5 text-center text-[0.95rem] font-medium text-ink transition-colors hover:border-ochre hover:text-kopi"
              >
                Add to Apple Calendar
                <span className="zh mt-0.5 block text-[0.85rem]">加入 Apple 日历</span>
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-[0.9rem] text-kopi">
          Something changed?{' '}
          WhatsApp {primary.name}{' '}
          and we will sort it out.
          <span className="zh mt-1 block">
            计划有变？WhatsApp {primary.name}，我们会为您处理。
          </span>
        </p>
      </Section>
    )
  }

  /* ---------------------------------------------------------------- form */

  // "Reserve your seats" is a promise of a chair, so a guest who has just said
  // they can't come should not be asked to press it. Before either box is
  // ticked the button keeps the section's own word for it.
  const submitLabel =
    status === 'saving'
      ? form.attending === false
        ? { en: 'Sending…', zh: '送出中…' }
        : { en: 'Reserving…', zh: '预留中…' }
      : form.attending === false
        ? { en: 'Send your reply', zh: '送出回复' }
        : { en: 'Reserve your seats', zh: '预留位子' }

  return (
    <Section id="rsvp" title="Reserve" title_zh="预留位子">
      <Reveal>
        <p className="mb-6 text-[1rem] leading-relaxed text-kopi">
          Kindly reply by{' '}
          <span className="font-ticket text-ink">{rsvp.deadlineLabel}</span> so we can get the seating
          right.
          <span className="zh mt-1 block">
            请于 <span className="font-ticket text-ink">{rsvp.deadlineLabel}</span> 之前回复，
            以便我们安排座位。
          </span>
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
              <span className="ticket-data text-[0.6rem] text-rail">
                Wedding Ticket
                <span className="zh ml-1.5 normal-case">喜宴入场券</span>
              </span>
              <span className="ticket-data text-[0.6rem] text-rail">{wedding.dateNumeric}</span>
            </div>

            <Field
              id="fullName"
              label="Full name"
              label_zh="姓名"
              required
              error={errors.fullName}
            >
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
              label_zh="联络电话"
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
                <span className="zh ml-1.5 normal-case">能出席吗？</span>
                <span aria-hidden="true" className="text-ochre"> *</span>
                <span className="sr-only"> (required)</span>
              </legend>

              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  { id: 'attending-yes', value: true, label: 'Joyfully yes', label_zh: '乐意出席' },
                  { id: 'attending-no', value: false, label: 'Sadly can’t', label_zh: '抱歉缺席' },
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
                      <span>
                        {option.label}
                        <span className="zh mt-0.5 block text-[0.85rem] opacity-80">
                          {option.label_zh}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>

              {errors.attending && (
                <p id="attending-error" className="mt-1.5 text-[0.82rem] font-medium text-kopi">
                  {errors.attending.en}
                  <span className="zh mt-0.5 block">{errors.attending.zh}</span>
                </p>
              )}
            </fieldset>

            {/* Two boxes rather than one total, because the caterer counts a
                child's seat differently from an adult's. */}
            {form.attending === true && (
              <div>
                <p className="ticket-data text-[0.66rem] text-kopi">
                  Number of seats
                  <span className="zh ml-1.5 normal-case">出席人数</span>
                </p>

                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  <Field
                    id="adults"
                    label="Adults"
                    label_zh="成人"
                    required
                    hint="Including yourself."
                    hint_zh="包括您本人。"
                    error={errors.adults}
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
                        value={form.adults}
                        onChange={set('adults')}
                      />
                    )}
                  </Field>

                  <Field
                    id="children"
                    label="Children"
                    label_zh="小孩"
                    hint="Below 12."
                    hint_zh="12 岁以下。"
                    error={errors.children}
                  >
                    {(p) => (
                      <input
                        {...p}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        max={rsvp.maxPax}
                        step="1"
                        placeholder="0"
                        className={`${inputClass} font-ticket`}
                        value={form.children}
                        onChange={set('children')}
                      />
                    )}
                  </Field>
                </div>
              </div>
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
                {submitLabel.en}
                <span className="zh mt-0.5 block text-[0.85rem]">{submitLabel.zh}</span>
              </button>

              {submitError && (
                <p role="alert" className="mt-3 text-[0.9rem] leading-relaxed text-kopi">
                  {submitError.en}{' '}
                  <a
                    href={whatsappUrl(primary.phone, config.footer.whatsappPrefill)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-rail underline-offset-4 transition-colors hover:text-ink hover:decoration-ochre"
                  >
                    Or WhatsApp {primary.name} at {primary.display}
                  </a>
                  . Nothing you typed has been lost.
                  <span className="zh mt-1 block">
                    {submitError.zh} 您填写的内容不会遗失。
                  </span>
                </p>
              )}
            </div>
          </div>
        </form>
      </Reveal>
    </Section>
  )
}
