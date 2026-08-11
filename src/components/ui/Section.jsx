import Reveal from './Reveal'

/**
 * One scrolling section: a 680px document column with a station marker that
 * sits on the route line running down the left edge. The marker and the line
 * are desktop-only and deliberately quiet.
 */
export default function Section({ id, label, title, children, className = '' }) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-[680px] px-6 py-16 sm:py-20 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[4.9rem] left-0 hidden size-[9px] -translate-x-1/2 rounded-full border border-rail bg-paper lg:block"
      />

      {(label || title) && (
        <Reveal as="header" className="mb-8">
          {label && <p className="ticket-data text-[0.68rem] text-rail">{label}</p>}
          {title && (
            <h2 className="heading-display mt-2 text-[1.75rem] text-ink sm:text-4xl">{title}</h2>
          )}
        </Reveal>
      )}

      {children}
    </section>
  )
}
