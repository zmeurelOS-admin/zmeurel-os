'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PackageOpen, Ellipsis, BanknoteArrowUp, ClipboardList, Receipt } from 'lucide-react'
import { useState } from 'react'

import { MoreMenuDrawer } from '@/components/app/MoreMenuDrawer'

const tabs = [
  { label: 'Activități', href: '/activitati-agricole', icon: ClipboardList },
  { label: 'Cheltuieli', href: '/cheltuieli', icon: Receipt },
  { label: 'Vânzări', href: '/vanzari', icon: BanknoteArrowUp },
  { label: 'Recoltări', href: '/recoltari', icon: PackageOpen },
]

export function BottomTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-[100000060] border-t border-[var(--agri-border)] bg-white/95 backdrop-blur"
        style={{ paddingBottom: 'var(--safe-b)' }}
        aria-label="Navigare principală"
      >
        <div className="mx-auto grid h-[var(--tabbar-h)] w-full max-w-4xl grid-cols-5 gap-1 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="group relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1"
              >
                <span
                  className={`absolute top-1 h-1 w-8 rounded-full transition ${active ? 'bg-[var(--agri-primary)]' : 'bg-transparent'}`}
                />
                <Icon className={`h-5 w-5 ${active ? 'text-[var(--agri-primary)]' : 'text-[var(--agri-text-muted)]'}`} />
                <span className={`text-[11px] font-semibold ${active ? 'text-[var(--agri-primary)]' : 'text-[var(--agri-text-muted)]'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="group relative flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1"
            aria-label="Mai multe module"
          >
            <Ellipsis className="h-5 w-5 text-[var(--agri-text-muted)]" />
            <span className="text-[11px] font-semibold text-[var(--agri-text-muted)]">More</span>
          </button>
        </div>
      </nav>

      <MoreMenuDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  )
}
