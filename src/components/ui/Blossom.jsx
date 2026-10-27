/* ---------------------------------------------------------------------------
   Plum blossom - 梅花, the flower that opens in late winter and the one most
   often painted on a Chinese wedding card. Flat, like the agenda drawings:
   five round petals around an ochre heart, on a kopi branch, and nothing from
   outside the palette - the leafless branch is what lets it do without a
   green.

   Drawn in fixed boxes and placed by whoever uses them; the drawings
   themselves know nothing about the layout they sit on.
--------------------------------------------------------------------------- */

/* One petal at each point of a pentagon, overlapping into a round flower. */
const PETALS = [
  [0, -4],
  [3.8, -1.24],
  [2.35, 3.24],
  [-2.35, 3.24],
  [-3.8, -1.24],
]

const TONES = {
  seal: 'fill-seal stroke-ink/25',
  blush: 'fill-blush stroke-seal/35',
}

function Flower({ x, y, scale = 1, tone = 'seal' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {PETALS.map(([cx, cy]) => (
        <circle key={`${cx},${cy}`} cx={cx} cy={cy} r="3.6" strokeWidth="0.5" className={TONES[tone]} />
      ))}
      <circle r="1.7" className="fill-ochre" />
    </g>
  )
}

function Bud({ x, y, r, tone = 'seal' }) {
  return <circle cx={x} cy={y} r={r} strokeWidth="0.5" className={TONES[tone]} />
}

/**
 * A branch reaching in from the right and down to the left, 190x64. Its
 * right-hand end is cut, so it reads as growing in from beyond whatever edge
 * it is placed against.
 */
export function PlumBranch({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 190 64" fill="none" strokeLinecap="round" className={`overflow-visible ${className}`}>
      <path d="M192 14C170 16 150 22 128 34C112 42 96 50 72 54" strokeWidth="3" className="stroke-kopi" />
      <path
        d="M150 22C146 12 140 6 132 3M110 44C108 52 104 58 98 62M72 54C64 55 56 54 48 51M176 15C172 22 170 26 168 30"
        strokeWidth="1.6"
        className="stroke-kopi"
      />
      <Flower x={132} y={5} scale={1.2} />
      <Flower x={124} y={34} scale={1.35} tone="blush" />
      <Flower x={86} y={51} scale={1.1} />
      <Flower x={168} y={31} scale={0.95} tone="blush" />
      <Bud x={47} y={50.5} r={2.7} />
      <Bud x={98} y={62} r={2.5} tone="blush" />
      <Bud x={152} y={18} r={2.2} />
    </svg>
  )
}

/** A short sprig rising to the left from its bottom-right corner, 130x44. */
export function PlumSprig({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 130 44" fill="none" strokeLinecap="round" className={`overflow-visible ${className}`}>
      <path d="M132 40C112 36 94 30 76 20C66 14 54 12 40 12" strokeWidth="2.4" className="stroke-kopi" />
      <path d="M94 30C92 22 88 17 82 14M58 13C55 8 50 5 45 4" strokeWidth="1.4" className="stroke-kopi" />
      <Flower x={76} y={20} scale={1.1} />
      <Flower x={104} y={34} scale={1.05} tone="blush" />
      <Bud x={40} y={12} r={2.6} />
      <Bud x={45} y={4} r={2.2} tone="blush" />
      <Bud x={82} y={13.5} r={2} />
    </svg>
  )
}

/* A handful, spread across the width and out of step, slow enough that there
   are never more than a couple in view at once. */
const FALLING = [
  { left: '12%', tone: 'blush', seconds: 13, delay: -3 },
  { left: '36%', tone: 'seal', seconds: 17, delay: -9 },
  { left: '58%', tone: 'blush', seconds: 15, delay: -1 },
  { left: '78%', tone: 'seal', seconds: 19, delay: -12 },
  { left: '91%', tone: 'blush', seconds: 14, delay: -6 },
]

/**
 * Petals drifting down through whatever positioned box this is dropped into,
 * clipped to it. Each falls the box's full height, whatever that measures.
 */
export function FallingPetals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {FALLING.map((petal) => (
        <div
          key={petal.left}
          className="petal-fall absolute inset-x-0 top-0 h-full"
          style={{ animationDuration: `${petal.seconds}s`, animationDelay: `${petal.delay}s` }}
        >
          <svg
            viewBox="0 0 10 10"
            className={`petal-flutter absolute top-0 size-2.5 ${petal.tone === 'seal' ? 'fill-seal/70' : 'fill-blush'}`}
            style={{ left: petal.left }}
          >
            <path d="M5 0C8.5 2 9 6.5 5 10C1 6.5 1.5 2 5 0Z" />
          </svg>
        </div>
      ))}
    </div>
  )
}
