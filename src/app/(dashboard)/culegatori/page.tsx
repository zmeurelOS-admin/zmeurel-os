import { createClient } from '@/lib/supabase/server'
import { CulegatorPageClient } from './CulegatorPageClient'

export default async function Page() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('culegatori')
    .select('*')
    .order('created_at', { ascending: false })

  return <CulegatorPageClient initialCulegatori={data ?? []} />
}
