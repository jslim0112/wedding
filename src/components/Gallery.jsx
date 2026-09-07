import { useCallback, useEffect, useRef, useState } from 'react'
import { config } from '../config'
import Section from './ui/Section'
import Reveal from './ui/Reveal'
import Photo from './ui/Photo'

export default function Gallery() {
  const photos = config.gallery
  // Only slots with a real URL can be opened. Placeholders stay inert.
  const viewable = photos.map((photo, gridIndex) => ({ ...photo, gridIndex })).filter((p) => p.src)

  const [openAt, setOpenAt] = useState(null)
  const triggersRef = useRef([])
  const dialogRef = useRef(null)

  const close = useCallback(() => {
    setOpenAt((current) => {
      if (current !== null) {
        const gridIndex = viewable[current]?.gridIndex
        requestAnimationFrame(() => triggersRef.current[gridIndex]?.focus())
      }
      return null
    })
  }, [viewable])

  useEffect(() => {
    if (openAt === null) return

    const onKey = (event) => {
      if (event.key === 'Escape') {
        close()
      } else if (event.key === 'ArrowRight') {
        setOpenAt((i) => (i + 1) % viewable.length)
      } else if (event.key === 'ArrowLeft') {
        setOpenAt((i) => (i - 1 + viewable.length) % viewable.length)
      }
    }

    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [openAt, viewable.length, close])

  const current = openAt === null ? null : viewable[openAt]

  return (
    <Section id="gallery" label="" title="A Fews of Our Favourites">
      <Reveal className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {photos.map((photo, i) => {
          const position = viewable.findIndex((p) => p.gridIndex === i)

          if (position === -1) {
            return (
              <div key={i} className="aspect-square overflow-hidden">
                <Photo photo={photo} />
              </div>
            )
          }

          return (
            <button
              key={i}
              type="button"
              ref={(el) => {
                triggersRef.current[i] = el
              }}
              onClick={() => setOpenAt(position)}
              className="aspect-square overflow-hidden border border-rail transition-opacity hover:opacity-85"
            >
              <Photo photo={photo} />
              <span className="sr-only">Open photo {position + 1} of {viewable.length}</span>
            </button>
          )
        })}
      </Reveal>

      {current && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt || `Photo ${openAt + 1} of ${viewable.length}`}
          tabIndex={-1}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
        >
          <img
            src={current.src}
            alt={current.alt || ''}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[85svh] max-w-full object-contain"
          />

          <button
            type="button"
            onClick={close}
            className="ticket-data absolute top-4 right-4 border border-paper/40 px-3 py-2 text-[0.6rem] text-paper transition-colors hover:border-ochre hover:text-ochre"
          >
            Close
          </button>

          {viewable.length > 1 && (
            <p className="ticket-data absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] text-paper/60">
              {openAt + 1} / {viewable.length}
            </p>
          )}
        </div>
      )}
    </Section>
  )
}
