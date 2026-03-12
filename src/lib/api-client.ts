import { toAbsoluteUrl } from './helpers'
import { getCurrentTenantId } from './tenant'

interface ApiRequestInit extends RequestInit {
  tenantId?: string | null
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
  return fetch(resolveApiUrl(pathname), {
    ...init,
    headers: resolveHeaders(init),
  })
}

export async function apiJson<T>(pathname: string, init?: ApiRequestInit) {
  const response = await apiFetch(pathname, init)

  if (!response.ok) {
    throw new Error(`Falha na requisição para ${pathname}`)
  }

  return response.json() as Promise<T>
}
