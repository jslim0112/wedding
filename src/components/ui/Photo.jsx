/**
 * A photo slot. When config has no URL yet it renders a labelled panel of
 * ticket stock telling you which picture belongs here, so the layout is real
 * and finished before the photos exist. Paste a Supabase Storage public URL
 * into config.js and the same slot becomes the photo.
 */
export default function Photo({ photo, className = '', imgClassName = '', loading = 'lazy' }) {
  if (photo?.src) {
    return (
      <img
        src={photo.src}
        alt={photo.alt || ''}
        loading={loading}
        decoding="async"
        className={`size-full object-cover ${imgClassName} ${className}`}
      />
    )
  }

  return (
    <div
      className={`flex size-full flex-col items-center justify-center gap-2 border border-dashed border-rail bg-card px-4 text-center ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="size-7 text-rail"
      >
        <rect x="2.5" y="4.5" width="19" height="15" />
        <circle cx="8.5" cy="10" r="1.75" />
        <path d="M2.5 16.5l5-4.5 4.5 4 3.5-3 6 5.5" />
      </svg>
      <p className="ticket-data text-[0.6rem] leading-relaxed text-rail">
        {photo?.slot || 'Photo'}
      </p>
    </div>
  )
}
