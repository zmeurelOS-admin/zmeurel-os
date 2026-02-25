'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  parcelaNume?: string
  itemName?: string
  itemType?: string
  loading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  parcelaNume,
  itemName,
  itemType,
  loading = false,
}: DeleteConfirmDialogProps) {
  const targetName = parcelaNume || itemName || 'elementul selectat'
  const targetType = itemType || 'Element'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="fixed inset-0 flex items-center justify-center border-none bg-black/30 p-4 shadow-none backdrop-blur-sm">
        <div className="w-[90%] max-w-sm space-y-4 rounded-2xl bg-white p-6 text-center shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold tracking-tight">
              Confirma stergerea
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              {targetType} <strong>{targetName}</strong> va fi sters definitiv.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:justify-center">
            <AlertDialogCancel
              disabled={loading}
              className="mt-0 h-11 flex-1 rounded-xl border-none bg-gray-100 text-gray-700 transition-all duration-150 hover:bg-gray-200"
            >
              Anuleaza
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={loading}
              className="h-11 flex-1 rounded-xl bg-red-500 text-white transition-all duration-150 hover:bg-red-600 active:scale-95"
            >
              {loading ? 'Se sterge...' : 'Sterge'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
