import { createBrowserClient } from '@supabase/ssr'

// Creează client Supabase
const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Export direct pentru folosire în componente
export const supabase = supabaseClient

// Export și funcția (pentru backwards compatibility)
export function createClient() {
  return supabaseClient
}
