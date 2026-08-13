import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { config } from '../config'
import { musicSrc } from '../lib/music'

/* ---------------------------------------------------------------------------
   The floating music player — a small ticket stub pinned to the bottom-left
   corner of every screen.

   With config.music.autoplay on it starts the song by itself, in two attempts:

   1. When the page finishes loading. Chrome, Safari and Firefox all block
      unprompted sound until a site has earned it, so on a guest's first visit
      this is refused - play() returns a rejected promise and nothing happens.
      It succeeds on a return visit, on desktop Chrome once the site has built
      up media-engagement history, and anywhere the guest has already
      interacted. No amount of code changes that: the only audio a browser will
      start unprompted is muted audio, which is not music.
   2. On the first tap or key press anywhere on the page. That is a real user
      gesture, which every browser accepts, so this is the one that actually
      starts the music for most guests. It is armed before the page is even
      painted, so there is no window in which an early tap is missed.

   Two rules on top of that. Pause is a decision: once a guest pauses, neither
   attempt runs again for the rest of the visit. And it fades - music arriving
   at full volume in a silent room is a shock, so volume ramps over ~700ms in
   both directions.

   With no song configured this renders nothing at all - no empty stub, no gap.
--------------------------------------------------------------------------- */

const FADE_MS = 700
const FADE_STEP_MS = 50

