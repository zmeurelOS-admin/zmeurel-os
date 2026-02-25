'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, LayoutDashboard, Leaf, LogOut, MapPin, Settings, ShoppingBag, Users, Wallet } from 'lucide-react'
import { toast } from 'sonner'

import { AppDrawer } from '@/components/app/AppDrawer'
import { useDensity } from '@/components/app/DensityProvider'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface MoreMenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const groups = [
  {
    title: 'Operatiuni',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/parcele', label: 'Parcele', icon: MapPin },
      { href: '/vanzari-butasi', label: 'Vanzari butasi', icon: ShoppingBag },
    ],
  },
  {
    title: 'Administrare',
    items: [
      { href: '/clienti', label: 'Clienti', icon: Users },
      { href: '/culegatori', label: 'Culegatori', icon: Leaf },
      { href: '/rapoarte', label: 'Rapoarte', icon: BarChart3 },
      { href: '/planuri', label: 'Planuri', icon: Wallet },
    ],
  },
]

export function MoreMenuDrawer({ open, onOpenChange }: MoreMenuDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { density, setDensity } = useDensity()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    onOpenChange(false)
    router.push('/login')
    toast.success('Te-ai delogat cu succes.')
  }

  return (
    <AppDrawer open={open} onOpenChange={onOpenChange} title="Mai multe module">
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.title} className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">{group.title}</h3>
            <div className="space-y-2">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={`agri-control flex h-12 items-center gap-3 px-3 text-sm font-semibold ${
                      active ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'text-[var(--agri-text)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">Cont & Setari</h3>
          <div className="space-y-2">
            <Link
              href="/settings#profil"
              onClick={() => onOpenChange(false)}
              className="agri-control flex h-12 items-center gap-3 px-3 text-sm font-semibold text-[var(--agri-text)]"
            >
              <Settings className="h-4 w-4" />
              Profil utilizator
            </Link>

            <Link
              href="/settings#password"
              onClick={() => onOpenChange(false)}
              className="agri-control flex h-12 items-center gap-3 px-3 text-sm font-semibold text-[var(--agri-text)]"
            >
              <Settings className="h-4 w-4" />
              Schimba parola
            </Link>

            <Link
              href="/settings#ferma"
              onClick={() => onOpenChange(false)}
              className="agri-control flex h-12 items-center gap-3 px-3 text-sm font-semibold text-[var(--agri-text)]"
            >
              <Settings className="h-4 w-4" />
              Schimba ferma
            </Link>

            <div className="agri-control space-y-2 rounded-xl border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--agri-text-muted)]">Densitate UI</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={density === 'compact' ? 'default' : 'outline'}
                  className="h-10 text-xs"
                  onClick={() => setDensity('compact')}
                >
                  Compact
                </Button>
                <Button
                  type="button"
                  variant={density === 'normal' ? 'default' : 'outline'}
                  className="h-10 text-xs"
                  onClick={() => setDensity('normal')}
                >
                  Normal
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="agri-control h-12 w-full justify-start gap-3 border-red-300 text-sm font-semibold text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Delogare
            </Button>
          </div>
        </section>
      </div>
    </AppDrawer>
  )
}
