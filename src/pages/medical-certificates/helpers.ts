import type { EmployeeOption } from '@/services/medical-certificates'

export interface UploadDraft {
  employee_id: string
  issue_date: string
  return_date: string
  days_off: string
  icd_code: string
  doctor_name: string
  nexus_risk: 'low' | 'medium' | 'high' | 'none'
  is_mental_health: boolean
  inss_referral: boolean
  notes: string
  file: File | null
}

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024
export const ACCEPTED_UPLOAD_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

export const nexusRiskMeta: Record<
  string,
  { label: string; description: string; className: string }
> = {
  high: {
    label: 'Alto',
    description: 'Forte relação com ambiente de trabalho',
    className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
  },
  medium: {
    label: 'Médio',
    description: 'Possível relação com ambiente de trabalho',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200',
  },
  low: {
    label: 'Baixo',
    description: 'Pouca relação com ambiente de trabalho',
    className: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200',
  },
  none: {
    label: '—',
    description: 'Sem relação com ambiente de trabalho',
    className: 'bg-secondary/50 text-muted-foreground',
  },
}

export const employeeStatusMeta: Record<
  EmployeeOption['status'],
  { label: string; className: string }
> = {
  active: {
    label: 'Ativo',
    className: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200',
  },
  on_leave: {
    label: 'Afastado',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200',
  },
  inactive: {
    label: 'Em férias',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200',
  },
}

export function createEmptyUploadDraft(): UploadDraft {
  return {
    employee_id: '',
    issue_date: '',
    return_date: '',
    days_off: '7',
    icd_code: '',
    doctor_name: '',
    nexus_risk: 'medium',
    is_mental_health: false,
    inss_referral: false,
    notes: '',
    file: null,
  }
}
