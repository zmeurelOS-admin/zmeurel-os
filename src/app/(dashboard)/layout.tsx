import { Sidebar } from '@/components/layout/Sidebar'
import { BottomTabBar } from '@/components/app/BottomTabBar'
import { Providers } from '../providers'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="hidden min-h-screen lg:flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64">
          <div className="min-h-screen">{children}</div>
        </main>
      </div>

      <div className="lg:hidden">
        {children}
        <BottomTabBar />
      </div>
    </Providers>
  )
}
