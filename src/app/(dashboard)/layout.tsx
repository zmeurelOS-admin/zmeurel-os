import { Sidebar } from '@/components/layout/Sidebar'
import { BottomTabBar } from '@/components/app/BottomTabBar'
import { Providers } from '../providers'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="hidden min-h-screen lg:flex">
        <Sidebar />
        <main className="flex min-h-screen flex-1 flex-col overflow-hidden lg:ml-64">
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </main>
      </div>

      <div className="relative flex h-[100dvh] min-h-[100svh] flex-col overflow-hidden lg:hidden">
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <BottomTabBar />
      </div>
    </Providers>
  )
}
