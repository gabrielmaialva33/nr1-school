import { apiFetch } from '@/lib/api-client'

export async function loginWithPassword(credentials: { email: string; password: string }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
}
