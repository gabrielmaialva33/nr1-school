const API_CACHE_STORAGE_KEY = 'nr1-school.api-cache'
const API_CACHE_BUSTER_KEY = 'nr1-school.api-cache.buster'
const API_CACHE_BUSTER = '2026-03-12.response-cache.v1'

export interface LocalCachePolicy {
  ttl_ms?: number
}

interface CachedApiResponse<T> {
  tenant_id: string | null
  path: string
  created_at: number
  expires_at: number
  payload: T
}

type ApiCacheState = Record<string, CachedApiResponse<unknown>>

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function parseStoredState() {
  if (!canUseBrowserStorage()) return {} as ApiCacheState

  const storedBuster = window.localStorage.getItem(API_CACHE_BUSTER_KEY)
  const storedState = window.localStorage.getItem(API_CACHE_STORAGE_KEY)

  if (!storedState || storedBuster !== API_CACHE_BUSTER) {
    window.localStorage.setItem(API_CACHE_STORAGE_KEY, JSON.stringify({}))
    window.localStorage.setItem(API_CACHE_BUSTER_KEY, API_CACHE_BUSTER)
    return {} as ApiCacheState
  }

  try {
    return JSON.parse(storedState) as ApiCacheState
  } catch {
    return {} as ApiCacheState
  }
}

function persistState(state: ApiCacheState) {
  if (!canUseBrowserStorage()) return
  window.localStorage.setItem(API_CACHE_STORAGE_KEY, JSON.stringify(state))
  window.localStorage.setItem(API_CACHE_BUSTER_KEY, API_CACHE_BUSTER)
}

function buildCacheKey(path: string, tenantId: string | null) {
  return `${tenantId ?? 'public'}::${path}`
}

export function readLocalCache<T>(path: string, tenantId: string | null) {
  const cacheKey = buildCacheKey(path, tenantId)
  const state = parseStoredState()
  const cached = state[cacheKey] as CachedApiResponse<T> | undefined

  if (!cached) return null
  if (Date.now() > cached.expires_at) {
    delete state[cacheKey]
    persistState(state)
    return null
  }

  return cached.payload
}

export function writeLocalCache<T>(
  path: string,
  tenantId: string | null,
  payload: T,
  policy?: LocalCachePolicy,
) {
  const state = parseStoredState()
  const cacheKey = buildCacheKey(path, tenantId)
  const ttl = policy?.ttl_ms ?? 60_000

  state[cacheKey] = {
    tenant_id: tenantId,
    path,
    created_at: Date.now(),
    expires_at: Date.now() + ttl,
    payload,
  }

  persistState(state)
}

export function clearTenantLocalCache(tenantId: string | null) {
  const state = parseStoredState()
  const nextState = Object.fromEntries(
    Object.entries(state).filter(([key]) => !key.startsWith(`${tenantId ?? 'public'}::`)),
  )
  persistState(nextState)
}

export function clearAllLocalCache() {
  persistState({})
}
