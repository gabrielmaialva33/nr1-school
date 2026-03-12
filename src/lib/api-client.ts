import { toAbsoluteUrl } from './helpers'
import { clearTenantLocalCache, readLocalCache, type LocalCachePolicy, writeLocalCache } from './local-cache'
import { getCurrentTenantId } from './tenant'

interface ApiRequestInit extends RequestInit {
  tenantId?: string | null
  localCache?: false | LocalCachePolicy
}

function resolveApiUrl(pathname: string) {
  return pathname.startsWith('/api/') ? toAbsoluteUrl(pathname) : pathname
}

function resolveHeaders(init?: ApiRequestInit) {
  const headers = new Headers(init?.headers)
  const tenantId = init?.tenantId ?? getCurrentTenantId()

  if (tenantId && !headers.has('x-tenant-id')) {
    headers.set('x-tenant-id', tenantId)
  }

  return headers
}

export async function apiFetch(pathname: string, init?: ApiRequestInit) {
  const tenantId = init?.tenantId ?? getCurrentTenantId()
  const response = await fetch(resolveApiUrl(pathname), {
    ...init,
    headers: resolveHeaders(init),
  })

  const method = (init?.method ?? 'GET').toUpperCase()
  if (response.ok && method !== 'GET') {
    clearTenantLocalCache(tenantId)
  }

  return response
}

export async function apiJson<T>(pathname: string, init?: ApiRequestInit) {
  const method = (init?.method ?? 'GET').toUpperCase()
  const tenantId = init?.tenantId ?? getCurrentTenantId()
  const localCachePolicy = init?.localCache === undefined ? {} : init.localCache

  if (method === 'GET' && localCachePolicy !== false) {
    const cached = readLocalCache<T>(pathname, tenantId)
    if (cached) {
      return cached
    }
  }

  const response = await apiFetch(pathname, init)

  if (!response.ok) {
    throw new Error(`Falha na requisição para ${pathname}`)
  }

  const payload = await response.json() as T

  if (method === 'GET' && localCachePolicy !== false) {
    writeLocalCache(pathname, tenantId, payload, localCachePolicy)
  }

  return payload
}
