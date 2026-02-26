'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SubscriptionPlan } from '@/lib/subscription/plans'
import { getSupabase } from '@/lib/supabase/client'

export interface AdminTenantRow {
  tenant_id: string
  tenant_name: string
  owner_email: string | null
  plan: string | null
  created_at: string | null
  parcels_count: number
  users_count: number
}

interface PendingPlanChange {
  tenantId: string
  tenantName: string
  currentPlan: SubscriptionPlan
  nextPlan: SubscriptionPlan
}

interface AdminTenantsPlanTableProps {
  initialRows: AdminTenantRow[]
}

const PLAN_OPTIONS: SubscriptionPlan[] = ['freemium', 'pro', 'enterprise']

function normalizePlan(value: string | null | undefined): SubscriptionPlan {
  if (value === 'pro' || value === 'enterprise') {
    return value
  }
  return 'freemium'
}

function planBadgeClass(plan: SubscriptionPlan): string {
  if (plan === 'pro') return 'border-emerald-300 bg-emerald-50 text-emerald-800'
  if (plan === 'enterprise') return 'border-slate-300 bg-slate-100 text-slate-800'
  return 'border-amber-300 bg-amber-50 text-amber-800'
}

export function AdminTenantsPlanTable({ initialRows }: AdminTenantsPlanTableProps) {
  const [rows, setRows] = useState<AdminTenantRow[]>(initialRows)
  const [pendingChange, setPendingChange] = useState<PendingPlanChange | null>(null)

  const updatePlanMutation = useMutation({
    mutationFn: async (payload: PendingPlanChange) => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('admin_set_tenant_plan', {
        p_tenant_id: payload.tenantId,
        p_plan: payload.nextPlan,
      })

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (_data, payload) => {
      setRows((current) =>
        current.map((row) =>
          row.tenant_id === payload.tenantId
            ? {
                ...row,
                plan: payload.nextPlan,
              }
            : row
        )
      )
      toast.success(`Plan actualizat la ${payload.nextPlan} pentru ${payload.tenantName}.`)
      setPendingChange(null)
    },
    onError: (error) => {
      const message = (error as { message?: string })?.message ?? 'Nu am putut actualiza planul.'
      if (message.includes('FORBIDDEN')) {
        toast.error('Doar superadmin poate modifica planurile tenantilor.')
        return
      }
      if (message.includes('INVALID_PLAN')) {
        toast.error('Plan invalid. Alege Freemium, Pro sau Enterprise.')
        return
      }
      toast.error('Nu am putut actualiza planul tenantului.')
    },
  })

  return (
    <Card className="rounded-2xl border-[var(--agri-border)] shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Tenanti</CardTitle>
        <CardDescription>
          Superadmin poate vedea toate fermele si poate modifica planul de abonament.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4" />
          Actiunile de schimbare plan sunt protejate prin rolul `is_superadmin`.
        </div>

        {rows.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <ShieldAlert className="h-4 w-4" />
            Nu exista tenanti disponibili.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ferma</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Creat la</TableHead>
                <TableHead className="text-right">Parcele</TableHead>
                <TableHead className="text-right">Utilizatori</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const currentPlan = normalizePlan(row.plan)
                const createdAt = row.created_at ? row.created_at.slice(0, 10) : '-'

                return (
                  <TableRow key={row.tenant_id}>
                    <TableCell className="font-semibold text-[var(--agri-text)]">{row.tenant_name}</TableCell>
                    <TableCell>{row.owner_email ?? '-'}</TableCell>
                    <TableCell>
                      <div className="flex min-w-[190px] items-center gap-2">
                        <Badge variant="outline" className={planBadgeClass(currentPlan)}>
                          {currentPlan}
                        </Badge>
                        <Select
                          value={currentPlan}
                          onValueChange={(value: SubscriptionPlan) => {
                            const nextPlan = normalizePlan(value)
                            if (nextPlan === currentPlan) {
                              return
                            }
                            setPendingChange({
                              tenantId: row.tenant_id,
                              tenantName: row.tenant_name,
                              currentPlan,
                              nextPlan,
                            })
                          }}
                        >
                          <SelectTrigger className="h-9 w-[130px]">
                            <SelectValue placeholder="Schimba plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLAN_OPTIONS.map((plan) => (
                              <SelectItem key={plan} value={plan}>
                                {plan}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>{createdAt}</TableCell>
                    <TableCell className="text-right font-semibold">{row.parcels_count}</TableCell>
                    <TableCell className="text-right font-semibold">{row.users_count}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog open={Boolean(pendingChange)} onOpenChange={(open) => (!open ? setPendingChange(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmi schimbarea planului?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange
                ? `Ferma ${pendingChange.tenantName} va fi schimbata din ${pendingChange.currentPlan} in ${pendingChange.nextPlan}.`
                : 'Selecteaza un plan pentru confirmare.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuleaza</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                className="bg-[var(--agri-primary)] text-white hover:bg-emerald-700"
                disabled={!pendingChange || updatePlanMutation.isPending}
                onClick={() => {
                  if (!pendingChange) return
                  updatePlanMutation.mutate(pendingChange)
                }}
              >
                {updatePlanMutation.isPending ? 'Se salveaza...' : 'Confirma'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
