/**
 * Whether the guest's device asks for reduced motion. The CSS handles most of
 * this by itself; this is for the pieces that are better not drawn at all than
 * drawn frozen - balloons stuck in mid-air, confetti hanging over the stamp.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}
