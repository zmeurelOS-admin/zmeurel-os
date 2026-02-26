import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { isSuperAdmin } from '@/lib/auth/isSuperAdmin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const superadmin = await isSuperAdmin(supabase, user.id)
  if (!superadmin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
