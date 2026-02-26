import { getSupabase } from '../client'
import type { Tables } from '@/types/supabase'

export type MiscareStoc = Tables<'miscari_stoc'>

export type CalitateStoc = 'cal1' | 'cal2'
export type DepozitStoc = 'fresh' | 'congelat' | 'procesat'
export type TipMiscareStoc =
  | 'recoltare'
  | 'vanzare'
  | 'consum'
  | 'oferit_gratuit'
  | 'procesare'
  | 'congelare'
  | 'pierdere'
  | 'ajustare'

export interface InsertMiscareStocInput {
  tenant_id?: string
  locatie_id: string
  produs: string
  calitate: CalitateStoc
  depozit: DepozitStoc
  tip_miscare: TipMiscareStoc
  cantitate_kg: number
  referinta_id?: string | null
  data?: string
  observatii?: string | null
}

export interface StocFilters {
  locatieId?: string
  produs?: string
  depozit?: DepozitStoc | 'all'
  calitate?: CalitateStoc | 'all'
}

export interface StocLocationRow {
  locatie_id: string
  locatie_nume: string
  produs: string
  stoc_fresh_cal1: number
  stoc_fresh_cal2: number
  stoc_congelat: number
  stoc_procesat: number
  total_kg: number
}

interface MiscareStocWithParcela {
  locatie_id: string
  produs: string
  calitate: CalitateStoc
  depozit: DepozitStoc
  tip_miscare: TipMiscareStoc
  cantitate_kg: number
  parcele: {
    nume_parcela: string | null
  } | null
}

type SupabaseLikeError = {
  code?: string
  message?: string
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function isMissingInventoryTableError(error: unknown): boolean {
  const err = (error ?? {}) as SupabaseLikeError
  const message = (err.message ?? '').toLowerCase()
  return (
    err.code === 'PGRST205' ||
    message.includes('could not find the table') ||
    message.includes('relation "public.miscari_stoc" does not exist')
  )
}

function signedQuantity(tipMiscare: TipMiscareStoc, cantitateKg: number): number {
  const outflowTypes: TipMiscareStoc[] = ['vanzare', 'consum', 'oferit_gratuit', 'pierdere']
  const qty = Math.max(0, Number(cantitateKg) || 0)
  return outflowTypes.includes(tipMiscare) ? -qty : qty
}

async function getTenantIdFromSession(): Promise<string> {
  const supabase = getSupabase()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Neautorizat')
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  if (tenantError || !tenant?.id) {
    throw new Error('Tenant invalid')
  }

  return tenant.id
}

export async function insertMiscareStoc(input: InsertMiscareStocInput): Promise<MiscareStoc> {
  const supabase = getSupabase()
  const tenantId = input.tenant_id ?? (await getTenantIdFromSession())

  const payload = {
    tenant_id: tenantId,
    locatie_id: input.locatie_id,
    produs: input.produs,
    calitate: input.calitate,
    depozit: input.depozit,
    tip_miscare: input.tip_miscare,
    cantitate_kg: round2(Math.max(0, Number(input.cantitate_kg) || 0)),
    referinta_id: input.referinta_id ?? null,
    data: input.data ?? new Date().toISOString().split('T')[0],
    observatii: input.observatii ?? null,
  }

  const { data, error } = await supabase.from('miscari_stoc').insert(payload).select().single()

  if (error) {
    if (isMissingInventoryTableError(error)) {
      throw new Error('Schema stocuri neinitializata')
    }
    throw error
  }
  return data
}

export async function deleteMiscariStocByReference(referintaId: string): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('miscari_stoc')
    .delete()
    .eq('referinta_id', referintaId)
    .eq('tip_miscare', 'recoltare')

  if (error && !isMissingInventoryTableError(error)) throw error
}

export async function getStocCantitateKg(params: {
  locatieId: string
  produs: string
  calitate: CalitateStoc
  depozit: DepozitStoc
}): Promise<number> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('miscari_stoc')
    .select('tip_miscare,cantitate_kg')
    .eq('locatie_id', params.locatieId)
    .eq('produs', params.produs)
    .eq('calitate', params.calitate)
    .eq('depozit', params.depozit)

  if (error) {
    if (isMissingInventoryTableError(error)) return 0
    throw error
  }

  const total = (data ?? []).reduce((sum, row) => {
    return sum + signedQuantity(row.tip_miscare as TipMiscareStoc, Number(row.cantitate_kg ?? 0))
  }, 0)

  return round2(total)
}

export async function getStocuriPeLocatii(filters: StocFilters = {}): Promise<StocLocationRow[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('miscari_stoc')
    .select('locatie_id,produs,calitate,depozit,tip_miscare,cantitate_kg,parcele(nume_parcela)')
    .order('data', { ascending: false })

  if (filters.locatieId) query = query.eq('locatie_id', filters.locatieId)
  if (filters.produs) query = query.eq('produs', filters.produs)
  if (filters.depozit && filters.depozit !== 'all') query = query.eq('depozit', filters.depozit)
  if (filters.calitate && filters.calitate !== 'all') query = query.eq('calitate', filters.calitate)

  const { data, error } = await query
  if (error) {
    if (isMissingInventoryTableError(error)) return []
    throw error
  }

  const rows = (data ?? []) as unknown as MiscareStocWithParcela[]
  const grouped = new Map<string, StocLocationRow>()

  rows.forEach((row) => {
    const key = `${row.locatie_id}:${row.produs}`
    const existing = grouped.get(key) ?? {
      locatie_id: row.locatie_id,
      locatie_nume: row.parcele?.nume_parcela ?? 'Locatie',
      produs: row.produs,
      stoc_fresh_cal1: 0,
      stoc_fresh_cal2: 0,
      stoc_congelat: 0,
      stoc_procesat: 0,
      total_kg: 0,
    }

    const qty = signedQuantity(row.tip_miscare, Number(row.cantitate_kg ?? 0))

    if (row.depozit === 'fresh' && row.calitate === 'cal1') {
      existing.stoc_fresh_cal1 = round2(existing.stoc_fresh_cal1 + qty)
    }
    if (row.depozit === 'fresh' && row.calitate === 'cal2') {
      existing.stoc_fresh_cal2 = round2(existing.stoc_fresh_cal2 + qty)
    }
    if (row.depozit === 'congelat') {
      existing.stoc_congelat = round2(existing.stoc_congelat + qty)
    }
    if (row.depozit === 'procesat') {
      existing.stoc_procesat = round2(existing.stoc_procesat + qty)
    }

    existing.total_kg = round2(
      existing.stoc_fresh_cal1 + existing.stoc_fresh_cal2 + existing.stoc_congelat + existing.stoc_procesat
    )

    grouped.set(key, existing)
  })

  return Array.from(grouped.values()).sort((a, b) => a.locatie_nume.localeCompare(b.locatie_nume, 'ro'))
}
