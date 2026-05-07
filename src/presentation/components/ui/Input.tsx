import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`
    const errorId = `${inputId}-error`
    const hintId  = `${inputId}-hint`

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={[error ? errorId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined}
          aria-invalid={!!error}
          className={[
            'rounded-lg border px-3 py-2 text-base',
            'min-h-[44px]',
            'bg-zinc-800 text-gray-100 placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600',
            'disabled:bg-zinc-900 disabled:cursor-not-allowed disabled:text-gray-600',
            error
              ? 'border-red-500 bg-red-950/50'
              : 'border-red-900/50',
            className,
          ].join(' ')}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-400">{hint}</p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
