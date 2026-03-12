import { apiJson } from '@/lib/api-client'

export interface TenantSummary {
  id: string
  name: string
  city: string
  state: string
  employee_count: number
  plan_type: string
}

export async function fetchTenants() {
  const payload = await apiJson<{ data: TenantSummary[] }>('/api/tenants', {
    tenantId: null,
    localCache: {
      ttl_ms: 5 * 60_000,
    },
  })

  return payload.data
}
