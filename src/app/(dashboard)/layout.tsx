import { Sidebar } from '@/components/layout/Sidebar'
import { BottomTabBar } from '@/components/app/BottomTabBar'
import { Providers } from '../providers'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="hidden min-h-screen lg:flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto lg:ml-64">{children}</main>
      </div>

      <div className="relative h-[100dvh] min-h-[100svh] overflow-hidden lg:hidden">
        {children}
        <BottomTabBar />
      </div>
    </Providers>
  )
}
