import { apiJson } from '@/lib/api-client'

export interface Assessment {
  id: string
  name: string
  period_start: string
  period_end: string
  sectors_count: number
  responses_count: number
  expected_responses: number
  participation_rate: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'completed' | 'draft'
  created_at: string
}

export async function fetchAssessments() {
  const payload = await apiJson<{ data: Assessment[] }>('/api/assessments')
  return payload.data
}
