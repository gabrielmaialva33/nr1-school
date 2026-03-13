import type { Training, TrainingStatus } from '@/services/trainings'

export interface TrainingCreateDraft {
  title: string
  instructor: string
  duration_hours: string
  scheduled_date: string
  description: string
}

export const trainingStatusMeta: Record<
  TrainingStatus,
  { label: string; variant: 'success' | 'info' | 'warning' }
> = {
  completed: { label: 'Regular', variant: 'success' },
  scheduled: { label: 'Agendado', variant: 'info' },
  in_progress: { label: 'Em andamento', variant: 'warning' },
}

export function createEmptyTrainingDraft(): TrainingCreateDraft {
  return {
    title: '',
    instructor: '',
    duration_hours: '',
    scheduled_date: '',
    description: '',
  }
}

export function getTrainingProgress(training: Training) {
  if (training.status === 'completed') return 100
  if (training.status === 'in_progress') return 50
  return 0
}
