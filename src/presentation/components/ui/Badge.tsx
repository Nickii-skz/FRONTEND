type BadgeVariant = 'online' | 'offline' | 'syncing' | 'success' | 'warning' | 'error' | 'neutral'

interface BadgeProps {
  variant: BadgeVariant
  label: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  online:   'bg-green-900/50 text-green-400 border border-green-800',
  offline:  'bg-red-900/50 text-red-400 border border-red-800',
  syncing:  'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  success:  'bg-green-900/50 text-green-400 border border-green-800',
  warning:  'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
  error:    'bg-red-900/50 text-red-400 border border-red-800',
  neutral:  'bg-zinc-800 text-gray-400 border border-zinc-700',
}

const dotClasses: Record<BadgeVariant, string> = {
  online:   'bg-green-500 shadow-sm shadow-green-500/50',
  offline:  'bg-red-500 shadow-sm shadow-red-500/50',
  syncing:  'bg-yellow-500 animate-pulse shadow-sm shadow-yellow-500/50',
  success:  'bg-green-500 shadow-sm shadow-green-500/50',
  warning:  'bg-yellow-500 shadow-sm shadow-yellow-500/50',
  error:    'bg-red-500 shadow-sm shadow-red-500/50',
  neutral:  'bg-gray-400',
}

export function Badge({ variant, label, dot = true }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
      ].join(' ')}
    >
      {dot && (
        <span
          className={['h-1.5 w-1.5 rounded-full', dotClasses[variant]].join(' ')}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  )
}
