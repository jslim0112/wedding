import { useEffect, useState } from 'react'
import { config } from '../config'
import { musicSrc } from '../lib/music'

/* ---------------------------------------------------------------------------
   The front door — a ticket held up over the page until the guest opens it.

   Its real job is the tap. No browser will play sound on a page a visitor has
   not interacted with, and scrolling is deliberately excluded from counting as
   interaction, so a guest who only ever scrolls hears nothing. Rather than
   hoping they tap something eventually, this asks for one tap and gives it a
   meaning: opening the invitation. The music starts inside that same tap.

   Which is why `onOpen` is called first thing in the click handler, before any
   state update or timer. Browsers only honour play() while the gesture is
   still being handled; queue it behind an await or a setTimeout and the sound
   is refused even though the guest did tap.

   The screen sits on ink, the same colour as the hero behind it, so it lifts
   away into the page rather than cutting to it.
--------------------------------------------------------------------------- */

const FADE_OUT_MS = 500

export default function EntryGate({ onOpen }) {
  const { couple, wedding, music } = config
  const [phase, setPhase] = useState('shown') // shown -> leaving -> gone

  // Nothing to gate if there is no song: the tap would buy nothing, so the
  // guest goes straight to the page.
  const enabled = music.entryScreen && Boolean(musicSrc())

  // Hold the page still underneath. Restores whatever was there before, so
  // this cannot fight with anything else that touches overflow later.
  useEffect(() => {
    if (!enabled || phase === 'gone') return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [enabled, phase])

  if (!enabled || phase === 'gone') return null

  const open = () => {
    if (phase !== 'shown') return
    onOpen?.() // First. The gesture is still live only right here.
    setPhase('leaving')
    setTimeout(() => setPhase('gone'), FADE_OUT_MS)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-names"
      onClick={open}
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink px-6 transition-opacity duration-500 ${
        phase === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-[380px] bg-card px-7 pt-8 pb-7 text-center text-ink shadow-[0_12px_44px_rgba(0,0,0,0.45)]">
        <p className="ticket-data text-[0.55rem] text-rail">Right Time, Right Moment</p>

        <h1 id="entry-names" className="name-display mt-5 text-[2.6rem] leading-tight text-ink">
          {couple.groom.full}
          <span className="ticket-data my-1 block text-[0.55rem] text-rail">and</span>
          {couple.bride.full}
        </h1>

        <p className="ticket-data mt-5 text-[0.58rem] leading-relaxed text-rail">
          {wedding.dayLabel} · {wedding.dateLong}
        </p>

        {/* The stub, torn along the same perforation as the RSVP ticket. */}
        <div className="perforation mt-7 pt-6">
          <button
            type="button"
            autoFocus
            onClick={open}
            className="flex w-full items-center justify-center gap-2.5 bg-ink px-5 py-4 text-[0.95rem] font-medium text-paper transition-colors hover:bg-kopi"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M6.5 3.6l14 8.4-14 8.4z" />
            </svg>
            Open invitation
          </button>

          <p className="ticket-data mt-3 text-[0.5rem] leading-relaxed text-rail">
            Music plays when you open
          </p>
        </div>
      </div>
    </div>
  )
}
