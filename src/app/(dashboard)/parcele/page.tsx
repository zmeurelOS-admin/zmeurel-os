import { createClient } from '@/lib/supabase/server'
import { ParcelaPageClient } from './ParcelaPageClient'

export default async function ParcelePage() {
  const supabase = await createClient()

  const { data: parcele } = await supabase
    .from('parcele')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="p-2 text-xs bg-black text-white">PARCELE V2 UI LOADED</div>
      <ParcelaPageClient initialParcele={parcele || []} />
    </>
  )
}