export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced'

export interface SyncQueueRecord {
  id: string
  table: string
  payload: unknown
  status: SyncStatus
  retries: number
  created_at: string
  conflict_flag?: boolean
  server_payload?: unknown
}

export interface EnqueueInput {
  id: string
  table: string
  payload: unknown
}

const DB_NAME = 'agri_offline'
const DB_VERSION = 1
const STORE_NAME = 'sync_queue'
const STATUS_INDEX = 'status'
const CREATED_AT_INDEX = 'created_at'

let dbPromise: Promise<IDBDatabase> | null = null

function ensureIndexedDb(): IDBFactory {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is only available in browser runtime.')
  }

  return indexedDB
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

async function getDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const idb = ensureIndexedDb()
    const openRequest = idb.open(DB_NAME, DB_VERSION)

    openRequest.onupgradeneeded = () => {
      const db = openRequest.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex(STATUS_INDEX, STATUS_INDEX, { unique: false })
        store.createIndex(CREATED_AT_INDEX, CREATED_AT_INDEX, { unique: false })
      }
    }

    openRequest.onsuccess = () => resolve(openRequest.result)
    openRequest.onerror = () => reject(openRequest.error)
  })

  return dbPromise
}

async function updateStatus(id: string, status: SyncStatus, incrementRetries = false): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const existing = await requestToPromise<SyncQueueRecord | undefined>(store.get(id))

  if (!existing) {
    await transactionDone(tx)
    return
  }

  const nextRecord: SyncQueueRecord = {
    ...existing,
    status,
    retries: incrementRetries ? existing.retries + 1 : existing.retries,
  }

  store.put(nextRecord)
  await transactionDone(tx)
}

async function getByStatus(status: SyncStatus): Promise<SyncQueueRecord[]> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const index = store.index(STATUS_INDEX)
  const records = await requestToPromise<SyncQueueRecord[]>(index.getAll(status))
  await transactionDone(tx)

  return records.sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export async function enqueue(input: EnqueueInput): Promise<SyncQueueRecord> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)

  const existing = await requestToPromise<SyncQueueRecord | undefined>(store.get(input.id))
  if (existing) {
    const updatedExisting: SyncQueueRecord = {
      ...existing,
      table: input.table,
      payload: input.payload,
      status: 'pending',
      conflict_flag: false,
      server_payload: undefined,
    }

    store.put(updatedExisting)
    await transactionDone(tx)
    return updatedExisting
  }

  const record: SyncQueueRecord = {
    id: input.id,
    table: input.table,
    payload: input.payload,
    status: 'pending',
    retries: 0,
    created_at: new Date().toISOString(),
    conflict_flag: false,
  }

  store.add(record)
  await transactionDone(tx)

  return record
}

export async function markSyncing(id: string): Promise<void> {
  await updateStatus(id, 'syncing')
}

export async function markSynced(id: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const existing = await requestToPromise<SyncQueueRecord | undefined>(store.get(id))
  if (!existing) {
    await transactionDone(tx)
    return
  }

  store.put({
    ...existing,
    status: 'synced',
    conflict_flag: false,
    server_payload: undefined,
  } satisfies SyncQueueRecord)
  await transactionDone(tx)
}

export async function markFailed(id: string): Promise<void> {
  await updateStatus(id, 'failed', true)
}

export async function markConflict(id: string, serverPayload?: unknown): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  const existing = await requestToPromise<SyncQueueRecord | undefined>(store.get(id))
  if (!existing) {
    await transactionDone(tx)
    return
  }

  store.put({
    ...existing,
    status: 'failed',
    retries: existing.retries + 1,
    conflict_flag: true,
    server_payload: serverPayload,
  } satisfies SyncQueueRecord)
  await transactionDone(tx)
}

export async function getPending(): Promise<SyncQueueRecord[]> {
  return getByStatus('pending')
}

export async function getFailed(): Promise<SyncQueueRecord[]> {
  return getByStatus('failed')
}
