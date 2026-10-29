import { config } from '../config'
import { buildIcs, downloadIcs, googleCalendarUrl } from './format'

/**
 * The one description of the day that every calendar button uses. Written here
 * rather than in a component because two places offer the invitation - the
 * details section and the RSVP confirmation - and the wording, the venue and
 * the hours must not drift apart between them.
 */
function weddingEvent() {
  const { wedding, venue, couple, site } = config
  return {
    title: `${couple.groom.first} & ${couple.bride.first}’s Wedding`,
    description: `See you soon! ${site.url}`,
    location: `${venue.name}, ${venue.address}`,
    startISO: wedding.startISO,
    endISO: wedding.endISO,
    url: site.url,
  }
}

/**
 * What the guest is holding: 'ios' for an iPhone or iPad, 'android' for an
 * Android phone or tablet, otherwise 'desktop' (a laptop or computer). iPadOS
 * says it is a Mac, so a Mac that takes touch is an iPad.
 */
export function calendarDevice() {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

/**
 * Opened in a new tab; Google asks the guest to confirm before it saves. A
 * phone gets Google's mobile form, a computer the full page.
 */
export function weddingGoogleCalendarUrl() {
  return googleCalendarUrl(weddingEvent(), calendarDevice() !== 'desktop')
}

/**
 * Apple Calendar, Outlook and every phone that isn't signed into Google all
 * read the same .ics file, so one download serves the lot. On an iPhone the
 * file opens straight into Calendar.
 */
export function downloadWeddingIcs() {
  downloadIcs(buildIcs(weddingEvent()), 'kluang-wedding.ics')
}
