'use client'

import { useEffect, useState } from 'react'
import { Tractor } from 'lucide-react'

import { FarmSwitcher } from '@/components/app/FarmSwitcher'
import { isSuperAdmin } from '@/lib/auth/isSuperAdmin'
import { getSupabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function TopBar() {
  const [farmDialogOpen, setFarmDialogOpen] = useState(false)
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

  return (
    <>
      <div
        className="relative z-40 flex h-[calc(44px+var(--safe-t))] shrink-0 items-end border-b border-[var(--agri-border)] bg-white/95 px-3 pb-2 backdrop-blur sm:px-4"
        style={{ paddingTop: 'var(--safe-t)' }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--agri-text)]">
            <Tractor className="h-4 w-4 text-emerald-700" />
            Zmeurel
          </div>

          {isSuperAdminUser ? <FarmSwitcher variant="chip" onActivate={() => setFarmDialogOpen(true)} /> : null}
        </div>
      </div>

      <Dialog open={isSuperAdminUser && farmDialogOpen} onOpenChange={setFarmDialogOpen}>
        <DialogContent className="w-[92%] max-w-md rounded-2xl p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle>Schimbă fermă</DialogTitle>
          </DialogHeader>
          <FarmSwitcher variant="panel" />
        </DialogContent>
      </Dialog>
    </>
  )
}
