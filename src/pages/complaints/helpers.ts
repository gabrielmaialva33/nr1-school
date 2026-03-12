import type { Complaint, ComplaintStatus } from '@/services/complaints'

export interface ComplaintPriorityMeta {
  label: string
  description: string
  className: string
}

export interface ComplaintCreateDraft {
  category: string
  sector_reported: string
  description: string
  is_anonymous: boolean
}

export const complaintStatusMeta: Record<
  ComplaintStatus,
  { label: string; description: string; className: string }
> = {
  received: {
    label: 'Nova',
    description: 'Denúncia recebida, aguardando triagem',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200',
  },
  under_review: {
    label: 'Em Análise',
    description: 'Denúncia sendo analisada pela equipe',
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200',
  },
  investigating: {
    label: 'Investigando',
    description: 'Investigação em andamento',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
  },
  resolved: {
    label: 'Resolvida',
    description: 'Caso resolvido e encerrado',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
  },
  dismissed: {
    label: 'Arquivada',
    description: 'Denúncia arquivada sem procedência',
    className: 'bg-secondary text-secondary-foreground',
  },
}

export const complaintCategoryMeta: Record<string, string> = {
  moral_harassment: 'Assédio Moral',
  sexual_harassment: 'Assédio Sexual',
  poor_relationships: 'Relacionamentos Prejudiciais',
  difficult_conditions: 'Condições Difíceis',
  violence_trauma: 'Violência/Trauma',
}

export const complaintStatusOptions: Array<{ value: ComplaintStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'received', label: 'Nova' },
  { value: 'under_review', label: 'Em Análise' },
  { value: 'investigating', label: 'Investigando' },
  { value: 'resolved', label: 'Resolvida' },
  { value: 'dismissed', label: 'Arquivada' },
]

export const complaintCategoryOptions = [
  { value: 'moral_harassment', label: 'Assédio Moral' },
  { value: 'sexual_harassment', label: 'Assédio Sexual' },
  { value: 'poor_relationships', label: 'Relacionamentos Prejudiciais' },
  { value: 'difficult_conditions', label: 'Condições Difíceis' },
  { value: 'violence_trauma', label: 'Violência/Trauma' },
] as const

export function createEmptyComplaintDraft(): ComplaintCreateDraft {
  return {
    category: '',
    sector_reported: '',
    description: '',
    is_anonymous: false,
  }
}

export function getComplaintPriority(category: string): ComplaintPriorityMeta {
  if (category === 'sexual_harassment') {
    return {
      label: 'Crítica',
      description: 'Prioridade máxima - requer ação imediata',
      className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
    }
  }

  if (category === 'moral_harassment') {
    return {
      label: 'Alta',
      description: 'Prioridade alta - tratar com urgência',
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200',
    }
  }

  return {
    label: 'Média',
    description: 'Prioridade média - acompanhar normalmente',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200',
  }
}

export function getComplaintCategoryLabel(category: Complaint['category']) {
  return complaintCategoryMeta[category] || category
}
