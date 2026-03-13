import type { Environment, EnvironmentType } from '@/services/environments'

export type RiskTone = 'low' | 'medium' | 'high' | 'critical'
export type TypeFilter = 'all' | 'educational' | 'administrative' | 'food' | 'maintenance'

export interface EnvironmentCreateDraft {
  name: string
  type: string
  description: string
}

export const riskMeta: Record<RiskTone, { label: string; className: string }> = {
  low: { label: 'Baixo', className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Médio', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Alto', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-700' },
}

export const typeFilterLabels: Record<TypeFilter, string> = {
  all: 'Todos',
  educational: 'Educacional',
  administrative: 'Administrativo',
  food: 'Alimentação',
  maintenance: 'Operacional',
}

export function getEnvironmentTypeLabel(type: EnvironmentType) {
  const labels: Record<EnvironmentType, string> = {
    educational: 'Educacional',
    administrative: 'Administrativo',
    food: 'Alimentação',
    maintenance: 'Operacional',
    recreation: 'Operacional',
    security: 'Operacional',
  }

  return labels[type]
}

export function getEnvironmentRisk(environment: Environment): RiskTone {
  const typeWeight: Record<EnvironmentType, number> = {
    educational: 1,
    administrative: 0,
    food: 2,
    maintenance: 2,
    recreation: 1,
    security: 1,
  }

  const score = environment.employee_count + typeWeight[environment.type] * 3

  if (score >= 20) return 'critical'
  if (score >= 14) return 'high'
  if (score >= 8) return 'medium'
  return 'low'
}

export function createEmptyEnvironmentDraft(): EnvironmentCreateDraft {
  return {
    name: '',
    type: '',
    description: '',
  }
}
