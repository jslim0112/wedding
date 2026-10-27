/* ---------------------------------------------------------------------------
   The wire between anything that wants balloons and the one layer that draws
   them. The entry screen and the RSVP confirmation both send a bouquet up,
   but neither of them owns the balloon layer, so they shout and it listens.

   Releasing with nothing listening is harmless - the layer is switched off,
   or the guest asked for reduced motion - and simply does nothing.
--------------------------------------------------------------------------- */

const listeners = new Set()

/** Send a bouquet of `count` balloons up from the bottom of the screen. */
export function releaseBalloons(count = 7) {
  listeners.forEach((listener) => listener(count))
}

/** Called with the bouquet size on every release. Returns an unsubscribe. */
export function onBalloonRelease(listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
