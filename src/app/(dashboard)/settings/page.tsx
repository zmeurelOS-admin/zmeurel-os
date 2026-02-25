'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, LogOut, Settings2, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { AppShell } from '@/components/app/AppShell'
import { CompactListCard } from '@/components/app/CompactListCard'
import { useDensity } from '@/components/app/DensityProvider'
import { FarmSwitcher } from '@/components/app/FarmSwitcher'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const router = useRouter()
  const { density, setDensity } = useDensity()
  const [email, setEmail] = useState('...')
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email ?? 'Necunoscut')
    }

    void loadUser()
  }, [])

  const passwordError = useMemo(() => {
    if (!newPassword && !confirmPassword) return null
    if (newPassword.length < 8) return 'Parola trebuie sa aiba minim 8 caractere.'
    if (newPassword !== confirmPassword) return 'Parolele nu coincid.'
    return null
  }, [confirmPassword, newPassword])

  const handleChangePassword = async () => {
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    setIsSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      toast.success('Parola a fost actualizata.')
      setPasswordDialogOpen(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error?.message || 'Nu am putut actualiza parola.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <AppShell
      header={<PageHeader title="Setari" subtitle="Cont, interfata si preferinte operator" rightSlot={<Settings2 className="h-5 w-5" />} />}
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 py-4">
        <section id="profil" className="agri-card space-y-3 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Cont</h2>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-[var(--agri-text-muted)]">Email</Label>
            <div className="agri-control flex h-11 items-center gap-2 px-3 text-sm font-medium text-[var(--agri-text)]">
              <UserCircle2 className="h-4 w-4 text-[var(--agri-text-muted)]" />
              {email}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" className="agri-control h-11 justify-start gap-2" onClick={() => setPasswordDialogOpen(true)}>
              <KeyRound className="h-4 w-4" />
              Schimba parola
            </Button>
            <Button
              type="button"
              variant="outline"
              className="agri-control h-11 justify-start gap-2 border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              Delogare
            </Button>
          </div>
        </section>

        <section id="interfata" className="agri-card space-y-3 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Interfata</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={density === 'compact' ? 'default' : 'outline'}
              className="agri-control h-11"
              onClick={() => setDensity('compact')}
            >
              Compact
            </Button>
            <Button
              type="button"
              variant={density === 'normal' ? 'default' : 'outline'}
              className="agri-control h-11"
              onClick={() => setDensity('normal')}
            >
              Normal
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase text-[var(--agri-text-muted)]">Preview card</p>
            <CompactListCard
              title="Exemplu lucrare"
              subtitle="15.02.2026"
              metadata="Tratament foliar"
              trailingMeta="Pauza: 3 zile"
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        </section>

        <section id="ferma" className="agri-card space-y-3 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Ferma</h2>
          <FarmSwitcher variant="panel" />
        </section>
      </div>

      <AppDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        title="Schimba parola"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="agri-cta" onClick={() => setPasswordDialogOpen(false)}>
              Anuleaza
            </Button>
            <Button
              type="button"
              className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
              disabled={isSavingPassword || !!passwordError || newPassword.length === 0}
              onClick={handleChangePassword}
            >
              Salveaza
            </Button>
          </div>
        }
      >
        <div id="password" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Parola noua</Label>
            <Input
              id="new-password"
              type="password"
              className="agri-control h-12"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirma parola</Label>
            <Input
              id="confirm-password"
              type="password"
              className="agri-control h-12"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {passwordError ? <p className="text-sm font-medium text-red-700">{passwordError}</p> : null}
        </div>
      </AppDialog>
    </AppShell>
  )
}

