import { test, expect } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type TestContext = {
  url: string
  anonKey: string
  serviceRoleKey: string
  service: SupabaseClient
  userA: { id: string; email: string; password: string }
  userB: { id: string; email: string; password: string }
  tenantAId: string
  tenantBId: string
  recordAId: string
  recordBId: string
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
    'userA',
    'userB',
    'tenantAId',
    'tenantBId',
    'recordAId',
    'recordBId',
  ]

  for (const key of required) {
    if (!ctx[key]) {
      throw new Error(`Security test context missing key: ${key}`)
    }
  }

  return ctx as TestContext
}

async function createTestUser(service: SupabaseClient, label: string) {
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

test.describe('Security Multi-Tenant RLS Suite', () => {
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

    const userA = await createTestUser(service, 'tenant_a')
    const userB = await createTestUser(service, 'tenant_b')

    const { data: tenantA, error: tenantAError } = await service
      .from('tenants')
      .insert({
        nume_ferma: uniqueToken('ferma_A'),
        owner_user_id: userA.id,
        plan: 'basic',
      })
      .select('id')
      .single()

    if (tenantAError || !tenantA?.id) {
      throw new Error(`Failed creating tenant A: ${tenantAError?.message ?? 'unknown error'}`)
    }

    const { data: tenantB, error: tenantBError } = await service
      .from('tenants')
      .insert({
        nume_ferma: uniqueToken('ferma_B'),
        owner_user_id: userB.id,
        plan: 'basic',
      })
      .select('id')
      .single()

    if (tenantBError || !tenantB?.id) {
      throw new Error(`Failed creating tenant B: ${tenantBError?.message ?? 'unknown error'}`)
    }

    const createdAt = new Date().toISOString()

    const { data: clientA, error: clientAError } = await service
      .from('clienti')
      .insert({
        id_client: `CTA_${uniqueToken('a')}`,
        nume_client: 'CLIENT_TENANT_A',
        tenant_id: tenantA.id,
        created_by: userA.id,
        updated_by: userA.id,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select('id')
      .single()

    if (clientAError || !clientA?.id) {
      throw new Error(`Failed creating seed client A: ${clientAError?.message ?? 'unknown error'}`)
    }

    const { data: clientB, error: clientBError } = await service
      .from('clienti')
      .insert({
        id_client: `CTB_${uniqueToken('b')}`,
        nume_client: 'CLIENT_TENANT_B',
        tenant_id: tenantB.id,
        created_by: userB.id,
        updated_by: userB.id,
        created_at: createdAt,
        updated_at: createdAt,
      })
      .select('id')
      .single()

    if (clientBError || !clientB?.id) {
      throw new Error(`Failed creating seed client B: ${clientBError?.message ?? 'unknown error'}`)
    }

    ctx.url = url
    ctx.anonKey = anonKey
    ctx.serviceRoleKey = serviceRoleKey
    ctx.service = service
    ctx.userA = userA
    ctx.userB = userB
    ctx.tenantAId = tenantA.id
    ctx.tenantBId = tenantB.id
    ctx.recordAId = clientA.id
    ctx.recordBId = clientB.id
  })

  test.afterAll(async () => {
    if (!ctx.service) return

    try {
      if (ctx.recordAId) {
        await ctx.service.from('clienti').delete().eq('id', ctx.recordAId)
      }
      if (ctx.recordBId) {
        await ctx.service.from('clienti').delete().eq('id', ctx.recordBId)
      }
      if (ctx.tenantAId) {
        await ctx.service.from('tenants').delete().eq('id', ctx.tenantAId)
      }
      if (ctx.tenantBId) {
        await ctx.service.from('tenants').delete().eq('id', ctx.tenantBId)
      }
      if (ctx.userA?.id) {
        await ctx.service.auth.admin.deleteUser(ctx.userA.id)
      }
      if (ctx.userB?.id) {
        await ctx.service.auth.admin.deleteUser(ctx.userB.id)
      }
    } catch {
      // intentional no-op for teardown
    }
  })

  test('userA cannot see userB data', async () => {
    const c = getCtx()

    const clientA = await signInUser(c.url, c.anonKey, c.userA.email, c.userA.password)
    const { data, error } = await clientA.from('clienti').select('id,tenant_id').in('id', [c.recordAId, c.recordBId])

    if (error) {
      throw new Error(`Unexpected read error for userA: ${error.message}`)
    }

    const ids = (data ?? []).map((row) => row.id)

    if (ids.includes(c.recordBId)) {
      throw new Error('SECURITY FAILURE: userA can see userB record')
    }

    expect(ids).toContain(c.recordAId)
  })

  test('userA cannot modify userB data', async () => {
    const c = getCtx()

    const clientA = await signInUser(c.url, c.anonKey, c.userA.email, c.userA.password)
    const probeName = `MUTATION_SHOULD_FAIL_${uniqueToken('x')}`

    const { data, error } = await clientA
      .from('clienti')
      .update({ nume_client: probeName })
      .eq('id', c.recordBId)
      .select('id,nume_client')

    if (error) {
      const allowedCodes = new Set(['42501', 'PGRST116'])
      if (!allowedCodes.has(error.code ?? '')) {
        throw new Error(`Unexpected update error code for RLS test: ${error.code ?? 'none'} - ${error.message}`)
      }
    }

    if ((data ?? []).length > 0) {
      throw new Error('SECURITY FAILURE: userA update returned rows for userB record')
    }

    const { data: verifyRow, error: verifyErr } = await c.service
      .from('clienti')
      .select('nume_client')
      .eq('id', c.recordBId)
      .single()

    if (verifyErr) {
      throw new Error(`Verification read failed: ${verifyErr.message}`)
    }

    if (verifyRow.nume_client === probeName) {
      throw new Error('SECURITY FAILURE: userA modified userB record in database')
    }
  })

  test('userA cannot delete userB data', async () => {
    const c = getCtx()

    const clientA = await signInUser(c.url, c.anonKey, c.userA.email, c.userA.password)

    const { data, error } = await clientA
      .from('clienti')
      .delete()
      .eq('id', c.recordBId)
      .select('id')

    if (error) {
      const allowedCodes = new Set(['42501', 'PGRST116'])
      if (!allowedCodes.has(error.code ?? '')) {
        throw new Error(`Unexpected delete error code for RLS test: ${error.code ?? 'none'} - ${error.message}`)
      }
    }

    if ((data ?? []).length > 0) {
      throw new Error('SECURITY FAILURE: userA delete returned deleted row for userB record')
    }

    const { data: verifyExists, error: verifyErr } = await c.service
      .from('clienti')
      .select('id')
      .eq('id', c.recordBId)
      .maybeSingle()

    if (verifyErr) {
      throw new Error(`Verification read failed: ${verifyErr.message}`)
    }

    if (!verifyExists?.id) {
      throw new Error('SECURITY FAILURE: userA deleted userB record')
    }
  })

  test('RLS blocks direct API query for other tenant', async ({ request }) => {
    const c = getCtx()

    const userClient = await signInUser(c.url, c.anonKey, c.userA.email, c.userA.password)
    const {
      data: { session },
    } = await userClient.auth.getSession()

    const accessToken = session?.access_token
    if (!accessToken) {
      throw new Error('Missing access token for userA direct API request')
    }

    const endpoint = `${c.url}/rest/v1/clienti?id=eq.${c.recordBId}&select=id,tenant_id`
    const response = await request.get(endpoint, {
      headers: {
        apikey: c.anonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok()) {
      const status = response.status()
      if (status !== 401 && status !== 403) {
        throw new Error(`Unexpected status for direct API RLS test: ${status}`)
      }
      return
    }

    const body = (await response.json()) as Array<{ id: string }>
    if (Array.isArray(body) && body.some((row) => row.id === c.recordBId)) {
      throw new Error('SECURITY FAILURE: direct API query returned another tenant record')
    }

    expect(Array.isArray(body)).toBeTruthy()
  })

  test('created_by and tenant_id cannot be modified manually', async () => {
    const c = getCtx()

    const clientA = await signInUser(c.url, c.anonKey, c.userA.email, c.userA.password)

    const { error } = await clientA
      .from('clienti')
      .update({
        created_by: c.userB.id,
        tenant_id: c.tenantBId,
      })
      .eq('id', c.recordAId)

    if (error && !['42501', 'PGRST116'].includes(error.code ?? '')) {
      throw new Error(`Unexpected immutability update error: ${error.code ?? 'none'} - ${error.message}`)
    }

    const { data: verifyRow, error: verifyErr } = await c.service
      .from('clienti')
      .select('created_by,tenant_id')
      .eq('id', c.recordAId)
      .single()

    if (verifyErr) {
      throw new Error(`Verification read failed: ${verifyErr.message}`)
    }

    if (verifyRow.created_by !== c.userA.id) {
      throw new Error('SECURITY FAILURE: created_by was modified manually')
    }

    if (verifyRow.tenant_id !== c.tenantAId) {
      throw new Error('SECURITY FAILURE: tenant_id was modified manually')
    }

    expect(verifyRow.created_by).toBe(c.userA.id)
    expect(verifyRow.tenant_id).toBe(c.tenantAId)
  })
})
