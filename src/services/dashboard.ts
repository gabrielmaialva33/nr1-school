import { apiJson } from '@/lib/api-client'

export interface DashboardData {
  school: { name: string; deadline_days: number }
  kpis: Record<string, number>
  charts: {
    risk_distribution: Array<{ category: string; count: number; color: string }>
    score_evolution: Array<{ month: string; score: number }>
    certificate_trend: Array<{ month: string; total: number; mental_health: number }>
    risks_by_environment: Array<{ name: string; count: number }>
  }
  alerts: Array<{ type: string; message: string; link: string }>
}

export async function fetchDashboardData() {
  return apiJson<DashboardData>('/api/dashboard')
}
