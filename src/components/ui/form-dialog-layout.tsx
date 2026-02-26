'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface FormDialogLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  contentClassName?: string
}

export function FormDialogLayout({
  title,
  description,
  children,
  footer,
  contentClassName,
}: FormDialogLayoutProps) {
  return (
    <DialogContent
      showCloseButton={false}
      className={cn(
        'fixed inset-0 z-[100000120] flex items-center justify-center border-0 bg-black/35 p-4 backdrop-blur-sm data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
        contentClassName
      )}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex max-h-[min(88dvh,860px)] flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <DialogHeader className="mb-5 flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <DialogTitle className="text-left text-lg font-semibold text-[var(--agri-text)]">{title}</DialogTitle>
                {description ? (
                  <DialogDescription className="text-left text-sm text-[var(--agri-text-muted)]">{description}</DialogDescription>
                ) : null}
              </div>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogHeader>

            {children}
          </div>

          {footer ? (
            <div className="border-t border-[var(--agri-border)] bg-white p-6 pt-4">
              <div className="grid grid-cols-2 gap-3">{footer}</div>
            </div>
          ) : null}
        </div>
      </div>
    </DialogContent>
  )
}
