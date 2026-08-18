/* ---------------------------------------------------------------------------
   Small pure helpers: phone normalising, the calendar file, map links, and the
   countdown maths. Kept out of the components so each one can be reasoned
   about (and poked at in the console) on its own.
--------------------------------------------------------------------------- */

/**
 * Normalise a Malaysian mobile number to 60XXXXXXXXX.
 * Accepts '012-345 6789', '+60 12 345 6789', '0123456789', '60123456789'.
 */
export function normalisePhone(input) {
  const digits = String(input ?? '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('60')) return digits
  if (digits.startsWith('0')) return `60${digits.slice(1)}`
  return `60${digits}`
}

/** True for a plausible Malaysian number once normalised (10-12 digits). */
export function isValidPhone(input) {
  return /^60\d{8,10}$/.test(normalisePhone(input))
}

/** Format 60123456789 back to 012-345 6789 for display. */
export function displayPhone(normalised) {
  const local = `0${String(normalised).replace(/^60/, '')}`
  const m = local.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (m) return `${m[1]}-${m[2]} ${m[3]}`
  const m4 = local.match(/^(\d{3})(\d{4})(\d{4})$/)
  if (m4) return `${m4[1]}-${m4[2]} ${m4[3]}`
  return local
}

export function whatsappUrl(phone, text) {
  return `https://wa.me/${normalisePhone(phone)}?text=${encodeURIComponent(text)}`
}

export function wazeUrl(lat, lng) {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
}

export function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/** Keyless embed - no API key needed, works in a plain iframe. */
export function mapEmbedUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`
}

/* --------------------------------------------------------------------------
   Countdown
-------------------------------------------------------------------------- */

/**
 * Time remaining until an ISO timestamp. The wedding timestamp carries a
 * +08:00 offset, so this is correct no matter what timezone the guest's phone
 * is set to. Never returns negative values.
 */
export function getTimeLeft(targetISO, now = Date.now()) {
  const diff = new Date(targetISO).getTime() - now
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  }
}

/**
 * The wedding month laid out as a Monday-first grid, for the calendar card.
 *
 * The date parts are read straight off the ISO string and every calculation
 * runs through UTC, so no local offset can shift the highlighted day — a guest
 * opening this in Honolulu still sees the 13th ringed, not the 12th.
 *
 * Returns null for anything that is not an ISO date, so the card can simply
 * not render rather than throw.
 */
export function getMonthMatrix(targetISO) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(targetISO ?? ''))
  if (!parts) return null

  const year = Number(parts[1])
  const month = Number(parts[2]) // 1-12, not the 0-11 Date uses
  const day = Number(parts[3])

  // Sunday is 0 in JS. The card runs Monday to Sunday, so shift the week round.
  const mondayFirst = (jsDay) => (jsDay + 6) % 7

  const firstColumn = mondayFirst(new Date(Date.UTC(year, month - 1, 1)).getUTCDay())
  // Day 0 of the next month is the last day of this one.
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  const cells = [
    ...Array(firstColumn).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad the last row out so the grid stays rectangular.
  while (cells.length % 7) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return {
    year,
    month,
    day,
    // 0 = Monday, matching the column order printed on the card.
    weekdayIndex: mondayFirst(new Date(Date.UTC(year, month - 1, day)).getUTCDay()),
    weeks,
  }
}

/* --------------------------------------------------------------------------
   Calendar file, generated client-side
-------------------------------------------------------------------------- */

function toIcsStamp(iso) {
  // 2027-03-13T19:00:00+08:00 -> 20270313T110000Z
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** RFC 5545 asks for lines under 75 octets, folded with a leading space. */
function foldLine(line) {
  if (line.length <= 74) return line
  const chunks = [line.slice(0, 74)]
  let rest = line.slice(74)
  while (rest.length > 73) {
    chunks.push(` ${rest.slice(0, 73)}`)
    rest = rest.slice(73)
  }
  if (rest) chunks.push(` ${rest}`)
  return chunks.join('\r\n')
}

export function buildIcs({ title, description, location, startISO, endISO, url }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Kluang Line//Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:kluang-wedding-${toIcsStamp(startISO)}@jslim0112.github.io`,
    `DTSTAMP:${toIcsStamp(new Date().toISOString())}`,
    `DTSTART:${toIcsStamp(startISO)}`,
    `DTEND:${toIcsStamp(endISO)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    url ? `URL:${escapeIcsText(url)}` : null,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Wedding tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)

  return lines.map(foldLine).join('\r\n')
}

export function downloadIcs(icsText, filename = 'wedding.ics') {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Give Safari a moment before revoking, or the download never starts.
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}
