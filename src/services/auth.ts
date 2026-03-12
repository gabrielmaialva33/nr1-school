import { apiFetch, apiJson } from '@/lib/api-client'

export async function loginWithPassword(credentials: { email: string; password: string }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
}

export interface AuthSessionPayload {
  user: {
    id: string
    school_id: string
    name: string
    email: string
    role: string
    is_active: boolean
    avatar: string | null
    last_login: string
  } | null
  school: {
    id: string
    name: string
    city: string
    state: string
    employee_count: number
    plan_type: string
  } | null
}

export async function fetchAuthSession() {
  return apiJson<AuthSessionPayload>('/api/auth/me', {
    tenantId: null,
    localCache: false,
  })
}

export async function switchTenantSession(tenantId: string) {
  return apiJson<AuthSessionPayload & { token: string | null }>('/api/auth/switch-tenant', {
    method: 'POST',
    tenantId: null,
    localCache: false,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenant_id: tenantId }),
  })
}
