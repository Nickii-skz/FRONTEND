import { type ReactNode } from 'react'
import { Header } from './Header'
import { StatusBar } from './StatusBar'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useOfflineStatus } from '../../hooks/useOfflineStatus'
import { useUIStore } from '../../stores/uiStore'

interface AppShellProps {
  children: ReactNode
  searchInputRef?: React.RefObject<HTMLInputElement>
}

export function AppShell({ children, searchInputRef }: AppShellProps) {
  const { theme } = useUIStore()

  useOfflineStatus()

  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef?.current?.focus(),
  })

  return (
    <div
      className={[
        'flex h-screen flex-col overflow-hidden',
        theme === 'high-contrast'
          ? 'bg-black text-red-50 [--border:rgb(127,29,29)] [--surface:#0a0000] [--surface-2:#1a0000]'
          : 'bg-zinc-900 text-gray-100',
      ].join(' ')}
      data-theme={theme}
    >
      <Header />
      <main className="flex-1 overflow-hidden">{children}</main>
      <StatusBar />
    </div>
  )
}
