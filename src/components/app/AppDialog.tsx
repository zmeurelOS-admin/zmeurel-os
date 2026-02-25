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

interface AppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AppDialog({ open, onOpenChange, title, children, footer }: AppDialogProps) {
  useBodyScrollLock(open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 z-[100000120] flex items-center justify-center border-0 bg-black/35 p-4 backdrop-blur-sm data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
      >
        <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex max-h-[min(88dvh,820px)] flex-col">
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(var(--safe-b)+16px)]">
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
