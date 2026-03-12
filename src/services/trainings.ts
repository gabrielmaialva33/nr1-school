import { differenceInCalendarDays } from 'date-fns'
import { apiJson } from '@/lib/api-client'

export type TrainingStatus = 'completed' | 'scheduled' | 'in_progress'

export interface Training {
  id: string
  title: string
  instructor: string
  scheduled_date: string
  duration_hours: number
  validity_months: number
  validity_date: string
  attendees: number
  status: TrainingStatus
}

export interface PaginationMeta {
  total: number
  current_page: number
  per_page: number
  last_page: number
  first_page: number
}

export interface TrainingsResponse {
  meta: PaginationMeta
  data: Training[]
}

export async function fetchTrainings(params: {
  page: number
  per_page: number
  search: string
  status: TrainingStatus | 'all'
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  })

  if (params.search.trim()) query.set('search', params.search.trim())
  if (params.status !== 'all') query.set('status', params.status)

  return apiJson<TrainingsResponse>(`/api/trainings?${query.toString()}`)
}

export async function fetchTrainingStats() {
  const payload = await apiJson<TrainingsResponse>('/api/trainings?page=1&per_page=100')
  const now = new Date()
  const completed = payload.data.filter(training => training.status === 'completed')
  const completedWithAttendees = completed.reduce((total, training) => total + training.attendees, 0)
  const totalRelevantAttendees = payload.data
    .filter(training => training.status !== 'scheduled')
    .reduce((total, training) => total + training.attendees, 0)
  const expiringSoon = completed.filter(training => {
    const daysToExpire = differenceInCalendarDays(new Date(training.validity_date), now)
    return daysToExpire >= 0 && daysToExpire < 30
  }).length

  return {
    completed: completed.length,
    attendance_rate:
      totalRelevantAttendees > 0
        ? Math.round((completedWithAttendees / totalRelevantAttendees) * 100)
        : 0,
    expiring_soon: expiringSoon,
    impacted_employees: payload.data.reduce((total, training) => total + training.attendees, 0),
  }
}
