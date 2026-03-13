import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPaginationMeta } from '@/lib/pagination'
import {
  fetchTrainings,
  fetchTrainingStats,
  type PaginationMeta,
  type Training,
  type TrainingStatus,
} from '@/services/trainings'
import {
  TrainingCreateDialog,
  TrainingsStatsGrid,
  TrainingsTableCard,
} from './components'
import { createEmptyTrainingDraft } from './helpers'

export function TrainingsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(() => createPaginationMeta(0, 1, 10))
  const [stats, setStats] = useState({
    completed: 0,
    attendance_rate: 0,
    expiring_soon: 0,
    impacted_employees: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<TrainingStatus | 'all'>('all')

  const [createForm, setCreateForm] = useState(createEmptyTrainingDraft)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchTrainings({ page, per_page: 10, search, status: statusFilter })
      .then(response => {
        if (!active) return
        setTrainings(response.data)
        setMeta(response.meta)
      })
      .catch(err => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os treinamentos')
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    let active = true
    setIsStatsLoading(true)

    fetchTrainingStats()
      .then(data => {
        if (!active) return
        setStats(data)
      })
      .finally(() => {
        if (!active) return
        setIsStatsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const paginationItems = useMemo(() => {
    return Array.from({ length: meta.last_page || 1 }, (_, index) => index + 1)
  }, [meta.last_page])

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all'

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    toast.success('Treinamento cadastrado com sucesso')
    setIsCreateOpen(false)
    setCreateForm(createEmptyTrainingDraft())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Treinamentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe agenda, validade e participação dos treinamentos obrigatórios da NR-1.
          </p>
        </div>

        <Button variant="primary" size="lg" className="gap-2 self-start" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          Novo Treinamento
        </Button>
      </div>

      <TrainingsStatsGrid stats={stats} />

      <TrainingsTableCard
        search={search}
        onSearchChange={value => {
          setSearch(value)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={status => {
          setStatusFilter(status)
          setPage(1)
        }}
        isLoading={isLoading}
        isStatsLoading={isStatsLoading}
        error={error}
        trainings={trainings}
        selectedTraining={selectedTraining}
        onSelectTraining={setSelectedTraining}
        meta={meta}
        paginationItems={paginationItems}
        hasActiveFilters={hasActiveFilters}
        onPreviousPage={() => setPage(current => current - 1)}
        onNextPage={() => setPage(current => current + 1)}
        onGoToPage={setPage}
      />

      <TrainingCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}
