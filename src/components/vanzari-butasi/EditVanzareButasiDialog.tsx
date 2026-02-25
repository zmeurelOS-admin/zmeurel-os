'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VanzareButasi } from '@/lib/supabase/queries/vanzari-butasi';

interface EditVanzareButasiDialogProps {
  vanzare: VanzareButasi | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditVanzareButasiDialog({
  vanzare,
  open,
  onOpenChange,
}: EditVanzareButasiDialogProps) {
  if (!vanzare) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Editare vanzare butasi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p><strong>Soi:</strong> {vanzare.soi_butasi}</p>
          <p><strong>Cantitate:</strong> {vanzare.cantitate_butasi}</p>
          <p><strong>PreČ› unitar:</strong> {vanzare.pret_unitar_lei} lei</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
