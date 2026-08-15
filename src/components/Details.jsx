import { config } from '../config'
import { buildIcs, downloadIcs, googleMapsUrl, mapEmbedUrl, wazeUrl } from '../lib/format'
import Section from './ui/Section'
import Reveal from './ui/Reveal'

function Row({ term, term_zh, children }) {
  return (
    <div className="border-b border-rail/60 py-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="ticket-data text-[1.0rem] text-rail sm:pt-1"><b>{term} {term_zh}</b></dt>
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
    <Section id="details" title="Details" title_zh="详情">
      <Reveal>
        <dl className="border-t border-rail/60">
          <Row term="Date" term_zh="日期">
            {wedding.dayLabel}, {wedding.dateNumeric}
          </Row>
          <Row term="Time" term_zh="时间">{wedding.timeLabel}</Row>
          <Row term="Venue" term_zh="地点">
            <span className="text-ink">{venue.name} {venue.name_zh}</span>
            <br />
            {venue.address}
          </Row>
          {venue.dressCode && <Row term="Dress code">{venue.dressCode}</Row>}
          <Row term="Parking" term_zh="停车位">{venue.parking}<br/>{venue.parking_zh}</Row>
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
      </Reveal>
    </Section>
  )
}
