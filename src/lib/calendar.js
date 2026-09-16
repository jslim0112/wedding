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
    title: `${couple.groom.first} & ${couple.bride.first}’s wedding`,
    description: `We're getting married at ${venue.name}, ${wedding.city}. ${site.url}`,
    location: `${venue.name}, ${venue.address}`,
    startISO: wedding.startISO,
    endISO: wedding.endISO,
    url: site.url,
  }
}

/** Opened in a new tab; Google asks the guest to confirm before it saves. */
export function weddingGoogleCalendarUrl() {
  return googleCalendarUrl(weddingEvent())
}

/**
 * Apple Calendar, Outlook and every phone that isn't signed into Google all
 * read the same .ics file, so one download serves the lot. On an iPhone the
 * file opens straight into Calendar.
 */
export function downloadWeddingIcs() {
  downloadIcs(buildIcs(weddingEvent()), 'kluang-wedding.ics')
}
