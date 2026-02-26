'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { trackEvent } from '@/lib/analytics/trackEvent'
import { getSupabase } from '@/lib/supabase/client'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getRedirectBase() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => getSupabase(), [])

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const [farmName, setFarmName] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [verificationPending, setVerificationPending] = useState(false)

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!EMAIL_REGEX.test(loginEmail)) {
      toast.error('Email invalid.')
      return
    }

    setLoginLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    })

    setLoginLoading(false)

    if (error) {
      toast.error('Email sau parolă incorectă.')
      return
    }

    trackEvent('login_success', 'auth', { source: 'login_page' })
    router.push('/dashboard')
    router.refresh()
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!EMAIL_REGEX.test(registerEmail)) {
      toast.error('Email invalid.')
      return
    }

    if (farmName.trim().length < 2) {
      toast.error('Numele fermei este obligatoriu.')
      return
    }

    if (registerPassword.length < 8) {
      toast.error('Parola trebuie să aibă minim 8 caractere.')
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      toast.error('Parolele nu coincid.')
      return
    }

    setRegisterLoading(true)

    const redirectBase = getRedirectBase()
    const emailRedirectTo = `${redirectBase}/auth/callback`

    const { error } = await supabase.auth.signUp({
      email: registerEmail.trim(),
      password: registerPassword,
      options: {
        emailRedirectTo,
        data: {
          farm_name: farmName.trim(),
        },
      },
    })

    setRegisterLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    trackEvent('register_success', 'auth', { source: 'login_page' })
    setVerificationPending(true)
    toast.success('Cont creat. Verifică emailul pentru confirmare.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[#312E3F]">Zmeurel OS</h1>
          <p className="mt-2 text-sm text-gray-500">Autentificare și creare cont fermier</p>
        </div>

        {verificationPending ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Verificare email în așteptare. Deschide emailul de confirmare și revino în aplicație.
          </div>
        ) : null}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Creează cont</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@exemplu.ro"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Parolă</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end">
                <Link href="/reset-password-request" className="text-sm font-medium text-emerald-700 hover:underline">
                  Ai uitat parola?
                </Link>
              </div>

              <Button type="submit" className="w-full bg-[#F16B6B] text-white hover:bg-[#e05555]" disabled={loginLoading}>
                {loginLoading ? 'Se autentifică...' : 'Intră în cont'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@exemplu.ro"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-farm">Nume fermă</Label>
                <Input
                  id="register-farm"
                  type="text"
                  placeholder="Ferma Mea"
                  value={farmName}
                  onChange={(event) => setFarmName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Parolă</Label>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minim 8 caractere"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password-confirm">Confirmă parola</Label>
                <Input
                  id="register-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repetă parola"
                  value={registerConfirmPassword}
                  onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-[#F16B6B] text-white hover:bg-[#e05555]" disabled={registerLoading}>
                {registerLoading ? 'Se creează contul...' : 'Creează cont'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



