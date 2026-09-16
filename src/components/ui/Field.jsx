/* Shared control styling. Square corners - this is a printed form, not an app. */
export const inputClass =
  'w-full rounded-none border border-rail bg-card px-3.5 py-2.5 text-[0.95rem] text-ink ' +
  'transition-colors placeholder:text-rail hover:border-kopi/60 focus:border-ink ' +
  'aria-[invalid=true]:border-kopi aria-[invalid=true]:bg-kopi/5'

/**
 * Label, optional hint and inline error for one control.
 *
 * Every piece of text comes in two languages, the Chinese on the line under the
 * English the way the rest of the page prints it. Pass only the English and the
 * field simply has no Chinese line. An `error` is `{ en, zh }` rather than a
 * string, so a validation message can carry both halves.
 *
 * children is a function so the id and the aria wiring can't drift apart:
 *   <Field id="phone" label="Phone">
 *     {(p) => <input {...p} />}
 *   </Field>
 */
export default function Field({
  id,
  label,
  label_zh,
  hint,
  hint_zh,
  error,
  required = false,
  className = '',
  children,
}) {
  const hintId = hint || hint_zh ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="ticket-data block text-[0.8rem] text-kopi">
        {label}
        {label_zh && <span className="zh ml-1.5 normal-case">{label_zh}</span>}
        {required && (
          <>
            <span aria-hidden="true" className="text-ochre"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {(hint || hint_zh) && (
        <p id={hintId} className="mt-1 text-[0.8rem] leading-snug text-kopi/70">
          {hint}
          {hint_zh && <span className="zh ml-1.5">{hint_zh}</span>}
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
          {error.en}
          {error.zh && <span className="zh mt-0.5 block">{error.zh}</span>}
        </p>
      )}
    </div>
  )
}
