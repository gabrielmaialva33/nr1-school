import { getInitials } from './names'

export function getNameInitials(name: string | null | undefined) {
  return getInitials(name, 2)
}

export function formatDatePtBr(value: string | Date | number | null | undefined) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

export function formatDateTimePtBr(value: string | Date | number | null | undefined) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatCpfMasked(cpf: string) {
  const lastDigits = cpf.slice(-5)
  return `***.***.${lastDigits.slice(0, 3)}-${lastDigits.slice(3)}`
}

export function formatFileSizeFromBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function formatOptionalFileSize(file: File | null) {
  if (!file) return 'Nenhum arquivo anexado'
  return formatFileSizeFromBytes(file.size)
}

export function addMonthsToIsoDate(baseDate: string, months: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

export function addDaysToIsoDate(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
