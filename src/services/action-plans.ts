import { apiJson } from '@/lib/api-client'

export type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'verified' | 'overdue'

export interface ActionPlanInvolvedEmployee {
  employee_id: string
  employee_name: string
  employee_role: string
  employee_avatar_url: string | null
}

export interface ActionPlan {
  id: string
  risk_id: string
  school_id: string
  title: string
  description: string
  action_type: 'preventive' | 'corrective' | 'monitoring'
  responsible_name: string
  involved_employees: ActionPlanInvolvedEmployee[]
  deadline: string
  status: PlanStatus
  created_at: string
}

export async function fetchActionPlans(statusFilter: PlanStatus | 'all') {
  const query = new URLSearchParams()
  if (statusFilter !== 'all') query.set('status', statusFilter)
  return apiJson<{ data: ActionPlan[] }>(`/api/action-plans${query.toString() ? `?${query.toString()}` : ''}`)
}
