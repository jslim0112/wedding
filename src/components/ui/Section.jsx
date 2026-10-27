import { config } from '../../config'
import Reveal from './Reveal'
import Divider from './Divider'

/**
 * One scrolling section: a 680px document column with a station marker that
 * sits on the route line running down the left edge. The marker and the line
 * are desktop-only and deliberately quiet.
 *
 * Unless `divider` is false, the rule between sections sits on its top edge -
 * exactly halfway between this section's content and the last one's, since
 * both pad by the same amount. It belongs to the section rather than being
 * placed between them so a section that draws nothing takes its rule with it.
 */
export default function Section({
  id,
  label,
  label_zh,
  title,
  title_zh,
  divider = true,
  children,
  className = '',
}) {
  return (
    <section
      id={id}
      className={`relative mx-auto w-full max-w-[680px] px-6 py-16 sm:py-20 ${className}`}
    >
      {divider && config.decorations?.dividers && (
        <Divider className="pointer-events-none absolute inset-x-6 top-0 -translate-y-1/2" />
      )}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[4.9rem] left-0 hidden size-[9px] -translate-x-1/2 rounded-full border border-rail bg-paper lg:block"
      />

      {(label || label_zh || title || title_zh) && (
        <Reveal as="header" className="mb-8">
          {(label || label_zh) && (
            <p className="ticket-data text-[0.68rem] text-rail">
              {label}
              {label_zh && <span className="zh ml-1.5 normal-case">{label_zh}</span>}
            </p>
          )}
          {title && title_zh && (
            <h2 className="heading-display mt-2 text-[2.6rem] text-ink sm:text-[3.4rem]">
              {title} <span className="text-[1.8rem]">{title_zh}</span>
            </h2>
          )}
          {title && !title_zh && (
            <h2 className="heading-display mt-2 text-[2.6rem] text-ink sm:text-[3.4rem]">
              {title}
            </h2>
          )}
        </Reveal>
      )}

      {children}
    </section>
  )
}
