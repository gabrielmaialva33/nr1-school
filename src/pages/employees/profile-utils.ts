import type {
  ComplianceDocumentStatus,
  ComplianceDocumentType,
} from '@/services/employee-compliance'
import type { EmployeeStatus } from '@/services/employees'

export interface UploadDocumentDraft {
  document_type: ComplianceDocumentType
  training_id: string
  equipment_name: string
  ca_number: string
  issued_at: string
  expires_at: string
  notes: string
  file: File | null
}

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024
export const ACCEPTED_UPLOAD_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
]

export const employeeStatusMeta: Record<
  EmployeeStatus,
  { label: string; description: string; variant: 'success' | 'warning' | 'info' }
> = {
  active: {
    label: 'Ativo',
    description: 'Funcionário em exercício regular',
    variant: 'success',
  },
  on_leave: {
    label: 'Afastado',
    description: 'Em licença ou afastamento temporário',
    variant: 'warning',
  },
  inactive: {
    label: 'Em férias',
    description: 'Funcionário em período de descanso',
    variant: 'info',
  },
}

export const documentTypeMeta: Record<
  ComplianceDocumentType,
  { label: string; helper: string; variant: 'info' | 'warning' }
> = {
  training_certificate: {
    label: 'Certificado de treinamento',
    helper: 'Evidência de capacitação concluída pelo colaborador',
    variant: 'info',
  },
  ppe_delivery_receipt: {
    label: 'Comprovante de entrega de EPI',
    helper: 'Aceite assinado para item de proteção ou kit operacional',
    variant: 'warning',
  },
}

export const documentStatusMeta: Record<
  ComplianceDocumentStatus,
  { label: string; variant: 'success' | 'warning' | 'secondary' }
> = {
  validated: { label: 'Validado', variant: 'success' },
  expiring_soon: { label: 'Vencendo', variant: 'warning' },
  pending_validation: { label: 'Pendente', variant: 'secondary' },
}

export function createEmptyUploadDraft(): UploadDocumentDraft {
  return {
    document_type: 'training_certificate',
    training_id: '',
    equipment_name: '',
    ca_number: '',
    issued_at: '',
    expires_at: '',
    notes: '',
    file: null,
  }
}
