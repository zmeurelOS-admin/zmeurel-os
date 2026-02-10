'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [numeFerma, setNumeFerma] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Parolele nu se potrivesc!')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere!')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Nu s-a putut crea utilizatorul')
      }

      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          nume_ferma: numeFerma,
          owner_user_id: authData.user.id,
          plan: 'freemium',
        })

      if (tenantError) throw tenantError

      alert('✅ Cont creat cu succes! Te poți loga acum.')
      router.push('/login')
    } catch (err) {
      console.error('Register error:', err)
      setError(err instanceof Error ? err.message : 'Eroare la înregistrare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#312E3F] mb-2">
            🍓 Zmeurel OS
          </h1>
          <p className="text-gray-600">
            Creează-ți cont gratuit
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-[#312E3F] mb-6">
            Înregistrare
          </h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="numeFerma" className="block text-sm font-medium text-gray-700 mb-2">
                Nume Fermă
              </label>
              <input
                id="numeFerma"
                type="text"
                value={numeFerma}
                onChange={(e) => setNumeFerma(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F16B6B] focus:border-transparent outline-none transition"
                placeholder="Ferma Zmeurel"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F16B6B] focus:border-transparent outline-none transition"
                placeholder="exemplu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Parolă (minim 6 caractere)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F16B6B] focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmă Parola
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F16B6B] focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F16B6B] hover:bg-[#E05A5A] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se creează contul...' : 'Creează cont'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Ai deja cont?{' '}
              <Link href="/login" className="text-[#F16B6B] hover:text-[#E05A5A] font-semibold">
                Intră în cont
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm font-semibold mb-2">
            ✨ Plan Freemium inclus:
          </p>
          <ul className="text-green-600 text-xs space-y-1">
            <li>• 1 parcelă</li>
            <li>• 50 recoltări/lună</li>
            <li>• Toate funcțiile de bază</li>
          </ul>
        </div>
      </div>
    </div>
  )
}