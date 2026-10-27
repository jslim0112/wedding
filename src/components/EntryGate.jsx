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
        <p className="ticket-data text-[0.8rem] text-rail">Right Time<b> · </b>Right Moment</p>

        <h1 id="entry-names" className="name-display mt-5 text-[2.6rem] leading-tight text-ink">
          {couple.groom.full}
          {couple.groom.zh && <span className="zh mt-1 block text-[1.5rem]">{couple.groom.zh}</span>}
          <span aria-hidden="true" className="text-seal text-[1.6rem] mt-3 mb-0 block text-[0.55rem]">
            ♥
          </span>
          {couple.bride.full}
          {couple.bride.zh && <span className="zh mt-1 block text-[1.5rem]">{couple.bride.zh}</span>}
        </h1>

        <p className="ticket-data mt-5 text-[1.0rem] leading-relaxed text-rail">
          We wish to invite you
        </p>
        <p className="zh mt-0.5 text-[1.0rem] text-rail">诚意邀请</p>
        {/* The stub, torn along the same perforation as the RSVP ticket. */}
        <div className="perforation mt-7 pt-6">
          <button
            type="button"
            autoFocus
            onClick={open}
            className="gate-button flex w-full items-center justify-center gap-2.5 bg-ink px-5 py-4 text-[1.05rem] font-semibold text-paper transition-colors hover:bg-kopi"
          >
            {/* Each language holds together, so a narrow phone drops the
                Chinese to its own line rather than splitting the English. */}
            <span>
              <span className="whitespace-nowrap">Open invitation 点击进入</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
