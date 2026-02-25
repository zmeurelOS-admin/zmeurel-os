import { test, expect, type Download, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type TestContext = {
  url: string
  anonKey: string
  serviceRoleKey: string
  service: SupabaseClient
  user: { id: string; email: string; password: string }
  tenantId: string
  parcelaId: string
  culegatorId: string
  clientId: string
  recoltareIds: string[]
  vanzareIds: string[]
  cheltuialaIds: string[]
  expectedKg: number
  expectedVenit: number
  expectedCost: number
}

const ctx: Partial<TestContext> = {}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function uniqueToken(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function getCtx(): TestContext {
  const required: Array<keyof TestContext> = [
    'url',
    'anonKey',
    'serviceRoleKey',
    'service',
    'user',
    'tenantId',
    'parcelaId',
    'culegatorId',
    'clientId',
    'recoltareIds',
    'vanzareIds',
    'cheltuialaIds',
    'expectedKg',
    'expectedVenit',
    'expectedCost',
  ]

  for (const key of required) {
    if (ctx[key] === undefined || ctx[key] === null) {
      throw new Error(`Reports test context missing key: ${key}`)
    }
  }

  return ctx as TestContext
}

function parseRoNumber(input: string): number {
  const raw = input.replace(/\s/g, '')
  const cleaned = raw.replace(/[^\d,.-]/g, '')
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

async function createTestUser(service: SupabaseClient) {
  const email = `${uniqueToken('reports_user')}@example.test`
  const password = `Pwd!${Math.random().toString(36).slice(2, 10)}1A`
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed creating reports test user: ${error?.message ?? 'unknown error'}`)
  }

  return {
    id: data.user.id,
    email,
    password,
  }
}

async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/\/(dashboard|rapoarte)/, { timeout: 15000 })
}

async function readDownloadText(download: Download): Promise<string> {
  const filePath = await download.path()
  if (!filePath) {
    throw new Error('CSV download path is empty')
  }
  const fs = await import('node:fs/promises')
  return fs.readFile(filePath, 'utf8')
}

async function getKpiValue(page: Page, title: string): Promise<number> {
  const card = page.locator('article').filter({ hasText: title }).first()
  await expect(card).toBeVisible()
  const valueText = (await card.locator('p').nth(1).textContent()) ?? ''
  return parseRoNumber(valueText)
}

test.describe('Reports Module Suite', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeAll(async () => {
    const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
    const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

    const service = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })

    const user = await createTestUser(service)

    const { data: tenant, error: tenantError } = await service
      .from('tenants')
      .insert({
        nume_ferma: uniqueToken('reports_ferma'),
        owner_user_id: user.id,
        plan: 'pro',
      })
      .select('id')
      .single()

    if (tenantError || !tenant?.id) {
      throw new Error(`Failed creating reports tenant: ${tenantError?.message ?? 'unknown error'}`)
    }

    const { data: parcela, error: parcelaError } = await service
      .from('parcele')
      .insert({
        id_parcela: `P_${uniqueToken('rep')}`,
        nume_parcela: 'PARCELA_REPORTS_SUITE',
        suprafata_m2: 200,
        an_plantare: 2021,
        soi_plantat: 'Zmeura',
        tenant_id: tenant.id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single()

    if (parcelaError || !parcela?.id) {
      throw new Error(`Failed creating reports parcela: ${parcelaError?.message ?? 'unknown error'}`)
    }

    const { data: culegator, error: culegatorError } = await service
      .from('culegatori')
      .insert({
        id_culegator: `C_${uniqueToken('rep')}`,
        nume_prenume: 'CULEGATOR_REPORTS_SUITE',
        tarif_lei_kg: 2.2,
        tenant_id: tenant.id,
      })
      .select('id')
      .single()

    if (culegatorError || !culegator?.id) {
      throw new Error(`Failed creating reports culegator: ${culegatorError?.message ?? 'unknown error'}`)
    }

    const { data: client, error: clientError } = await service
      .from('clienti')
      .insert({
        id_client: `CL_${uniqueToken('rep')}`,
        nume_client: 'CLIENT_REPORTS_SUITE',
        tenant_id: tenant.id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single()

    if (clientError || !client?.id) {
      throw new Error(`Failed creating reports client: ${clientError?.message ?? 'unknown error'}`)
    }

    const baseDate = todayIso()

    const { data: recoltari, error: recoltariError } = await service
      .from('recoltari')
      .insert([
        {
          client_sync_id: uniqueToken('rep_sync'),
          id_recoltare: `REC_${uniqueToken('a')}`.slice(0, 24),
          data: baseDate,
          parcela_id: parcela.id,
          culegator_id: culegator.id,
          cantitate_kg: 10,
          observatii: 'REPORTS_SUITE_ROW_1',
          tenant_id: tenant.id,
          created_by: user.id,
          updated_by: user.id,
        },
        {
          client_sync_id: uniqueToken('rep_sync'),
          id_recoltare: `REC_${uniqueToken('b')}`.slice(0, 24),
          data: baseDate,
          parcela_id: parcela.id,
          culegator_id: culegator.id,
          cantitate_kg: 5,
          observatii: 'REPORTS_SUITE_ROW_2',
          tenant_id: tenant.id,
          created_by: user.id,
          updated_by: user.id,
        },
      ])
      .select('id')

    if (recoltariError || !recoltari?.length) {
      throw new Error(`Failed creating reports recoltari: ${recoltariError?.message ?? 'unknown error'}`)
    }

    const { data: vanzari, error: vanzariError } = await service
      .from('vanzari')
      .insert([
        {
          client_sync_id: uniqueToken('rep_sync'),
          id_vanzare: `V_${uniqueToken('a')}`.slice(0, 24),
          data: baseDate,
          client_id: client.id,
          cantitate_kg: 5,
          pret_lei_kg: 20,
          status_plata: 'Platit',
          tenant_id: tenant.id,
          created_by: user.id,
          updated_by: user.id,
        },
        {
          client_sync_id: uniqueToken('rep_sync'),
          id_vanzare: `V_${uniqueToken('b')}`.slice(0, 24),
          data: baseDate,
          client_id: null, // incomplete data edge
          cantitate_kg: 2,
          pret_lei_kg: 30,
          status_plata: 'Avans',
          tenant_id: tenant.id,
          created_by: user.id,
          updated_by: user.id,
        },
      ])
      .select('id')

    if (vanzariError || !vanzari?.length) {
      throw new Error(`Failed creating reports vanzari: ${vanzariError?.message ?? 'unknown error'}`)
    }

    const { data: cheltuieli, error: cheltuieliError } = await service
      .from('cheltuieli_diverse')
      .insert([
        {
          client_sync_id: uniqueToken('rep_sync'),
          id_cheltuiala: `CH_${uniqueToken('a')}`.slice(0, 24),
          data: baseDate,
          categorie: 'Fertilizare',
          suma_lei: 50,
          tenant_id: tenant.id,
          created_by: user.id,
          updated_by: user.id,
        },
        {
          client_sync_id: uniqueToken('rep_sync'),
          id_cheltuiala: `CH_${uniqueToken('b')}`.slice(0, 24),
          data: baseDate,
          categorie: null, // incomplete data edge
          suma_lei: 10,
          tenant_id: tenant.id,
          created_by: user.id,
          updated_by: user.id,
        },
      ])
      .select('id')

    if (cheltuieliError || !cheltuieli?.length) {
      throw new Error(`Failed creating reports cheltuieli: ${cheltuieliError?.message ?? 'unknown error'}`)
    }

    ctx.url = url
    ctx.anonKey = anonKey
    ctx.serviceRoleKey = serviceRoleKey
    ctx.service = service
    ctx.user = user
    ctx.tenantId = tenant.id
    ctx.parcelaId = parcela.id
    ctx.culegatorId = culegator.id
    ctx.clientId = client.id
    ctx.recoltareIds = recoltari.map((r) => r.id)
    ctx.vanzareIds = vanzari.map((r) => r.id)
    ctx.cheltuialaIds = cheltuieli.map((r) => r.id)
    ctx.expectedKg = 15
    ctx.expectedVenit = 160
    ctx.expectedCost = 60
  })

  test.afterAll(async () => {
    if (!ctx.service) return
    try {
      if (ctx.recoltareIds?.length) {
        await ctx.service.from('recoltari').delete().in('id', ctx.recoltareIds)
      }
      if (ctx.vanzareIds?.length) {
        await ctx.service.from('vanzari').delete().in('id', ctx.vanzareIds)
      }
      if (ctx.cheltuialaIds?.length) {
        await ctx.service.from('cheltuieli_diverse').delete().in('id', ctx.cheltuialaIds)
      }
      if (ctx.clientId) {
        await ctx.service.from('clienti').delete().eq('id', ctx.clientId)
      }
      if (ctx.parcelaId) {
        await ctx.service.from('parcele').delete().eq('id', ctx.parcelaId)
      }
      if (ctx.culegatorId) {
        await ctx.service.from('culegatori').delete().eq('id', ctx.culegatorId)
      }
      if (ctx.tenantId) {
        await ctx.service.from('tenants').delete().eq('id', ctx.tenantId)
      }
      if (ctx.user?.id) {
        await ctx.service.auth.admin.deleteUser(ctx.user.id)
      }
    } catch {
      // noop teardown
    }
  })

  test('report totals match raw data and exports CSV/PDF', async ({ page }) => {
    const c = getCtx()
    await loginViaUi(page, c.user.email, c.user.password)
    await page.goto('/rapoarte')

    const totalKg = await getKpiValue(page, 'Productie totala')
    const totalVenit = await getKpiValue(page, 'Venit total')
    const totalCost = await getKpiValue(page, 'Costuri totale')

    expect(totalKg).toBe(c.expectedKg)
    expect(totalVenit).toBe(c.expectedVenit)
    expect(totalCost).toBe(c.expectedCost)

    const csvDownloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /Export CSV/i }).click()
    const csvDownload = await csvDownloadPromise
    const csvText = await readDownloadText(csvDownload)

    if (!csvText.includes('Indicator') || !csvText.includes('Valoare') || !csvText.includes('Unitate')) {
      throw new Error('CSV FORMAT FAILURE: missing expected headers')
    }
    if (!csvText.includes('kg')) {
      throw new Error('CSV FORMAT FAILURE: missing unit rows')
    }

    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: /Export PDF/i }).click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    const html = await popup.content()
    await popup.close()

    if (!html.includes('<table') || !html.includes('Indicator') || !html.includes('Valoare')) {
      throw new Error('PDF EXPORT FAILURE: generated document missing expected table content')
    }
  })

  test('edge cases: period with no data and incomplete data handling', async ({ page }) => {
    const c = getCtx()
    await loginViaUi(page, c.user.email, c.user.password)
    await page.goto('/rapoarte')

    // incomplete data check (vanzare without client_id should aggregate under "Fara client")
    const reportTypeTrigger = page.getByRole('combobox').nth(3)
    await reportTypeTrigger.click()
    await page.getByRole('option', { name: /Vanzari per client/i }).click()
    await expect(page.getByText(/Fara client/i)).toBeVisible({ timeout: 10000 })

    // period without data
    const periodTrigger = page.getByRole('combobox').first()
    await periodTrigger.click()
    await page.getByRole('option', { name: /Custom range/i }).click()

    const fromInput = page.locator('input[type="date"]').first()
    const toInput = page.locator('input[type="date"]').nth(1)
    await fromInput.fill('2099-01-01')
    await toInput.fill('2099-01-31')

    await expect(page.getByText(/Fara rezultate pentru filtrele curente/i)).toBeVisible({ timeout: 10000 })
  })
})

