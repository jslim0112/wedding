/* Shared control styling. Square corners - this is a printed form, not an app. */
export const inputClass =
  'w-full rounded-none border border-rail bg-card px-3.5 py-2.5 text-[0.95rem] text-ink ' +
  'transition-colors placeholder:text-rail hover:border-kopi/60 focus:border-ink ' +
  'aria-[invalid=true]:border-kopi aria-[invalid=true]:bg-kopi/5'

/**
 * Label, optional hint and inline error for one control.
 *
 * children is a function so the id and the aria wiring can't drift apart:
 *   <Field id="phone" label="Phone">
 *     {(p) => <input {...p} />}
 *   </Field>
 */
export default function Field({
  id,
  label,
  hint,
  error,
  required = false,
  className = '',
  children,
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="ticket-data block text-[0.8rem] text-kopi">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="text-ochre"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {hint && (
        <p id={hintId} className="mt-1 text-[0.8rem] leading-snug text-kopi/70">
          {hint}
        </p>
      )}

      <div className="mt-2">
        {children({
          id,
          'aria-describedby': describedBy,
          'aria-invalid': error ? true : undefined,
        })}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-[0.82rem] font-medium text-kopi">
          {error}
        </p>
      )}
    </div>
  )
}
