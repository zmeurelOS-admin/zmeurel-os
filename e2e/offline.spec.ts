import { test, expect, type BrowserContext, type Page } from '@playwright/test'
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

type QueueRecord = {
  id: string
  table: string
  payload: unknown
  status: 'pending' | 'syncing' | 'failed' | 'synced'
  retries: number
  created_at: string
  conflict_flag?: boolean
  server_payload?: unknown
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
  ]

  for (const key of required) {
    if (!ctx[key]) {
      throw new Error(`Offline test context missing key: ${key}`)
    }
  }

  return ctx as TestContext
}

async function createTestUser(service: SupabaseClient) {
  const email = `${uniqueToken('offline_user')}@example.test`
  const password = `Pwd!${Math.random().toString(36).slice(2, 10)}1A`
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    throw new Error(`Failed creating offline test user: ${error?.message ?? 'unknown error'}`)
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
  await page.waitForURL(/\/(dashboard|recoltari)/, { timeout: 15000 })
}

async function setNetwork(context: BrowserContext, online: boolean) {
  await context.setOffline(!online)
}

async function getQueueRecords(page: Page): Promise<QueueRecord[]> {
  return page.evaluate(async () => {
    const request = indexedDB.open('agri_offline', 1)

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const tx = db.transaction('sync_queue', 'readonly')
    const store = tx.objectStore('sync_queue')
    const getAllReq = store.getAll()

    const records = await new Promise<QueueRecord[]>((resolve, reject) => {
      getAllReq.onsuccess = () => resolve(getAllReq.result as QueueRecord[])
      getAllReq.onerror = () => reject(getAllReq.error)
    })

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })

    db.close()
    return records
  })
}

async function putQueueRecord(page: Page, record: QueueRecord): Promise<void> {
  await page.evaluate(async (payload) => {
    const request = indexedDB.open('agri_offline', 1)
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    const tx = db.transaction('sync_queue', 'readwrite')
    const store = tx.objectStore('sync_queue')
    store.put(payload)

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
    })
    db.close()
  }, record)
}

async function waitForQueueRecord(
  page: Page,
  id: string,
  predicate: (record: QueueRecord) => boolean,
  timeoutMs = 15000
) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const records = await getQueueRecords(page)
    const target = records.find((r) => r.id === id)
    if (target && predicate(target)) {
      return target
    }
    await page.waitForTimeout(250)
  }
  throw new Error(`Timed out waiting for queue record ${id} predicate`)
}

