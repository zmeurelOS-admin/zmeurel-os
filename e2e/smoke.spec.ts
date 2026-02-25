import { test, expect, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type TestUser = {
  id: string
  email: string
  password: string
}

type TestContext = {
  url: string
  anonKey: string
  serviceRoleKey: string
  service: SupabaseClient
  user: TestUser
  tenantId: string
  culegatorId: string
  parcelaName: string
  parcelaId?: string
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

function getCtx(): TestContext {
  const required: Array<keyof TestContext> = [
    'url',
    'anonKey',
    'serviceRoleKey',
    'service',
    'user',
    'tenantId',
    'culegatorId',
    'parcelaName',
  ]

  for (const key of required) {
    if (!ctx[key]) {
      throw new Error(`Smoke test context missing key: ${key}`)
    }
  }

  return ctx as TestContext
}

async function createTestUser(service: SupabaseClient): Promise<TestUser> {
  const email = `${uniqueToken('smoke_user')}@example.test`
  const password = `Pwd!${Math.random().toString(36).slice(2, 10)}1A`

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed creating smoke test user: ${error?.message ?? 'unknown error'}`)
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
  await page.getByRole('button', { name: /intra|login/i }).click()
  await page.waitForURL(/\/(dashboard|parcele)/, { timeout: 20000 })
}

function parseRoNumber(input: string): number {
  const raw = input.replace(/\s/g, '')
  const cleaned = raw.replace(/[^\d,.-]/g, '')
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const value = Number(normalized)
  return Number.isFinite(value) ? value : 0
}

test.describe('Main User Journey Smoke Suite', () => {
  test.describe.configure({ mode: 'serial' })
  test.use({ viewport: { width: 1366, height: 900 } })

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
        nume_ferma: uniqueToken('smoke_ferma'),
        owner_user_id: user.id,
        plan: 'pro',
      })
      .select('id')
      .single()

    if (tenantError || !tenant?.id) {
      throw new Error(`Failed creating smoke tenant: ${tenantError?.message ?? 'unknown error'}`)
    }

    const { data: culegator, error: culegatorError } = await service
      .from('culegatori')
      .insert({
        id_culegator: `CUL_SMOKE_${Math.floor(Math.random() * 1000000)}`,
        nume_prenume: 'CULEGATOR_SMOKE_FLOW',
        tarif_lei_kg: 2.5,
        tenant_id: tenant.id,
      })
      .select('id')
      .single()

    if (culegatorError || !culegator?.id) {
      throw new Error(`Failed creating smoke culegator: ${culegatorError?.message ?? 'unknown error'}`)
    }

    ctx.url = url
    ctx.anonKey = anonKey
    ctx.serviceRoleKey = serviceRoleKey
    ctx.service = service
    ctx.user = user
    ctx.tenantId = tenant.id
    ctx.culegatorId = culegator.id
    ctx.parcelaName = `PARCELA_SMOKE_${Math.floor(Math.random() * 1000000)}`
  })

  test.afterAll(async () => {
    if (!ctx.service) return

    try {
      if (ctx.parcelaId) {
        await ctx.service.from('recoltari').delete().eq('parcela_id', ctx.parcelaId)
      }

      if (ctx.tenantId) {
        await ctx.service
          .from('vanzari')
          .delete()
          .or('observatii_ladite.ilike.%SMOKE_FLOW%,id_vanzare.ilike.V%')
      }

      if (ctx.parcelaName) {
        await ctx.service.from('parcele').delete().eq('nume_parcela', ctx.parcelaName)
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
      // no-op teardown
    }
  })

  test('login -> create parcela -> create recoltare -> create vanzare -> verify profit -> generate report -> logout', async ({ page }) => {
    const c = getCtx()

    await loginViaUi(page, c.user.email, c.user.password)

    await page.goto('/parcele')
    await page.getByRole('button', { name: /^Adauga parcela$/ }).first().click()

    await page.fill('#nume_parcela', c.parcelaName)
    await page.fill('#suprafata_m2', '1200')
    await page.fill('#an_plantare', '2023')
    await page.fill('#nr_plante', '1000')

    await page.getByRole('button', { name: /^Salveaza$/ }).last().click()
    await expect(page.getByText(c.parcelaName)).toBeVisible({ timeout: 15000 })

    const { data: parcelaRow, error: parcelaError } = await c.service
      .from('parcele')
      .select('id')
      .eq('nume_parcela', c.parcelaName)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (parcelaError || !parcelaRow?.id) {
      throw new Error(`Failed resolving created parcela id: ${parcelaError?.message ?? 'unknown error'}`)
    }

    ctx.parcelaId = parcelaRow.id

    await page.goto('/recoltari')
    await page.getByRole('button', { name: /Recoltare/i }).first().click()

    await page.fill('#parcela_id', parcelaRow.id)
    await page.fill('#culegator_id', c.culegatorId)
    await page.fill('#cantitate_kg', '15.5')
    await page.fill('#observatii', 'SMOKE_FLOW_RECOLTARE')
    await page.getByRole('button', { name: /^Salveaza$/ }).last().click()

    await expect(page.getByText(/Recoltare adaugata/i)).toBeVisible({ timeout: 10000 })

    await page.goto('/vanzari')
    await page.getByRole('button', { name: /Adauga Vanzare/i }).first().click()

    await page.fill('#cantitate_kg', '10')
    await page.fill('#pret_lei_kg', '20')
    await page.fill('#observatii_ladite', 'SMOKE_FLOW_VANZARE')
    await page.getByRole('button', { name: /^Salveaza$/ }).last().click()

    await expect(page.getByText(/Vanzare adaugata/i)).toBeVisible({ timeout: 10000 })

    await page.goto('/dashboard')
    const profitCard = page.locator('article').filter({ hasText: 'Profit sezon' }).first()
    await expect(profitCard).toBeVisible({ timeout: 15000 })
    const profitValueText = (await profitCard.locator('p').nth(1).textContent()) ?? ''
    const profitValue = parseRoNumber(profitValueText)
    expect(profitValue).toBeGreaterThan(0)

    await page.goto('/rapoarte')
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible({ timeout: 15000 })

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /Export CSV/i }).click(),
    ])

    expect(download.suggestedFilename().toLowerCase()).toContain('.csv')

    await page.goto('/dashboard')
    const logoutButton = page.getByRole('button', { name: /ies|ie|deconect|logout/i }).first()
    await expect(logoutButton).toBeVisible({ timeout: 15000 })
    await logoutButton.click()
    await page.waitForURL(/\/login/, { timeout: 15000 })
  })
})
