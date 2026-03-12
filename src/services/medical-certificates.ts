import { apiJson } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/api'
export type { PaginationMeta } from '@/types/api'

export interface MedicalCertificate {
  id: string
  employee_id: string
  employee_name: string
  school_id: string
  issue_date: string
  days_off: number
  icd_code: string
  is_mental_health: boolean
  doctor_name: string
  return_date: string
  inss_referral: boolean
  nexus_risk: 'low' | 'medium' | 'high' | 'none'
  created_at: string
}

export type MedicalCertificatesResponse = PaginatedResponse<MedicalCertificate>

export interface MedicalCertificateFilters {
  search: string
  page: number
  per_page: number
  nexus_risk: string
}

export interface EmployeeOption {
  id: string
  name: string
  environment_name: string
  role: string
  status: 'active' | 'on_leave' | 'inactive'
}

interface EmployeesLookupResponse {
  data: EmployeeOption[]
}

export async function fetchCertificates(filters: MedicalCertificateFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    per_page: String(filters.per_page),
  })
  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.nexus_risk !== 'all') params.set('nexus_risk', filters.nexus_risk)

  return apiJson<MedicalCertificatesResponse>(`/api/medical-certificates?${params.toString()}`)
}

export async function fetchCertificateStats() {
  const payload = await apiJson<MedicalCertificatesResponse>('/api/medical-certificates?page=1&per_page=1000')
  const all = payload.data

  const mentalHealthCount = all.filter(certificate => certificate.is_mental_health).length
  const highNexusCount = all.filter(certificate => certificate.nexus_risk === 'high').length
  const totalDays = all.reduce((accumulator, certificate) => accumulator + certificate.days_off, 0)
  const avgDays = all.length > 0 ? (totalDays / all.length).toFixed(1) : '0'

  return {
    total: payload.meta.total,
    mentalHealth: mentalHealthCount,
    highNexus: highNexusCount,
    avgDays,
  }
}

export async function fetchEmployeesLookup() {
  const payload = await apiJson<EmployeesLookupResponse>('/api/employees?page=1&per_page=200')
  return payload.data
}

export async function createMedicalCertificate(payload: {
  employee_id: string
  employee_name: string
  issue_date: string
  days_off: number
  icd_code: string
  is_mental_health: boolean
  doctor_name: string
  return_date: string
  inss_referral: boolean
  nexus_risk: 'low' | 'medium' | 'high' | 'none'
  attachment: {
    file_name: string
    mime_type: string
    file_size_bytes: number
  }
}) {
  return apiJson<{ message: string }>('/api/medical-certificates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