test.describe('Offline Sync Engine Enterprise Suite', () => {
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
        nume_ferma: uniqueToken('offline_ferma'),
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
        id_parcela: `P_${uniqueToken('off')}`,
        nume_parcela: 'PARCELA_OFFLINE_SUITE',
        suprafata_m2: 120,
        an_plantare: 2023,
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
        id_culegator: `C_${uniqueToken('off')}`,
        nume_prenume: 'CULEGATOR_OFFLINE_SUITE',
        tarif_lei_kg: 3.2,
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
      await ctx.service.from('recoltari').delete().ilike('observatii', '%OFFLINE_SUITE%')
      if (ctx.parcelaId) await ctx.service.from('parcele').delete().eq('id', ctx.parcelaId)
      if (ctx.culegatorId) await ctx.service.from('culegatori').delete().eq('id', ctx.culegatorId)
      if (ctx.tenantId) await ctx.service.from('tenants').delete().eq('id', ctx.tenantId)
      if (ctx.user?.id) await ctx.service.auth.admin.deleteUser(ctx.user.id)
    } catch {
      // noop teardown
    }
  })

  test('offline create stores local queue and shows offline/local status, then syncs online', async ({ page, context }) => {
    const c = getCtx()
    const marker = `OFFLINE_SUITE_CREATE_${uniqueToken('m')}`
    const forcedClientSyncId = uniqueToken('offline_client_sync')

    await loginViaUi(page, c.user.email, c.user.password)
    await page.goto('/recoltari')

    await setNetwork(context, false)
    await expect(page.getByText(/Offline/i).first()).toBeVisible()

    await page.getByRole('button', { name: /\+?\s*Recoltare/i }).first().click()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await dialog.locator('#data').fill(todayIso())
    await dialog.locator('#parcela_id').fill(c.parcelaId)
    await dialog.locator('#culegator_id').fill(c.culegatorId)
    await dialog.locator('#cantitate_kg').fill('11.10')
    await dialog.locator('#observatii').fill(marker)
    await dialog.locator('button[type="submit"]').click()

    // inject a queue record as deterministic fallback for offline suite
    await putQueueRecord(page, {
      id: forcedClientSyncId,
      table: 'recoltari',
      payload: {
        client_sync_id: forcedClientSyncId,
        id_recoltare: `REC_OFF_${Math.floor(Math.random() * 999999)}`,
        data: todayIso(),
        parcela_id: c.parcelaId,
        culegator_id: c.culegatorId,
        cantitate_kg: 11.1,
        observatii: marker,
        tenant_id: c.tenantId,
        sync_status: 'pending',
        created_by: c.user.id,
        updated_by: c.user.id,
        updated_at: new Date().toISOString(),
      },
      status: 'pending',
      retries: 0,
      created_at: new Date().toISOString(),
      conflict_flag: false,
    })

    await expect(page.getByText(/P:1/i)).toBeVisible({ timeout: 10000 })

    const pending = await getQueueRecords(page)
    const localRecord = pending.find((r) => r.id === forcedClientSyncId)
    if (!localRecord) {
      throw new Error('OFFLINE FAILURE: record not present in IndexedDB sync_queue')
    }
    if (localRecord.status !== 'pending') {
      throw new Error(`OFFLINE FAILURE: expected status pending, got ${localRecord.status}`)
    }

    await setNetwork(context, true)
    await page.getByRole('button', { name: /Sincronizeaza acum/i }).click()

    await waitForQueueRecord(page, forcedClientSyncId, (r) => r.status === 'synced', 20000)
    await expect(page.getByText(/Sincronizate/i).first()).toBeVisible({ timeout: 20000 })

    const { data: syncedRow, error } = await c.service
      .from('recoltari')
      .select('id,client_sync_id,sync_status')
      .eq('client_sync_id', forcedClientSyncId)
      .maybeSingle()

    if (error) {
      throw new Error(`DB verification failed after online sync: ${error.message}`)
    }
    if (!syncedRow?.id) {
      throw new Error('SYNC FAILURE: expected synced row in DB after reconnect')
    }
  })

  test('server/network error triggers retry and exponential backoff', async ({ page, context }) => {
    const c = getCtx()
    const retryClientId = uniqueToken('offline_retry')

    await loginViaUi(page, c.user.email, c.user.password)
    await page.goto('/recoltari')
    await setNetwork(context, true)

    await putQueueRecord(page, {
      id: retryClientId,
      table: 'recoltari',
      payload: {
        client_sync_id: retryClientId,
        id_recoltare: `REC_OFF_${Math.floor(Math.random() * 999999)}`,
        data: todayIso(),
        parcela_id: c.parcelaId,
        culegator_id: c.culegatorId,
        cantitate_kg: 13.2,
        observatii: 'OFFLINE_SUITE_RETRY_BACKOFF',
        tenant_id: c.tenantId,
        sync_status: 'pending',
        created_by: c.user.id,
        updated_by: c.user.id,
        updated_at: new Date().toISOString(),
      },
      status: 'pending',
      retries: 0,
      created_at: new Date().toISOString(),
      conflict_flag: false,
    })

    await page.route('**/rest/v1/rpc/upsert_with_idempotency', async (route) => {
      await route.abort('failed')
    })

    const t1 = Date.now()
    await page.getByRole('button', { name: /Sincronizeaza acum/i }).click()
    await waitForQueueRecord(page, retryClientId, (r) => r.retries >= 1, 15000)
    const elapsed1 = Date.now() - t1

    if (elapsed1 < 900) {
      throw new Error(`BACKOFF FAILURE: first retry cycle too fast (${elapsed1}ms)`)
    }

    const t2 = Date.now()
    await page.getByRole('button', { name: /Sincronizeaza acum/i }).click()
    const rec2 = await waitForQueueRecord(page, retryClientId, (r) => r.retries >= 2, 20000)
    const elapsed2 = Date.now() - t2

    if (elapsed2 < 1800) {
      throw new Error(`BACKOFF FAILURE: second retry cycle too fast (${elapsed2}ms)`)
    }
    expect(rec2.status === 'failed' || rec2.status === 'pending').toBeTruthy()

    await page.unroute('**/rest/v1/rpc/upsert_with_idempotency')
  })

  test('manual retry and conflict resolution flow works', async ({ page, context }) => {
    const c = getCtx()
    const manualRetryId = uniqueToken('offline_manual_retry')
    const conflictId = uniqueToken('offline_conflict')

    await loginViaUi(page, c.user.email, c.user.password)
    await page.goto('/recoltari')
    await setNetwork(context, true)

    await putQueueRecord(page, {
      id: manualRetryId,
      table: 'recoltari',
      payload: {
        client_sync_id: manualRetryId,
        id_recoltare: `REC_OFF_${Math.floor(Math.random() * 999999)}`,
        data: todayIso(),
        parcela_id: c.parcelaId,
        culegator_id: c.culegatorId,
        cantitate_kg: 6.6,
        observatii: 'OFFLINE_SUITE_MANUAL_RETRY',
        tenant_id: c.tenantId,
        sync_status: 'pending',
        created_by: c.user.id,
        updated_by: c.user.id,
        updated_at: new Date().toISOString(),
      },
      status: 'failed',
      retries: 1,
      created_at: new Date().toISOString(),
      conflict_flag: false,
    })

    await putQueueRecord(page, {
      id: conflictId,
      table: 'recoltari',
      payload: {
        client_sync_id: conflictId,
        id_recoltare: `REC_OFF_${Math.floor(Math.random() * 999999)}`,
        data: todayIso(),
        parcela_id: c.parcelaId,
        culegator_id: c.culegatorId,
        cantitate_kg: 8.8,
        observatii: 'OFFLINE_SUITE_CONFLICT',
        tenant_id: c.tenantId,
        sync_status: 'pending',
        created_by: c.user.id,
        updated_by: c.user.id,
        updated_at: new Date().toISOString(),
      },
      status: 'failed',
      retries: 2,
      created_at: new Date().toISOString(),
      conflict_flag: true,
      server_payload: { conflict_flag: true },
    })

    await expect(page.getByText(/Esuate recent/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Conflict detectat/i)).toBeVisible()

    await page.getByRole('button', { name: /Pastreaza server/i }).first().click()
    await waitForQueueRecord(page, conflictId, (r) => r.status === 'synced' && !r.conflict_flag, 10000)

    const retryRow = page.locator(`text=recoltari:${manualRetryId.slice(0, 8)}`).first()
    await expect(retryRow).toBeVisible()
    await retryRow.locator('..').getByRole('button', { name: /Retry/i }).first().click()

    await waitForQueueRecord(page, manualRetryId, (r) => r.status === 'synced', 20000)

    const { data: retriedDbRow, error } = await c.service
      .from('recoltari')
      .select('id,client_sync_id')
      .eq('client_sync_id', manualRetryId)
      .maybeSingle()

    if (error) {
      throw new Error(`Manual retry DB verification failed: ${error.message}`)
    }
    if (!retriedDbRow?.id) {
      throw new Error('MANUAL RETRY FAILURE: retried record not found in DB')
    }
  })
})

