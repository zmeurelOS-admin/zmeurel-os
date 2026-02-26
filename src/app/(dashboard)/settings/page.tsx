'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KeyRound, Settings2, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { AppDialog } from '@/components/app/AppDialog'
import { AppShell } from '@/components/app/AppShell'
import { FarmSwitcher } from '@/components/app/FarmSwitcher'
import { PageHeader } from '@/components/app/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUiDensity } from '@/hooks/useUiDensity'
import { isSuperAdmin } from '@/lib/auth/isSuperAdmin'
import { getSupabase } from '@/lib/supabase/client'

interface GoogleContactsStatus {
  connected: boolean
  connected_email: string | null
  last_sync_at: string | null
  sync_enabled: boolean
  sync_window: 'dimineata' | 'seara'
}

export default function SettingsPage() {
  const { density, setDensity } = useUiDensity()
  const handledGoogleStateRef = useRef<string | null>(null)

  const [email, setEmail] = useState('...')
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [googleStatus, setGoogleStatus] = useState<GoogleContactsStatus | null>(null)
  const [isLoadingGoogleStatus, setIsLoadingGoogleStatus] = useState(false)
  const [isImportingGoogle, setIsImportingGoogle] = useState(false)
  const [isUpdatingGoogleSync, setIsUpdatingGoogleSync] = useState(false)

  useEffect(() => {
    void (async () => {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email ?? 'Necunoscut')
      setIsSuperAdminUser(user?.id ? await isSuperAdmin(supabase, user.id) : false)
    })()
  }, [])

  const passwordError = useMemo(() => {
    if (!newPassword && !confirmPassword) return null
    if (newPassword.length < 8) return 'Parola trebuie să aibă minim 8 caractere.'
    if (newPassword !== confirmPassword) return 'Parolele nu coincid.'
    return null
  }, [confirmPassword, newPassword])

  const loadGoogleStatus = useCallback(async () => {
    setIsLoadingGoogleStatus(true)
    try {
      const response = await fetch('/api/integrations/google/import', { method: 'GET' })
      const payload = (await response.json()) as {
        error?: string
        connected?: boolean
        connected_email?: string | null
        last_sync_at?: string | null
        sync_enabled?: boolean
        sync_window?: 'dimineata' | 'seara'
      }

      if (!response.ok) {
        throw new Error(payload.error || 'Nu am putut încărca statusul Google Contacts.')
      }

      setGoogleStatus({
        connected: Boolean(payload.connected),
        connected_email: payload.connected_email ?? null,
        last_sync_at: payload.last_sync_at ?? null,
        sync_enabled: payload.sync_enabled ?? true,
        sync_window: payload.sync_window === 'dimineata' ? 'dimineata' : 'seara',
      })
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Nu am putut încărca statusul Google Contacts.'
      toast.error(message)
    } finally {
      setIsLoadingGoogleStatus(false)
    }
  }, [])

  useEffect(() => {
    if (!isSuperAdminUser) return
    void loadGoogleStatus()
  }, [isSuperAdminUser, loadGoogleStatus])

  useEffect(() => {
    if (!isSuperAdminUser) return
    if (typeof window === 'undefined') return

    const googleState = new URLSearchParams(window.location.search).get('google_contacts')
    if (!googleState || handledGoogleStateRef.current === googleState) return

    handledGoogleStateRef.current = googleState
    if (googleState === 'connected') {
      toast.success('Google Contacts conectat.')
    } else if (googleState.startsWith('error')) {
      toast.error('Conectarea Google Contacts a eșuat.')
    }

    void loadGoogleStatus()

    const url = new URL(window.location.href)
    url.searchParams.delete('google_contacts')
    window.history.replaceState({}, '', url.toString())
  }, [isSuperAdminUser, loadGoogleStatus])

  const handleGoogleConnect = () => {
    window.location.href = '/api/integrations/google/connect'
  }

  const handleGoogleImport = async () => {
    setIsImportingGoogle(true)
    try {
      const response = await fetch('/api/integrations/google/import', { method: 'POST' })
      const payload = (await response.json()) as {
        error?: string
        result?: {
          contacts_fetched?: number
          clients_upserted?: number
        }
      }

      if (!response.ok) {
        throw new Error(payload.error || 'Importul Google Contacts a eșuat.')
      }

      const fetched = payload.result?.contacts_fetched ?? 0
      const upserted = payload.result?.clients_upserted ?? 0
      toast.success(`Import finalizat: ${fetched} contacte, ${upserted} clienti actualizati.`)
      await loadGoogleStatus()
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Importul Google Contacts a eșuat.'
      toast.error(message)
    } finally {
      setIsImportingGoogle(false)
    }
  }

  const handleGoogleSyncUpdate = async (
    patch: Partial<Pick<GoogleContactsStatus, 'sync_enabled' | 'sync_window'>>
  ) => {
    if (!googleStatus) return

    setIsUpdatingGoogleSync(true)
    try {
      const response = await fetch('/api/integrations/google/import', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })

      const payload = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error || 'Nu am putut salva setările de sync.')
      }

      setGoogleStatus((prev) => (prev ? { ...prev, ...patch } : prev))
      toast.success('Setările de sync au fost actualizate.')
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Nu am putut salva setările de sync.'
      toast.error(message)
    } finally {
      setIsUpdatingGoogleSync(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    setIsSavingPassword(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      toast.success('Parola a fost actualizată.')
      setPasswordDialogOpen(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Nu am putut actualiza parola.'
      toast.error(message)
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <AppShell
      header={<PageHeader title="Cont & Setări" subtitle="Profil utilizator și preferințe UI" rightSlot={<Settings2 className="h-5 w-5" />} />}
    >
      <div className="mx-auto w-full max-w-3xl space-y-4 py-4">
        <section id="profil" className="agri-card space-y-3 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Profil utilizator</h2>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-[var(--agri-text-muted)]">Email</Label>
            <div className="agri-control flex h-11 items-center gap-2 px-3 text-sm font-medium text-[var(--agri-text)]">
              <UserCircle2 className="h-4 w-4 text-[var(--agri-text-muted)]" />
              {email}
            </div>
          </div>

          <Button type="button" variant="outline" className="agri-control h-11 justify-start gap-2" onClick={() => setPasswordDialogOpen(true)}>
            <KeyRound className="h-4 w-4" />
            Schimbă parola
          </Button>

          {isSuperAdminUser ? (
            <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-surface-muted)] p-3">
              <div className="mb-3 space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Google Contacts</h3>
                <p className="text-sm text-[var(--agri-text-muted)]">
                  {isLoadingGoogleStatus
                    ? 'Se încarcă statusul integrării...'
                    : googleStatus?.connected
                      ? `Conectat (${googleStatus.connected_email || 'cont Google'})`
                      : 'Neconectat'}
                </p>
                {googleStatus?.last_sync_at ? (
                  <p className="text-xs text-[var(--agri-text-muted)]">
                    Ultimul sync: {new Date(googleStatus.last_sync_at).toLocaleString('ro-RO')}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" className="agri-control h-11" onClick={handleGoogleConnect}>
                  Conectează Google
                </Button>
                <Button
                  type="button"
                  className="agri-control h-11 bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
                  disabled={!googleStatus?.connected || isImportingGoogle}
                  onClick={handleGoogleImport}
                >
                  {isImportingGoogle ? 'Import în curs...' : 'Importă acum'}
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={googleStatus?.sync_enabled ? 'default' : 'outline'}
                  className="agri-control h-11"
                  disabled={!googleStatus?.connected || isUpdatingGoogleSync}
                  onClick={() => handleGoogleSyncUpdate({ sync_enabled: !(googleStatus?.sync_enabled ?? true) })}
                >
                  Sync zilnic: {googleStatus?.sync_enabled ? 'Activ' : 'Oprit'}
                </Button>

                <Select
                  value={googleStatus?.sync_window ?? 'seara'}
                  onValueChange={(value: 'dimineata' | 'seara') => handleGoogleSyncUpdate({ sync_window: value })}
                  disabled={!googleStatus?.connected || isUpdatingGoogleSync}
                >
                  <SelectTrigger className="agri-control h-11">
                    <SelectValue placeholder="Moment sync" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dimineata">Dimineața (06:00)</SelectItem>
                    <SelectItem value="seara">Seara (20:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </section>

        {isSuperAdminUser ? (
          <section id="ferma" className="agri-card space-y-3 p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Schimbă fermă</h2>
            <FarmSwitcher variant="panel" />
          </section>
        ) : null}

        <section id="interfata" className="agri-card space-y-3 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--agri-text-muted)]">Densitate UI</h2>
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
        </section>
      </div>

      <AppDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        title="Schimbă parola"
        footer={
          <>
            <Button type="button" variant="outline" className="agri-cta" onClick={() => setPasswordDialogOpen(false)}>
              Anulează
            </Button>
            <Button
              type="button"
              className="agri-cta bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
              disabled={isSavingPassword || !!passwordError || newPassword.length === 0}
              onClick={handleChangePassword}
            >
              Salvează
            </Button>
          </>
        }
      >
        <div id="password" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Parolă nouă</Label>
            <Input
              id="new-password"
              type="password"
              className="agri-control h-12"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmă parola</Label>
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