export default function MusicPlayer({ ref }) {
  const { music } = config
  const src = musicSrc()

  const audioRef = useRef(null)
  const rootRef = useRef(null)
  const fadeRef = useRef(null)
  const pausedByGuestRef = useRef(false)
  // iOS refuses to let a script touch the volume - the hardware buttons own it
  // there, and writes to audio.volume are dropped on the floor. Probed once at
  // mount so the fades can be skipped rather than turning into dead delay.
  const canFadeRef = useRef(true)

  const [playing, setPlaying] = useState(false)
  // The browser refused the on-load start. Only used to change the player's
  // label to something that tells the guest what will fix it.
  const [autoplayRefused, setAutoplayRefused] = useState(false)
  // The file is missing or the format is unsupported. Nothing a guest can do
  // about it, so the player removes itself rather than sitting there broken.
  const [broken, setBroken] = useState(false)

  /* Runs before the two autoplay effects below, while the audio is still
     paused and silent, so the probe itself is never audible. */
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const before = audio.volume
    audio.volume = 0.5
    canFadeRef.current = audio.volume === 0.5
    audio.volume = before
  }, [])

  /* Ramp the volume, cancelling any ramp already in flight - otherwise a quick
     pause-play-pause leaves two intervals fighting over the same property. */
  const fadeTo = (target, onDone) => {
    const audio = audioRef.current
    if (!audio) return

    clearInterval(fadeRef.current)
    const steps = Math.max(1, Math.round(FADE_MS / FADE_STEP_MS))
    const stepSize = (target - audio.volume) / steps
    let step = 0

    fadeRef.current = setInterval(() => {
      step += 1
      const next = step >= steps ? target : audio.volume + stepSize
      audio.volume = Math.min(1, Math.max(0, next))
      if (step >= steps) {
        clearInterval(fadeRef.current)
        onDone?.()
      }
    }, FADE_STEP_MS)
  }

  /* Resolves true if the song is now playing. Resolves false if the browser
     refused - which is normal, not an error - so the caller can leave the
     button on "play" and wait for a gesture it will accept. */
  const start = async () => {
    const audio = audioRef.current
    if (!audio) return false

    clearInterval(fadeRef.current)
    // Only rewind the ramp, not the track - resuming mid-song is the point.
    if (canFadeRef.current && audio.paused) audio.volume = 0

    try {
      await audio.play()
    } catch {
      return false
    }
    if (canFadeRef.current) fadeTo(music.volume ?? 0.55)
    return true
  }

  const stop = () => {
    const audio = audioRef.current
    if (!audio) return

    // Without a working fade, ramping first would only delay the pause by
    // 700ms of full-volume music - the opposite of what a pause button means.
    if (!canFadeRef.current) {
      clearInterval(fadeRef.current)
      audio.pause()
      return
    }
    fadeTo(0, () => audio.pause())
  }

  const toggle = () => {
    if (playing) {
      pausedByGuestRef.current = true
      setPlaying(false) // Optimistic: the icon flips now, the fade takes 700ms.
      stop()
    } else {
      // No optimistic flip in this direction - the <audio> play event decides,
      // so a refused play() cannot leave the button lying about the sound.
      start()
    }
  }

  /* Attempt one: the moment the page has finished loading.
     Waiting for the load event rather than firing on mount means the song
     arrives with the finished page instead of over a half-painted one, and it
     gives the audio a moment to buffer so playback starts clean.

     This attempt succeeds on a return visit, on desktop Chrome once the site
     has built up enough media-engagement history, and anywhere the guest has
     already interacted. On a first visit it is refused - that is expected, and
     attempt two picks it up. */
  useEffect(() => {
    if (!src || broken || !music.autoplay) return

    let cancelled = false
    const attempt = async () => {
      const ok = await start()
      if (!ok && !cancelled) setAutoplayRefused(true)
    }

    if (document.readyState === 'complete') {
      attempt()
      return () => {
        cancelled = true
      }
    }

    window.addEventListener('load', attempt, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', attempt)
    }
  }, [src, broken])

  /* Attempt two: a gesture the browser will actually accept.

     Which events count is narrower than it looks, and the phone is where it
     bites. Per the HTML spec, an event only grants "user activation" if it is
     one of keydown, mousedown, pointerdown *with pointerType mouse*, pointerup,
     or touchend. So on a touch screen, touchstart and pointerdown grant
     nothing - a finger going down is not consent yet, only a finger coming
     back up is. Listening on touchstart meant every phone silently refused.

     For the same reason this listens until it succeeds rather than unhooking
     after one try: a scroll fires plenty of events that cannot start audio,
     and unhooking on the first of them spends the one chance on an event that
     was never going to work. Gestures on the player itself are ignored, or a
     press on the play button would start the song here and then immediately
     toggle it back off. */
  useEffect(() => {
    if (!src || broken || !music.autoplay) return

    const events = ['touchend', 'pointerup', 'click', 'keydown']
    const remove = () => events.forEach((e) => window.removeEventListener(e, onGesture))

    const onGesture = async (event) => {
      if (rootRef.current?.contains(event.target)) return
      // Attempt one already got there, or the guest has since pressed pause -
      // that decision outranks autoplay. Either way, stop listening.
      if (pausedByGuestRef.current || audioRef.current?.paused === false) {
        remove()
        return
      }
      // play() must be called inside the handler for the activation to count,
      // which start() does before it awaits anything.
      if (await start()) remove()
    }

    events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }))
    return remove
  }, [src, broken])

  // Clear any in-flight fade on unmount so the interval cannot outlive us.
  useEffect(() => () => clearInterval(fadeRef.current), [])

  /* The entry screen calls this from inside its click handler - it holds the
     one gesture the browser will accept, and the audio element lives here. */
  useImperativeHandle(ref, () => ({ start }), [])

  if (!src || broken) {
    // Same idea as an empty photo slot: while you are working locally the
    // player shows itself as an inert stub so you can see where it sits and
    // what it will look like. `import.meta.env.DEV` is compiled to false in
    // the build, so this never reaches a guest.
    if (!import.meta.env.DEV || broken) return null

    return (
      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-40">
        <div className="flex items-center gap-2.5 border border-dashed border-rail bg-card/95 py-2 pr-3.5 pl-2">
          <span className="grid size-9 shrink-0 place-items-center border border-rail/70 text-rail">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M6.5 3.6l14 8.4-14 8.4z" />
            </svg>
          </span>
          <p className="ticket-data max-w-[10.5rem] text-[0.5rem] leading-relaxed text-rail">
            No song yet — set music.path in config.js
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={rootRef}
      className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 z-40 print:hidden"
    >
      <audio
        ref={audioRef}
        src={src}
        loop
        // The song is meant to start on its own, so fetching it up front is
        // the difference between music at the first tap and music a few
        // seconds later. Browsers still hold this back on a metered connection.
        preload="auto"
        // The element's own events are the source of truth: they also cover the
        // lock-screen controls and a phone call interrupting playback.
        onPlay={() => {
          setPlaying(true)
          setAutoplayRefused(false)
        }}
        onPause={() => setPlaying(false)}
        onError={() => setBroken(true)}
      />

      <div className="flex items-center gap-2.5 border border-rail bg-card/95 py-2 pr-3.5 pl-2 shadow-[0_2px_12px_rgba(74,27,41,0.14)] backdrop-blur-sm">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? 'Pause the music' : 'Play the music'}
          className="grid size-9 shrink-0 place-items-center border border-rail/70 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {playing ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <rect x="5.5" y="4" width="4.5" height="16" />
              <rect x="14" y="4" width="4.5" height="16" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
              <path d="M6.5 3.6l14 8.4-14 8.4z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 max-w-[10.5rem]">
          <p className="ticket-data flex items-center gap-1.5 text-[0.5rem] text-rail">
            <span aria-hidden="true" className="flex h-2.5 items-end gap-[2px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-[2px] bg-rail ${playing ? 'eq-bar' : 'h-[3px]'}`}
                  style={playing ? { animationDelay: `${i * 160}ms` } : undefined}
                />
              ))}
            </span>
            {playing ? 'Now playing' : autoplayRefused ? 'Tap to play' : 'Music'}
          </p>
        </div>
      </div>
    </div>
  )
}
