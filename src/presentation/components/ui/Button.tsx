import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-gradient-to-r from-red-700 to-red-900 text-white hover:from-red-600 hover:to-red-800 focus-visible:ring-red-500 disabled:from-red-300 disabled:to-red-400 shadow-lg shadow-red-900/50 border border-red-600',
  secondary: 'bg-gradient-to-r from-zinc-700 to-zinc-800 text-gray-100 hover:from-zinc-600 hover:to-zinc-700 focus-visible:ring-zinc-500 disabled:from-zinc-400 disabled:to-zinc-500 shadow-lg shadow-black/50 border border-zinc-600',
  danger:    'bg-gradient-to-r from-orange-600 to-red-700 text-white hover:from-orange-500 hover:to-red-600 focus-visible:ring-orange-500 disabled:from-orange-300 disabled:to-red-400 shadow-lg shadow-orange-900/50 border border-orange-600',
  ghost:     'bg-transparent text-gray-300 hover:bg-zinc-800/50 focus-visible:ring-red-500 border border-transparent hover:border-red-900/30',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',   // WCAG 44px minimum
  lg: 'px-6 py-3 text-lg min-h-[52px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
