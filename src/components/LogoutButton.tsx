'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    console.log('🔴 Logout clicked');

    try {
      setIsLoading(true);

      const supabase = createClient();

      // STEP 1: Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Eroare logout:', error);
        alert('Eroare la deconectare. Încearcă din nou.');
        return;
      }

      console.log('✅ Supabase signOut successful');

      // STEP 2: Cancel ongoing queries
      await queryClient.cancelQueries();

      // STEP 3: Clear React Query cache
      queryClient.clear();

      console.log('🧹 Cache cleared');

      // STEP 4: Hard redirect (complete reset)
      window.location.href = '/login';

    } catch (err) {
      console.error('❌ Eroare logout:', err);
      alert('Eroare la deconectare. Încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Se deconectează...' : '🚪 Ieșire'}
    </button>
  );
}