import { createClient as createServiceClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'

import { AppShell } from '@/components/app/AppShell'
import { KpiCard } from '@/components/app/KpiCard'
import { PageHeader } from '@/components/app/PageHeader'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsAdminClient } from './AnalyticsAdminClient'

interface AnalyticsEventRow {
  event_name: string
  user_id: string
  created_at: string
}

function getSaasOwnerIds(): string[] {
  const raw = process.env.SAAS_OWNER_USER_IDS ?? process.env.SAAS_OWNER_USER_ID ?? ''
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const ownerIds = getSaasOwnerIds()
  if (ownerIds.length === 0 || !ownerIds.includes(user.id)) {
    notFound()
  }

  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceUrl || !serviceKey) {
    notFound()
  }

  const admin = createServiceClient(serviceUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const from = new Date()
  from.setDate(from.getDate() - 30)

  const { data } = await admin
    .from('analytics_events')
    .select('event_name,user_id,created_at')
    .gte('created_at', from.toISOString())
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as AnalyticsEventRow[]

  const dayMap = new Map<string, { events: number; users: Set<string> }>()
  const eventMap = new Map<string, number>()

  rows.forEach((row) => {
    const day = new Date(row.created_at).toISOString().slice(0, 10)
    const current = dayMap.get(day) ?? { events: 0, users: new Set<string>() }
    current.events += 1
    current.users.add(row.user_id)
    dayMap.set(day, current)

    eventMap.set(row.event_name, (eventMap.get(row.event_name) ?? 0) + 1)
  })

  const daily = Array.from(dayMap.entries())
    .map(([day, value]) => ({
      day,
      events: value.events,
      activeUsers: value.users.size,
    }))
    .sort((a, b) => a.day.localeCompare(b.day))

  const topEvents = Array.from(eventMap.entries())
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const totals = {
    events: rows.length,
    uniqueUsers: new Set(rows.map((row) => row.user_id)).size,
    daysWithActivity: daily.length,
  }

  return (
    <AppShell
      header={
        <PageHeader
          title="Admin Analytics"
          subtitle="Usage intern SaaS - ultimele 30 de zile"
        />
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-4 py-4">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard title="Total events" value={totals.events} />
          <KpiCard title="Utilizatori activi" value={totals.uniqueUsers} />
          <KpiCard title="Zile cu activitate" value={totals.daysWithActivity} />
        </section>

        <section className="agri-card space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[var(--agri-text)]">Export raport simplu</h2>
            <AnalyticsAdminClient daily={daily} topEvents={topEvents} />
          </div>
        </section>

        <section className="agri-card space-y-3 p-4">
          <h2 className="text-base font-bold text-[var(--agri-text)]">Total events per zi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--agri-border)] text-left">
                  <th className="px-2 py-2 font-semibold">Zi</th>
                  <th className="px-2 py-2 font-semibold">Events</th>
                  <th className="px-2 py-2 font-semibold">Utilizatori activi</th>
                </tr>
              </thead>
              <tbody>
                {daily.map((row) => (
                  <tr key={row.day} className="border-b border-[var(--agri-border)]">
                    <td className="px-2 py-2">{row.day}</td>
                    <td className="px-2 py-2 font-semibold">{row.events}</td>
                    <td className="px-2 py-2">{row.activeUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="agri-card space-y-3 p-4">
          <h2 className="text-base font-bold text-[var(--agri-text)]">Top 10 events</h2>
          <ol className="space-y-2">
            {topEvents.map((event) => (
              <li
                key={event.eventName}
                className="flex items-center justify-between rounded-lg border border-[var(--agri-border)] bg-[var(--agri-surface)] px-3 py-2"
              >
                <span className="font-medium">{event.eventName}</span>
                <span className="rounded-md bg-[var(--agri-primary)] px-2 py-1 text-xs font-semibold text-white">
                  {event.count}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  )
}

