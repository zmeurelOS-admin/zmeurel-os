'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'

import { getSupabase } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      const supabase = getSupabase()
      const { error } = await supabase.auth.signOut()

      if (error) {
        alert('Eroare la deconectare. Încearcă din nou.')
        return
      }

      await queryClient.cancelQueries()
      queryClient.clear()
      router.push('/login')
      router.refresh()
    } catch {
      alert('Eroare la deconectare. Încearcă din nou.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? 'Se deconectează...' : 'Deconectare'}
    </button>
  )
}

