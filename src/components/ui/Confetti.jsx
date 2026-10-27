/* ---------------------------------------------------------------------------
   One burst of confetti, thrown up and out in a fan from a single point and
   falling away under gravity. Paper strips, gold dots and a few hearts, all
   from the palette.

   It plays once when mounted. To throw it again, remount it with a new `key`.
   It starts a beat late so it leaves the stamp just as the stamp lands.
--------------------------------------------------------------------------- */

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

/** When the stamp in index.css hits the paper, near enough. */
const LANDS_MS = 320

const KINDS = ['bg-seal', 'confetti-dot bg-ochre', 'bg-blush', 'heart', 'bg-seal', 'bg-blush', 'confetti-fleck bg-kopi', 'confetti-dot bg-ochre']
const REACH = [-84, -120, -170]

/* 26 pieces fanned evenly from 105° left of straight up to 105° right of it,
   at three different reaches, leaving in four small waves. */
const PIECES = Array.from({ length: 26 }, (_, i) => ({
  angle: -105 + (210 / 25) * i,
  kind: KINDS[i % KINDS.length],
  reach: REACH[i % REACH.length],
  delay: LANDS_MS + (i % 4) * 30,
}))

export default function Confetti({ className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none size-0 ${className}`}>
      {PIECES.map((piece, i) => {
        const timing = { animationDelay: `${piece.delay}ms`, '--reach': `${piece.reach}px` }
        return (
          <span key={i} className="confetti-piece" style={{ animationDelay: `${piece.delay}ms` }}>
            <span className="absolute" style={{ transform: `rotate(${piece.angle}deg)` }}>
              {piece.kind === 'heart' ? (
                <svg viewBox="0 0 24 24" className="confetti-bit confetti-heart fill-seal" style={timing}>
                  <path d={HEART} />
                </svg>
              ) : (
                <span className={`confetti-bit ${piece.kind}`} style={timing} />
              )}
            </span>
          </span>
        )
      })}
    </div>
  )
}
