/* ---------------------------------------------------------------------------
   The rule between sections: a hairline either side of a small heart, set
   between two ochre diamonds - the same knot that ties the corners of the
   agenda's 囍 lattice - and two rail dots.
--------------------------------------------------------------------------- */

const HEART =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'

export default function Divider({ className = '' }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-2.5 ${className}`}>
      <span className="h-px flex-1 bg-rail/45" />
      <svg viewBox="0 0 76 20" className="h-5 w-[76px] shrink-0">
        <path d="M10 5.5l4.5 4.5-4.5 4.5-4.5-4.5z" className="fill-ochre" />
        <circle cx="23" cy="10" r="1.5" className="fill-rail" />
        <path transform="translate(31 3) scale(0.58)" d={HEART} className="fill-seal" />
        <circle cx="53" cy="10" r="1.5" className="fill-rail" />
        <path d="M66 5.5l4.5 4.5-4.5 4.5-4.5-4.5z" className="fill-ochre" />
      </svg>
      <span className="h-px flex-1 bg-rail/45" />
    </div>
  )
}
