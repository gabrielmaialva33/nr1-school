import { apiFetch } from './api-client'
import { clearAllLocalCache } from './local-cache'

const ACTIVE_TENANT_STORAGE_KEY = 'nr1-school.active-tenant-id'

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getCurrentTenantId(): string | null {
  if (!canUseBrowserStorage()) return null
  return window.localStorage.getItem(ACTIVE_TENANT_STORAGE_KEY)
}

export function setCurrentTenantId(tenantId: string) {
  if (!canUseBrowserStorage()) return
  const currentTenantId = getCurrentTenantId()
  if (currentTenantId && currentTenantId !== tenantId) {
    clearAllLocalCache()
  }
  window.localStorage.setItem(ACTIVE_TENANT_STORAGE_KEY, tenantId)
}

export async function bootstrapTenantSession() {
  try {
    const response = await apiFetch('/api/auth/me', { tenantId: null })
    if (!response.ok) return null

    const payload = await response.json() as { user?: { school_id?: string | null } }
    const tenantId = payload.user?.school_id ?? null

    if (tenantId) {
      setCurrentTenantId(tenantId)
    }

    return tenantId
  } catch {
    return null
  }
}
