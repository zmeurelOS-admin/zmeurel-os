'use client'

import { X } from 'lucide-react'

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StickyActionBar } from '@/components/app/StickyActionBar'

interface AppDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AppDrawer({ open, onOpenChange, title, children, footer }: AppDrawerProps) {
  useBodyScrollLock(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 z-[100000120] flex items-end border-0 bg-black/35 p-0 backdrop-blur-sm"
      >
        <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:mx-auto sm:max-w-2xl sm:rounded-3xl">
          <div className="flex h-[min(92dvh,960px)] flex-col">
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(var(--safe-b)+16px)]">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300" />

              <DialogHeader className="mb-4 flex-row items-center justify-between space-y-0">
                <DialogTitle className="text-left text-lg font-semibold text-[var(--agri-text)]">{title}</DialogTitle>
                <DialogClose asChild>
                  <Button type="button" variant="ghost" size="icon" className="rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </DialogHeader>

              {children}
            </div>

            {footer ? <StickyActionBar>{footer}</StickyActionBar> : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
