import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPaginationMeta } from '@/lib/pagination'
import {
  fetchEnvironments,
  type Environment,
} from '@/services/environments'
import type { PaginationMeta } from '@/types/api'
import {
  EnvironmentCreateDialog,
  EnvironmentDetailsSheet,
  EnvironmentsStatsGrid,
  EnvironmentsTableCard,
} from './components'
import {
  createEmptyEnvironmentDraft,
  getEnvironmentTypeLabel,
  type TypeFilter,
} from './helpers'

export function EnvironmentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [createForm, setCreateForm] = useState(createEmptyEnvironmentDraft)
  const perPage = 10

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchEnvironments()
      .then(data => {
        if (!active) return
        setEnvironments(data)
      })
      .catch(err => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os setores')
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredEnvironments = useMemo(() => {
    let result = environments

    if (typeFilter !== 'all') {
      result = result.filter(environment => {
        if (typeFilter === 'maintenance') {
          return environment.type === 'maintenance' || environment.type === 'recreation' || environment.type === 'security'
        }
        return environment.type === typeFilter
      })
    }

    const term = search.trim().toLowerCase()
    if (!term) return result

    return result.filter(environment =>
      environment.name.toLowerCase().includes(term) ||
      environment.description.toLowerCase().includes(term) ||
      getEnvironmentTypeLabel(environment.type).toLowerCase().includes(term),
    )
  }, [environments, search, typeFilter])

  const meta = useMemo<PaginationMeta>(() => {
    return createPaginationMeta(filteredEnvironments.length, page, perPage)
  }, [filteredEnvironments.length, page])

  const currentData = useMemo(() => {
    const start = (meta.current_page - 1) * meta.per_page
    return filteredEnvironments.slice(start, start + meta.per_page)
  }, [filteredEnvironments, meta.current_page, meta.per_page])

  const paginationItems = useMemo(() => {
    return Array.from({ length: meta.last_page }, (_, index) => index + 1)
  }, [meta.last_page])

  useEffect(() => {
    setPage(1)
  }, [search, typeFilter])

  function handleCreateSubmit() {
    if (!createForm.name.trim()) {
      toast.error('Informe o nome do setor')
      return
    }
    if (!createForm.type) {
      toast.error('Selecione o tipo do setor')
      return
    }

    toast.success('Setor cadastrado com sucesso')
    setIsCreateOpen(false)
    setCreateForm(createEmptyEnvironmentDraft())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Setores</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize os ambientes da escola e acompanhe a criticidade operacional por setor.
          </p>
        </div>

        <Button variant="primary" size="lg" className="gap-2 self-start" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          Novo Setor
        </Button>
      </div>

      <EnvironmentsStatsGrid environments={environments} />

      <EnvironmentsTableCard
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        isLoading={isLoading}
        error={error}
        environments={currentData}
        meta={meta}
        paginationItems={paginationItems}
        onPreviousPage={() => setPage(current => current - 1)}
        onNextPage={() => setPage(current => current + 1)}
        onGoToPage={setPage}
        onSelectEnvironment={setSelectedEnv}
      />

      <EnvironmentDetailsSheet
        environment={selectedEnv}
        onOpenChange={open => {
          if (!open) setSelectedEnv(null)
        }}
      />

      <EnvironmentCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}
