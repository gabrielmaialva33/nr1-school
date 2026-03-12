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

export function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
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

export function formatDate(value: string | null | undefined) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatCpf(cpf: string) {
  const lastDigits = cpf.slice(-5)
  return `***.***.${lastDigits.slice(0, 3)}-${lastDigits.slice(3)}`
}

export function formatFileSize(file: File | null) {
  if (!file) return 'Nenhum arquivo anexado'
  if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`
}

export function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function addMonthsToDate(baseDate: string, months: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}
