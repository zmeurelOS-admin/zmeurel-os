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
  basicUser: TestUser
  proUser: TestUser
  basicTenantId: string
  proTenantId: string
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
    'basicUser',
    'proUser',
    'basicTenantId',
    'proTenantId',
  ]

  for (const key of required) {
    if (!ctx[key]) {
      throw new Error(`Plan gating test context missing key: ${key}`)
    }
  }

  return ctx as TestContext
}

async function createTestUser(service: SupabaseClient, label: string): Promise<TestUser> {
  const email = `${uniqueToken(label)}@example.test`
  const password = `Pwd!${Math.random().toString(36).slice(2, 10)}1A`

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed creating ${label}: ${error?.message ?? 'unknown error'}`)
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
  await page.waitForURL(/\/(dashboard|rapoarte|planuri)/, { timeout: 15000 })
}

async function setMockPlan(page: Page, plan: 'basic' | 'pro') {
  await page.evaluate((value) => {
    window.localStorage.setItem('agri.subscription.plan', value)
  }, plan)
}

test.describe('Subscription Plan Gating Suite', () => {
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

    const basicUser = await createTestUser(service, 'plan_basic_user')
    const proUser = await createTestUser(service, 'plan_pro_user')

    const { data: basicTenant, error: basicTenantError } = await service
      .from('tenants')
      .insert({
        nume_ferma: uniqueToken('plan_basic_tenant'),
        owner_user_id: basicUser.id,
        plan: 'basic',
      })
      .select('id')
      .single()

    if (basicTenantError || !basicTenant?.id) {
      throw new Error(`Failed creating basic tenant: ${basicTenantError?.message ?? 'unknown error'}`)
    }

    const { data: proTenant, error: proTenantError } = await service
      .from('tenants')
      .insert({
        nume_ferma: uniqueToken('plan_pro_tenant'),
        owner_user_id: proUser.id,
        plan: 'pro',
      })
      .select('id')
      .single()

    if (proTenantError || !proTenant?.id) {
      throw new Error(`Failed creating pro tenant: ${proTenantError?.message ?? 'unknown error'}`)
    }

    ctx.url = url
    ctx.anonKey = anonKey
    ctx.serviceRoleKey = serviceRoleKey
    ctx.service = service
    ctx.basicUser = basicUser
    ctx.proUser = proUser
    ctx.basicTenantId = basicTenant.id
    ctx.proTenantId = proTenant.id
  })

  test.afterAll(async () => {
    if (!ctx.service) return

    try {
      if (ctx.basicTenantId) {
        await ctx.service.from('tenants').delete().eq('id', ctx.basicTenantId)
      }
      if (ctx.proTenantId) {
        await ctx.service.from('tenants').delete().eq('id', ctx.proTenantId)
      }
      if (ctx.basicUser?.id) {
        await ctx.service.auth.admin.deleteUser(ctx.basicUser.id)
      }
      if (ctx.proUser?.id) {
        await ctx.service.auth.admin.deleteUser(ctx.proUser.id)
      }
    } catch {
      // intentional no-op teardown
    }
  })

  test('Basic plan cannot access Smart Alerts and sees upgrade CTA', async ({ page }) => {
    const c = getCtx()

    await loginViaUi(page, c.basicUser.email, c.basicUser.password)
    await setMockPlan(page, 'basic')

    await page.goto('/dashboard')

    await expect(page.getByText('Smart Alerts este disponibil in Pro+')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Upgrade plan' }).first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Smart Alerts' })).toHaveCount(0)
  })

  test('Basic plan cannot export full season and sees Pro+ upgrade entry', async ({ page }) => {
    const c = getCtx()

    await loginViaUi(page, c.basicUser.email, c.basicUser.password)
    await setMockPlan(page, 'basic')

    await page.goto('/rapoarte')

    await expect(page.getByRole('link', { name: 'Export sezon complet (Pro+)' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Export sezon complet$/ })).toHaveCount(0)
  })

  test('Pro plan can access Smart Alerts and full season export', async ({ page }) => {
    const c = getCtx()

    await loginViaUi(page, c.proUser.email, c.proUser.password)
    await setMockPlan(page, 'pro')

    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Smart Alerts' })).toBeVisible()
    await expect(page.getByText('Smart Alerts este disponibil in Pro+')).toHaveCount(0)

    await page.goto('/rapoarte')
    await expect(page.getByRole('button', { name: /^Export sezon complet$/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Export sezon complet (Pro+)' })).toHaveCount(0)
  })

  test('Direct API access to premium export endpoint is blocked', async ({ request }) => {
    const response = await request.get('/api/rapoarte/export-sezon-complet')

    if (![401, 403, 404, 405].includes(response.status())) {
      throw new Error(
        `Expected premium export endpoint to be blocked, got HTTP ${response.status()}`
      )
    }

    expect(response.ok()).toBeFalsy()
  })
})
