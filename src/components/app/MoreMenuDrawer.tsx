'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, LayoutDashboard, Leaf, MapPin, ShoppingBag, Users, Wallet } from 'lucide-react'

import { AppDrawer } from '@/components/app/AppDrawer'

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
      </div>
    </AppDrawer>
  )
}
