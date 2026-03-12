import { apiJson } from '@/lib/api-client'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type RiskStatus = 'identified' | 'treating' | 'controlled' | 'eliminated'

export interface Risk {
  id: string
  category: string
  category_label: string
  environment_name: string
  probability: number
  severity: number
  risk_level: RiskLevel
  status: RiskStatus
  description: string
  created_at: string
}

export interface PaginationMeta {
  total: number
  current_page: number
  per_page: number
  last_page: number
  first_page: number
}

export interface RisksResponse {
  data: Risk[]
  meta: PaginationMeta
}

export interface RiskFilters {
  search: string
  status: 'all' | RiskStatus
  level: 'all' | RiskLevel
  page: number
  per_page: number
}

export async function fetchRisks(filters: RiskFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    per_page: String(filters.per_page),
  })

  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.level !== 'all') params.set('level', filters.level)

  return apiJson<RisksResponse>(`/api/risks?${params.toString()}`)
}

export async function fetchRiskStats() {
  const payload = await apiJson<RisksResponse>('/api/risks?page=1&per_page=200')
  const allRisks = payload.data

  return {
    total: payload.meta.total,
    critical: allRisks.filter((risk) => risk.risk_level === 'critical').length,
    treating: allRisks.filter((risk) => risk.status === 'treating').length,
    controlled: allRisks.filter((risk) => risk.status === 'controlled').length,
  }
}
