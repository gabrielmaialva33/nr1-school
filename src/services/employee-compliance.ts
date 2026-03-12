import { apiJson } from '@/lib/api-client'
import type { PaginationMeta } from '@/types/api'
import type { Employee } from './employees'

export type TrainingStatus = 'scheduled' | 'in_progress' | 'completed'
export type ComplianceDocumentType = 'training_certificate' | 'ppe_delivery_receipt'
export type ComplianceDocumentStatus = 'validated' | 'expiring_soon' | 'pending_validation'

export interface TrainingLookup {
  id: string
  title: string
  status: TrainingStatus
  instructor: string
  scheduled_date: string
  validity_date: string
  validity_months: number
}

interface TrainingsLookupResponse {
  meta: PaginationMeta
  data: TrainingLookup[]
}

interface ComplianceEmployee extends Employee {
  tenant_id: string
}

export interface TrainingEnrollment {
  id: string
  tenant_id: string
  employee_id: string
  training_id: string
  status: 'completed' | 'in_progress'
  completed_at: string | null
  valid_until: string | null
  instructor_name: string
  created_at: string
}

export interface PpeDelivery {
  id: string
  tenant_id: string
  employee_id: string
  item_name: string
  ca_number: string
  delivered_at: string
  next_replacement_at: string | null
  signed_at: string | null
  created_at: string
}

export interface ComplianceDocument {
  id: string
  tenant_id: string
  employee_id: string
  training_enrollment_id: string | null
  ppe_delivery_id: string | null
  document_type: ComplianceDocumentType
  file_name: string
  mime_type: string
  file_size_bytes: number
  issued_at: string
  expires_at: string | null
  status: ComplianceDocumentStatus
  notes: string | null
  uploaded_at: string
}

export interface EmployeeComplianceOverview {
  meta: {
    tenant_id: string
    employee_id: string
    generated_at: string
    open_requirements: number
    expiring_documents: number
  }
  employee: ComplianceEmployee
  training_catalog: TrainingLookup[]
  training_enrollments: TrainingEnrollment[]
  ppe_deliveries: PpeDelivery[]
  compliance_documents: ComplianceDocument[]
}

export async function fetchTrainingsLookup() {
  const payload = await apiJson<TrainingsLookupResponse>('/api/trainings?page=1&per_page=100')
  return payload.data
}

export async function fetchEmployeeComplianceOverview(employeeId: string) {
  return apiJson<EmployeeComplianceOverview>(`/api/employees/${employeeId}/compliance`)
}

export async function createEmployeeComplianceDocument(
  employeeId: string,
  payload: {
    tenant_id: string
    document_type: ComplianceDocumentType
    training_id?: string
    equipment_name?: string
    ca_number?: string
    issued_at: string
    expires_at?: string
    notes?: string
    file_name: string
    mime_type: string
    file_size_bytes: number
  },
) {
  return apiJson<{ message: string }>(`/api/employees/${employeeId}/compliance-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    tenantId: payload.tenant_id,
    body: JSON.stringify(payload),
  })
}
