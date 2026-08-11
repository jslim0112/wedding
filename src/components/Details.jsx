import { config } from '../config'
import { buildIcs, downloadIcs, googleMapsUrl, mapEmbedUrl, wazeUrl } from '../lib/format'
import Section from './ui/Section'
import Reveal from './ui/Reveal'

function Row({ term, children }) {
  return (
    <div className="border-b border-rail/60 py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="ticket-data text-[0.6rem] text-rail sm:pt-1">{term}</dt>
      <dd className="mt-1 text-[1rem] leading-relaxed text-kopi sm:mt-0">{children}</dd>
    </div>
  )
}

export default function Details() {
  const { wedding, venue, couple, site } = config

  const handleAddToCalendar = () => {
    const ics = buildIcs({
      title: `${couple.groom.first} & ${couple.bride.first}’s wedding`,
      description: `We're getting married at ${venue.name}, Kluang. ${site.url}`,
      location: `${venue.name}, ${venue.address}`,
      startISO: wedding.startISO,
      endISO: wedding.endISO,
      url: site.url,
    })
    downloadIcs(ics, 'kluang-wedding.ics')
  }

  return (
    <Section id="details" label="The details" title="Getting there">
      <Reveal>
        <dl className="border-t border-rail/60">
          <Row term="Date">
            {wedding.dayLabel}, {wedding.dateLong}
          </Row>
          <Row term="Time">{wedding.timeLabel}</Row>
          <Row term="Venue">
            <span className="text-ink">{venue.name}</span>
            <br />
            {venue.address}
          </Row>
          {venue.dressCode && <Row term="Dress code">{venue.dressCode}</Row>}
          <Row term="Parking">{venue.parking}</Row>
        </dl>
      </Reveal>

      <Reveal className="mt-8" delay={60}>
        <div className="border border-rail">
          <iframe
            title={`Map showing ${venue.name}`}
            src={mapEmbedUrl(venue.lat, venue.lng)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-64 w-full border-0 sm:h-72"
          />
        </div>

        {/* Waze first - it is what most people in Malaysia actually navigate with. */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a
            href={wazeUrl(venue.lat, venue.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ink px-5 py-3.5 text-center text-[0.95rem] font-medium text-paper transition-colors hover:bg-kopi"
          >
            Open in Waze
          </a>
          <a
            href={googleMapsUrl(venue.lat, venue.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink px-5 py-3.5 text-center text-[0.95rem] font-medium text-ink transition-colors hover:border-ochre hover:text-kopi"
          >
            Open in Google Maps
          </a>
        </div>

        <button
          type="button"
          onClick={handleAddToCalendar}
          className="ticket-data mt-4 w-full border border-dashed border-rail px-5 py-3 text-[0.62rem] text-kopi transition-colors hover:border-ochre hover:text-ink"
        >
          Add to your calendar
        </button>
      </Reveal>
    </Section>
  )
}
