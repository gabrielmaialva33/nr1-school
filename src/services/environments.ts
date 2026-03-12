import { apiJson } from '@/lib/api-client'

export type EnvironmentType = 'educational' | 'administrative' | 'food' | 'maintenance' | 'recreation' | 'security'

export interface Environment {
  id: string
  name: string
  type: EnvironmentType
  employee_count: number
  description: string
  created_at: string
}

export async function fetchEnvironments() {
  const payload = await apiJson<{ data: Environment[] }>('/api/environments')
  return payload.data
}
