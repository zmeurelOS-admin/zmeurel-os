'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DailyPoint {
  day: string
  events: number
  activeUsers: number
}

interface TopEvent {
  eventName: string
  count: number
}

interface AnalyticsAdminClientProps {
  daily: DailyPoint[]
  topEvents: TopEvent[]
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function AnalyticsAdminClient({ daily, topEvents }: AnalyticsAdminClientProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="agri-control h-10"
        onClick={() => {
          downloadCsv(
            `analytics-zilnic-${new Date().toISOString().slice(0, 10)}.csv`,
            [
              ['Zi', 'Total events', 'Utilizatori activi'],
              ...daily.map((row) => [row.day, String(row.events), String(row.activeUsers)]),
            ]
          )
        }}
      >
        <Download className="mr-1 h-4 w-4" />
        Export zilnic
      </Button>

      <Button
        type="button"
        variant="outline"
        className="agri-control h-10"
        onClick={() => {
          downloadCsv(
            `analytics-top-events-${new Date().toISOString().slice(0, 10)}.csv`,
            [
              ['Event', 'Count'],
              ...topEvents.map((row) => [row.eventName, String(row.count)]),
            ]
          )
        }}
      >
        <Download className="mr-1 h-4 w-4" />
        Export top events
      </Button>
    </div>
  )
}

