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
    <div className="bg-[var(--agri-bg)]">
      <div className="relative z-20">{header}</div>

      <main
        className="relative z-10 px-4"
        style={{ paddingBottom: bottomInset }}
      >
        {children}
      </main>

      {bottomBar ? <div className="relative z-30">{bottomBar}</div> : null}
      {fab}
    </div>
  )
}
