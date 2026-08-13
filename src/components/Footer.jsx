import { config } from '../config'
import { whatsappUrl } from '../lib/format'

export default function Footer() {
  const { contacts, footer, couple, wedding } = config

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto w-full max-w-[680px] px-6 py-16 text-center sm:py-20">
        <p className="ticket-data text-[0.6rem] text-paper/55">End of line</p>

        <h2 className="heading-display mt-4 text-[2.4rem] sm:text-[3.2rem]">Questions? Just ask.</h2>

        <p className="mx-auto mt-4 max-w-md text-[1rem] leading-relaxed text-paper/80">
          {footer.thanks}
        </p>

        <div className="mt-9 grid gap-2 sm:grid-cols-2">
          {contacts.map((contact) => (
            <a
              key={contact.phone}
              href={whatsappUrl(contact.phone, footer.whatsappPrefill)}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-paper/35 px-5 py-3.5 text-[0.95rem] transition-colors hover:border-ochre hover:text-ochre"
            >
              WhatsApp {contact.name}
              <span className="ticket-data mt-1 block text-[0.58rem] text-paper/55">
                {contact.display}
              </span>
            </a>
          ))}
        </div>

        <p className="ticket-data mt-12 text-[0.55rem] leading-relaxed text-paper/40">
          {couple.groom.full} &amp; {couple.bride.full}
          <span className="mt-1 block">
            {wedding.place} · {wedding.dateShort}
          </span>
        </p>
      </div>
    </footer>
  )
}
