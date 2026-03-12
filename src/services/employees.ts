import { apiJson } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
export type { PaginationMeta } from '@/types/api'

export type EmployeeStatus = 'active' | 'on_leave' | 'inactive'

export interface Employee {
  id: string
  environment_id: string
  environment_name: string
  name: string
  cpf: string
  role: string
  admission_date: string
  status: EmployeeStatus
  email: string
}

export type EmployeesResponse = PaginatedResponse<Employee>

export async function fetchEmployees(params: {
  page: number
  per_page: number
  search: string
  status: EmployeeStatus | 'all'
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  })

  if (params.search.trim()) query.set('search', params.search.trim())
  if (params.status !== 'all') query.set('status', params.status)

  return apiJson<EmployeesResponse>(`/api/employees?${query.toString()}`)
}

export async function fetchEmployeesStats() {
  const payload = await apiJson<EmployeesResponse>('/api/employees?page=1&per_page=200')

  return {
    total: payload.meta.total,
    active: payload.data.filter(employee => employee.status === 'active').length,
    on_leave: payload.data.filter(employee => employee.status === 'on_leave').length,
  }
}

export async function fetchEmployeeById(employeeId: string) {
  return apiJson<Employee>(`/api/employees/${employeeId}`)
}
