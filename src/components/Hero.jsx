import { config } from '../config'

function Name({ person }) {
  return (
    <span className="block">
      {person.full}
      {person.zh && <span className="zh mt-2 block text-[0.28em] tracking-[0.12em]">{person.zh}</span>}
    </span>
  )
}

export default function Hero() {
  const { couple, wedding, venue, hero } = config

  return (
    <header className="relative isolate flex min-h-svh flex-col justify-between overflow-hidden bg-ink text-paper">
      {/* Photo, with a flat ink wash over it so the type always has contrast. */}
      <div className="absolute inset-0 -z-10">
        {hero.photo.src ? (
          <>
            <img
              src={hero.photo.src}
              alt={hero.photo.alt}
              fetchPriority="high"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-ink/70" />
          </>
        ) : (
          <div className="flex size-full items-start justify-center bg-ink pt-28">
            <p className="ticket-data max-w-[16rem] text-center text-[0.58rem] text-paper/20">
              {hero.photo.slot}
            </p>
          </div>
        )}
      </div>

      {/* Ticket header strip */}
      <div className="mx-auto w-full max-w-[680px] px-6 pt-6">
        <div className="flex items-baseline justify-between border-b border-paper/25 pb-3">
          <span className="ticket-data text-[0.8rem] text-paper/70">{wedding.place}</span>
          <span className="ticket-data text-[0.8rem] text-paper/70">{wedding.dateShort}</span>
        </div>
      </div>

      {/* Names */}
      <div className="mx-auto w-full max-w-[680px] px-6 py-10 text-center">
        <p className="ticket-data mb-8 text-[1.2rem] text-paper/60"><b>You are invited</b></p>

        <h1 className="name-display text-[3.4rem] text-paper sm:text-[5.5rem]">
          <Name person={couple.groom} />
          {/* Inline SVG rather than the ❤️ emoji: every OS draws its own emoji,
              so this keeps one shape and one red across all of them. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mx-auto my-4 block size-6 text-seal sm:size-9"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="sr-only">and</span>
          <Name person={couple.bride} />
        </h1>

        <p className="ticket-data mt-9 text-[0.62rem] leading-relaxed text-paper/75">
          {wedding.dayLabel} · {wedding.dateLong}
        </p>
      </div>

      {/* The ticket card */}
      <div className="mx-auto w-full max-w-[680px] px-6 pb-10">
        <div className="flex border-l-4 border-ochre bg-card text-ink shadow-[0_1px_0_rgba(22,48,43,0.25)]">
          <div className="w-full px-5 py-5 sm:px-6">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div className="min-w-0">
                <dt className="ticket-data text-[0.58rem] text-rail">Date</dt>
                <dd className="ticket-data mt-1 text-[0.72rem] text-ink">{wedding.dateShort}</dd>
              </div>
              <div className="min-w-0">
                <dt className="ticket-data text-[0.58rem] text-rail">Time</dt>
                <dd className="ticket-data mt-1 text-[0.72rem] text-ink">{wedding.timeCompact}</dd>
              </div>
              <div className="col-span-2">
                <dt className="ticket-data text-[0.58rem] text-rail">Boarding at</dt>
                <dd className="mt-1 text-[0.95rem] leading-snug text-ink">{venue.name}</dd>
              </div>
            </dl>

            <a
              href="#rsvp"
              className="mt-5 block w-full bg-ink px-5 py-3.5 text-center text-[0.95rem] font-medium text-paper transition-colors hover:bg-kopi"
            >
              Reserve your seats
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
