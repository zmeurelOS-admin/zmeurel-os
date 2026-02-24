import { Sidebar } from '@/components/layout/Sidebar'
import { MobileShell } from '@/components/mobile/MobileShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        <MobileShell>
          {children}
        </MobileShell>
      </div>
    </>
  )
}