'use client'

interface AppShellProps {
  header: React.ReactNode
  children: React.ReactNode
  fab?: React.ReactNode
  bottomBar?: React.ReactNode
  bottomInset?: string
}

export function AppShell({
  header,
  children,
  fab,
  bottomBar,
  bottomInset = 'var(--app-nav-clearance)',
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--agri-bg)]">
      <div className="relative z-20 shrink-0">{header}</div>

      <main
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4"
        style={{ paddingBottom: bottomInset }}
      >
        {children}
      </main>

      {bottomBar ? <div className="relative z-30 shrink-0">{bottomBar}</div> : null}
      {fab}
    </div>
  )
}
