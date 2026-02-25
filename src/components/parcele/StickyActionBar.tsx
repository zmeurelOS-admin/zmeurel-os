'use client'

import { cn } from '@/lib/utils'

interface StickyActionBarProps {
  className?: string
  children: React.ReactNode
}

export function StickyActionBar({ className, children }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-5 pt-3 pb-[calc(var(--safe-b)+var(--mobile-nav-h)+12px)] backdrop-blur',
        className
      )}
    >
      {children}
    </div>
  )
}
