import { config } from '../config'
import { whatsappUrl } from '../lib/format'

export default function Footer() {
  const { contacts, footer, couple, wedding } = config

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto w-full max-w-[680px] px-6 pt-16 pb-26 text-center sm:py-20">
        <p className="ticket-data text-[0.6rem] text-paper/55"></p>
        <p className="mx-auto mt-4 max-w-md text-[1rem] leading-relaxed text-paper/80">
          {footer.thanks}
        </p>
      </div>
    </footer>
  )
}
