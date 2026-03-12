import { getDefaultTenantId, getMockSession, getTenantSnapshot } from '../data/database'

export function resolveTenantId(request: Request) {
  const url = new URL(request.url)

  return (
    request.headers.get('x-tenant-id') ||
    url.searchParams.get('tenant_id') ||
    getMockSession()?.tenant_id ||
    getDefaultTenantId() ||
    ''
  )
}

export function requireTenantSnapshot(request: Request) {
  const tenantId = resolveTenantId(request)
  const snapshot = tenantId ? getTenantSnapshot(tenantId) : null

  return {
    tenantId,
    snapshot,
  }
}

export function paginate<T>(records: T[], request: Request, defaults?: { page?: number; perPage?: number }) {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page') || String(defaults?.page ?? 1))
  const perPage = Number(url.searchParams.get('per_page') || String(defaults?.perPage ?? 10))
  const total = records.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, lastPage)
  const start = (safePage - 1) * perPage

  return {
    data: records.slice(start, start + perPage),
    meta: {
      total,
      current_page: safePage,
      per_page: perPage,
      last_page: lastPage,
      first_page: 1,
    },
  }
}

export function sortByCreatedAtDesc<T extends { created_at: string }>(records: T[]) {
  return [...records].sort((left, right) => {
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}
