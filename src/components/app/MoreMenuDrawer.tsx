'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { AppDrawer } from '@/components/app/AppDrawer'
import { Button } from '@/components/ui/button'
import { isSuperAdmin } from '@/lib/auth/isSuperAdmin'
import { getSupabase } from '@/lib/supabase/client'

interface MoreMenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type MenuItem = {
  href: string
  label: string
  icon: LucideIcon
}

type MenuGroup = {
  title: string
  items: MenuItem[]
  badge?: string
}

const groups: MenuGroup[] = [
  {
    title: 'Operațiuni',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/parcele', label: 'Parcele', icon: MapPin },
      { href: '/stocuri', label: 'Stocuri', icon: Archive },
      { href: '/vanzari-butasi', label: 'Vânzări butași', icon: ShoppingBag },
    ],
  },
  {
    title: 'Administrare',
    items: [
      { href: '/clienti', label: 'Clienți', icon: Users },
      { href: '/culegatori', label: 'Culegători', icon: Leaf },
      { href: '/rapoarte', label: 'Rapoarte', icon: BarChart3 },
      { href: '/planuri', label: 'Planuri', icon: Wallet },
    ],
  },
]

const adminGroup: MenuGroup = {
  title: 'Admin (Zmeurel)',
  badge: 'Admin',
  items: [
    { href: '/admin/analytics', label: 'Analytics global (agregat)', icon: BarChart3 },
    { href: '/admin', label: 'Planuri / Pricing', icon: Wallet },
    { href: '/admin/audit', label: 'Audit planuri', icon: ClipboardList },
    { href: '/admin', label: 'Listă tenanți', icon: UsersRound },
  ],
}

export function MoreMenuDrawer({ open, onOpenChange }: MoreMenuDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)

  useEffect(() => {
    void (async () => {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsSuperAdminUser(user?.id ? await isSuperAdmin(supabase, user.id) : false)
    })()
  }, [])

  const sections = useMemo(() => {
    if (!isSuperAdminUser) return groups
    return [...groups, adminGroup]
  }, [isSuperAdminUser])

  const handleLogout = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    onOpenChange(false)
    router.push('/login')
    toast.success('Te-ai delogat cu succes.')
  }

  return (
    <AppDrawer open={open} onOpenChange={onOpenChange} title="Mai multe module">
      <div className="space-y-6">
        {sections.map((group) => (
          <section key={group.title} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">{group.title}</h3>
              {'badge' in group ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  {group.badge}
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={`${group.title}-${item.href}-${item.label}`}
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">Cont & Setări</h3>
          <div className="space-y-2">
            <Link
              href="/settings#profil"
              onClick={() => onOpenChange(false)}
              className="agri-control flex h-12 items-center gap-3 px-3 text-sm font-semibold text-[var(--agri-text)]"
            >
              <Settings className="h-4 w-4" />
              Profil utilizator
            </Link>

            <Button
              type="button"
              variant="outline"
              className="agri-control h-12 w-full justify-start gap-3 border-red-300 text-sm font-semibold text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Deconectare
            </Button>
          </div>
        </section>
      </div>
    </AppDrawer>
  )
}


