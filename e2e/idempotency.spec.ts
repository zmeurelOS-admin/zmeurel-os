import { test, expect, type Page } from '@playwright/test'
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
    'parcelaId',
    'culegatorId',
  ]

  for (const key of required) {
    if (!ctx[key]) {
      throw new Error(`Idempotency test context missing key: ${key}`)
    }
  }

  return ctx as TestContext
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

async function createTestUser(service: SupabaseClient) {
  const email = `${uniqueToken('idempo_user')}@example.test`
  const password = `Pwd!${Math.random().toString(36).slice(2, 10)}1A`

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed creating test user: ${error?.message ?? 'unknown error'}`)
  }

  return {
    id: data.user.id,
    email,
    password,
  }
}

async function signInUser(url: string, anonKey: string, email: string, password: string) {
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) {
    throw new Error(`Failed sign in for ${email}: ${error.message}`)
  }

  return client
}

async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/\/(dashboard|recoltari)/, { timeout: 15000 })
}

test.describe('Idempotency & Duplicate Prevention Suite', () => {
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
        nume_ferma: uniqueToken('idempo_ferma'),
        owner_user_id: user.id,
        plan: 'basic',
      })
      .select('id')
      .single()

    if (tenantError || !tenant?.id) {
      throw new Error(`Failed creating tenant: ${tenantError?.message ?? 'unknown error'}`)
    }

    const { data: parcela, error: parcelaError } = await service
      .from('parcele')
      .insert({
        id_parcela: `P_${uniqueToken('id')}`,
        nume_parcela: 'PARCELA_IDEMPOTENCY',
        suprafata_m2: 100,
        an_plantare: 2022,
        tenant_id: tenant.id,
        created_by: user.id,
        updated_by: user.id,
      })
      .select('id')
      .single()

    if (parcelaError || !parcela?.id) {
      throw new Error(`Failed creating parcela seed: ${parcelaError?.message ?? 'unknown error'}`)
    }

    const { data: culegator, error: culegatorError } = await service
      .from('culegatori')
      .insert({
        id_culegator: `C_${uniqueToken('id')}`,
        nume_prenume: 'CULEGATOR_IDEMPOTENCY',
        tarif_lei_kg: 2.5,
        tenant_id: tenant.id,
      })
      .select('id')
      .single()

    if (culegatorError || !culegator?.id) {
      throw new Error(`Failed creating culegator seed: ${culegatorError?.message ?? 'unknown error'}`)
    }

    ctx.url = url
    ctx.anonKey = anonKey
    ctx.serviceRoleKey = serviceRoleKey
    ctx.service = service
    ctx.user = user
    ctx.tenantId = tenant.id
    ctx.parcelaId = parcela.id
    ctx.culegatorId = culegator.id
  })

  test.afterAll(async () => {
    if (!ctx.service) return

    try {
      if (ctx.tenantId) {
        await ctx.service
          .from('recoltari')
          .delete()
          .or('observatii.ilike.%IDEMPOTENCY_TEST%,id_recoltare.ilike.REC_IDEMP_%')
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
      // noop in teardown
    }
  })

  test('same payload with same client_id logic cannot be created twice (UNIQUE + 409)', async ({ request }) => {
    const c = getCtx()
    const userClient = await signInUser(c.url, c.anonKey, c.user.email, c.user.password)
    const {
      data: { session },
    } = await userClient.auth.getSession()

    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing access token for duplicate payload test')
    }

    const clientId = uniqueToken('client_id_x')
    const payload = {
      client_sync_id: clientId,
      id_recoltare: `REC_IDEMP_${Math.floor(Math.random() * 999999)}`,
      data: todayIso(),
      parcela_id: c.parcelaId,
      culegator_id: c.culegatorId,
      cantitate_kg: 12.5,
      observatii: 'IDEMPOTENCY_TEST_DUPLICATE_PAYLOAD',
      tenant_id: c.tenantId,
      sync_status: 'pending',
      created_by: c.user.id,
      updated_by: c.user.id,
      updated_at: new Date().toISOString(),
    }

    const endpoint = `${c.url}/rest/v1/recoltari`
    const first = await request.post(endpoint, {
      headers: {
        apikey: c.anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=representation',
        'Content-Type': 'application/json',
      },
      data: payload,
    })

    expect([200, 201]).toContain(first.status())

    const second = await request.post(endpoint, {
      headers: {
        apikey: c.anonKey,
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=representation',
        'Content-Type': 'application/json',
      },
      data: payload,
    })

    if (second.status() !== 409) {
      throw new Error(`IDEMPOTENCY FAILURE: expected HTTP 409 on duplicate insert, got ${second.status()}`)
    }

    const secondBody = await second.text()
    if (!secondBody.includes('23505') && !secondBody.toLowerCase().includes('duplicate')) {
      throw new Error('IDEMPOTENCY FAILURE: duplicate insert did not expose unique-conflict signature')
    }

    const { count, error: verifyError } = await c.service
      .from('recoltari')
      .select('id', { count: 'exact', head: true })
      .eq('client_sync_id', clientId)

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`)
    }

    if (count !== 1) {
      throw new Error(`IDEMPOTENCY FAILURE: expected exactly 1 row for client_id ${clientId}, got ${count ?? 0}`)
    }
  })

  test('double click on Save does not create duplicates', async ({ page }) => {
    const c = getCtx()
    const marker = `IDEMPOTENCY_TEST_DOUBLE_CLICK_${uniqueToken('x')}`

    await loginViaUi(page, c.user.email, c.user.password)
    await page.goto('/recoltari')

    await page.getByRole('button', { name: /\+?\s*Recoltare/i }).first().click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await dialog.locator('#data').fill(todayIso())
    await dialog.locator('#parcela_id').fill(c.parcelaId)
    await dialog.locator('#culegator_id').fill(c.culegatorId)
    await dialog.locator('#cantitate_kg').fill('9.75')
    await dialog.locator('#observatii').fill(marker)

    const save = dialog.locator('button[type="submit"]')
    await Promise.allSettled([save.click(), save.click()])

    await expect(dialog).toBeHidden({ timeout: 15000 })

    const { count, error } = await c.service
      .from('recoltari')
      .select('id', { count: 'exact', head: true })
      .eq('observatii', marker)

    if (error) {
      throw new Error(`Verification after double click failed: ${error.message}`)
    }

    if (count !== 1) {
      throw new Error(`DOUBLE-CLICK FAILURE: expected 1 record, got ${count ?? 0}`)
    }
  })

  test('network retry with same client_id logic remains idempotent', async () => {
    const c = getCtx()
    const userClient = await signInUser(c.url, c.anonKey, c.user.email, c.user.password)
    const clientId = uniqueToken('network_retry_client_id')

    const payload = {
      client_sync_id: clientId,
      id_recoltare: `REC_IDEMP_${Math.floor(Math.random() * 999999)}`,
      data: todayIso(),
      parcela_id: c.parcelaId,
      culegator_id: c.culegatorId,
      cantitate_kg: 7.25,
      observatii: 'IDEMPOTENCY_TEST_NETWORK_RETRY',
      tenant_id: c.tenantId,
      sync_status: 'pending',
      created_by: c.user.id,
      updated_by: c.user.id,
      updated_at: new Date().toISOString(),
    }

    const first = await userClient.rpc('upsert_with_idempotency', {
      table_name: 'recoltari',
      payload,
    })

    if (first.error) {
      throw new Error(`Network retry test first call failed: ${first.error.message}`)
    }

    // simulate retry of the exact same payload after network uncertainty
    const second = await userClient.rpc('upsert_with_idempotency', {
      table_name: 'recoltari',
      payload,
    })

    if (second.error) {
      throw new Error(`Network retry test second call failed: ${second.error.message}`)
    }

    const { count, error } = await c.service
      .from('recoltari')
      .select('id', { count: 'exact', head: true })
      .eq('client_sync_id', clientId)

    if (error) {
      throw new Error(`Verification after network retry failed: ${error.message}`)
    }

    if (count !== 1) {
      throw new Error(`NETWORK RETRY FAILURE: expected 1 record, got ${count ?? 0}`)
    }
  })
})

