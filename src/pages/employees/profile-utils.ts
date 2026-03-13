import type {
  ComplianceDocumentStatus,
  ComplianceDocumentType,
  EmployeeComplianceOverview,
} from '@/services/employee-compliance'
import type { EmployeeStatus } from '@/services/employees'
import type { MedicalCertificate } from '@/services/medical-certificates'

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

export interface ComplianceAuditEvent {
  id: string
  occurred_at: string
  title: string
  description: string
  category: 'system' | 'document' | 'training' | 'ppe' | 'medical'
  tags: string[]
  tone: 'info' | 'success' | 'warning'
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

export function buildComplianceAuditTrail(
  compliance: EmployeeComplianceOverview,
  medicalCertificates: MedicalCertificate[],
): ComplianceAuditEvent[] {
  const documentEvents = compliance.compliance_documents.map((document) => ({
    id: `document-${document.id}`,
    occurred_at: document.uploaded_at,
    title:
      document.document_type === 'training_certificate'
        ? 'Documento de treinamento anexado'
        : 'Comprovante de EPI anexado',
    description: `${document.file_name} • status ${documentStatusMeta[document.status].label.toLowerCase()}`,
    category: 'document' as const,
    tags: [
      document.document_type === 'training_certificate' ? 'certificado' : 'comprovante-epi',
      documentStatusMeta[document.status].label.toLowerCase(),
    ],
    tone:
      document.status === 'validated'
        ? 'success'
        : document.status === 'expiring_soon'
          ? 'warning'
          : 'info',
  }))

  const trainingEvents = compliance.training_enrollments.map((enrollment) => ({
    id: `training-${enrollment.id}`,
    occurred_at: enrollment.completed_at ?? enrollment.created_at,
    title:
      enrollment.status === 'completed'
        ? 'Treinamento concluído'
        : 'Treinamento em andamento',
    description: `Instrutor ${enrollment.instructor_name}`,
    category: 'training' as const,
    tags: [enrollment.status === 'completed' ? 'concluido' : 'em-andamento', 'treinamento'],
    tone: enrollment.status === 'completed' ? 'success' : 'info',
  }))

  const ppeEvents = compliance.ppe_deliveries.map((delivery) => ({
    id: `ppe-${delivery.id}`,
    occurred_at: delivery.signed_at ?? delivery.delivered_at,
    title: 'Entrega de EPI registrada',
    description: `${delivery.item_name} • ${delivery.ca_number}`,
    category: 'ppe' as const,
    tags: ['epi', delivery.ca_number.toLowerCase()],
    tone:
      delivery.next_replacement_at &&
      new Date(delivery.next_replacement_at).getTime() < Date.now()
        ? 'warning'
        : 'info',
  }))

  const medicalEvents = medicalCertificates.map((certificate) => ({
    id: `medical-${certificate.id}`,
    occurred_at: certificate.created_at,
    title: 'Atestado médico registrado',
    description: `CID ${certificate.icd_code} • ${certificate.days_off} dia(s) • retorno ${certificate.return_date}`,
    category: 'medical' as const,
    tags: [
      certificate.is_mental_health ? 'saude-mental' : 'saude-geral',
      certificate.inss_referral ? 'inss' : 'sem-inss',
      `nexo-${certificate.nexus_risk}`,
    ],
    tone: certificate.nexus_risk === 'high' ? 'warning' : 'info',
  }))

  const dossierEvent: ComplianceAuditEvent = {
    id: `generated-${compliance.meta.generated_at}`,
    occurred_at: compliance.meta.generated_at,
    title: 'Dossiê consolidado',
    description: `Tenant ${compliance.meta.tenant_id} • ${compliance.meta.open_requirements} pendência(s) aberta(s)`,
    category: 'system',
    tags: ['dossie', 'snapshot'],
    tone: compliance.meta.open_requirements > 0 ? 'warning' : 'success',
  }

  return [
    dossierEvent,
    ...documentEvents,
    ...trainingEvents,
    ...ppeEvents,
    ...medicalEvents,
  ]
    .sort(
      (left, right) =>
        new Date(right.occurred_at).getTime() - new Date(left.occurred_at).getTime(),
    )
    .slice(0, 14)
}
