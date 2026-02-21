'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Vanzare } from '@/lib/supabase/queries/vanzari';

interface EditVanzareDialogProps {
  vanzare: Vanzare | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVanzareDialog({
  vanzare,
  open,
  onOpenChange,
}: EditVanzareDialogProps) {
  if (!vanzare) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Editare Vânzare {vanzare.id_vanzare}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p><strong>Client:</strong> {vanzare.client_id}</p>
          <p><strong>Cantitate:</strong> {vanzare.cantitate_kg}</p>
          <p><strong>Preț unitar:</strong> {vanzare.pret_unitar_lei} lei</p>
          <p><strong>Data:</strong> {vanzare.data}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
