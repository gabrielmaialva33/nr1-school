import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, EyeOff, FileQuestion, Filter, Info, MoreVertical, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDatePtBr } from '@/lib/formatters'
import { createPaginationMeta } from '@/lib/pagination'
import {
  fetchComplaints,
  fetchComplaintStats,
  type Complaint,
  type ComplaintFilters,
  type PaginationMeta,
} from '@/services/complaints'
import { ComplaintCreateDialog, ComplaintDetailSheet, ComplaintStatCard } from './components'
import {
  complaintStatusMeta,
  complaintStatusOptions,
  createEmptyComplaintDraft,
  getComplaintCategoryLabel,
  getComplaintPriority,
} from './helpers'

type Filters = ComplaintFilters

export function ComplaintsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    page: 1,
    per_page: 10,
  })
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(() => createPaginationMeta(0, 1, 10))
  const [stats, setStats] = useState({
    total: 0,
    reviewing: 0,
    resolved: 0,
    anonymous: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(createEmptyComplaintDraft)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchComplaints(filters)
      .then(response => {
        if (!active) return
        setComplaints(response.data)
        setMeta(response.meta)
      })
      .catch(err => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Não foi possível carregar as denúncias')
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters])

  useEffect(() => {
    let active = true
    setIsStatsLoading(true)

    fetchComplaintStats()
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

  const hasActiveFilters = filters.search.trim() !== '' || filters.status !== 'all'
  const statusFilterLabel = filters.status === 'all' ? 'Filtros' : complaintStatusMeta[filters.status].label

  function handleCreateSubmit() {
    if (!createForm.category || !createForm.description.trim()) {
      toast.error('Preencha a categoria e a descrição.')
      return
    }

    toast.success('Denúncia registrada com sucesso. Protocolo gerado.')
    setIsCreateOpen(false)
    setCreateForm(createEmptyComplaintDraft())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Canal de Denúncias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe relatos de assédio e conflitos com sigilo e segurança.
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="solid"
              className="gap-2 self-start bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              Nova Denúncia
            </Button>
          </TooltipTrigger>
          <TooltipContent>Registrar nova denúncia</TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ComplaintStatCard
          title="Total"
          value={stats.total}
          helper="Denúncias registradas"
          icon={FileQuestion}
          tone="primary"
        />
        <ComplaintStatCard
          title="Em Análise"
          value={stats.reviewing}
          helper="Em andamento/investigação"
          icon={AlertTriangle}
          tone="warning"
        />
        <ComplaintStatCard
          title="Resolvidas"
          value={stats.resolved}
          helper="Casos já solucionados"
          icon={Info}
          tone="success"
        />
        <ComplaintStatCard
          title="Anônimas"
          value={stats.anonymous}
          helper="Identidade preservada"
          icon={EyeOff}
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Lista de denúncias</CardTitle>
          <CardToolbar className="w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <InputGroup className="w-full xl:max-w-md">
              <InputWrapper variant="lg">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  variant="lg"
                  value={filters.search}
                  onChange={event =>
                    setFilters(current => ({
                      ...current,
                      search: event.target.value,
                      page: 1,
                    }))
                  }
                  placeholder="Buscar por protocolo, categoria ou setor"
                />
              </InputWrapper>
            </InputGroup>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Filter className="size-4" />
                    {statusFilterLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {complaintStatusOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() =>
                        setFilters(current => ({
                          ...current,
                          status: option.value,
                          page: 1,
                        }))
                      }
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={String(filters.per_page)}
                onValueChange={value =>
                  setFilters(current => ({
                    ...current,
                    per_page: Number(value),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger size="lg" className="hidden min-w-40 sm:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 por página</SelectItem>
                  <SelectItem value="20">20 por página</SelectItem>
                  <SelectItem value="30">30 por página</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardToolbar>
        </CardHeader>

        <div className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-12 text-center md:table-cell">#</TableHead>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Prioridade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <div className="h-10 animate-pulse rounded-lg bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="space-y-2">
                        <p className="font-medium">Nenhuma denúncia encontrada</p>
                        <p className="text-sm text-muted-foreground">Ajuste os filtros para tentar novamente.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint, index) => {
                    const absoluteIndex = (meta.current_page - 1) * meta.per_page + index + 1
                    const priority = getComplaintPriority(complaint.category)

                    return (
                      <TableRow key={complaint.id}>
                        <TableCell className="hidden text-center font-medium text-muted-foreground md:table-cell">
                          {absoluteIndex}
                        </TableCell>
                        <TableCell className="font-medium">{complaint.protocol_number}</TableCell>
                        <TableCell>{getComplaintCategoryLabel(complaint.category)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDatePtBr(complaint.created_at)}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge className={cn('border-0', complaintStatusMeta[complaint.status].className)}>
                                  {complaintStatusMeta[complaint.status].label}
                                </Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{complaintStatusMeta[complaint.status].description}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge className={cn('border-0', priority.className)}>{priority.label}</Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{priority.description}</TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  aria-label={`Ações para ${complaint.protocol_number}`}
                                  onClick={() => setSelectedComplaint(complaint)}
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Ver detalhes</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading || isStatsLoading ? (
              'Carregando denúncias...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} denúncias
                {hasActiveFilters && ' filtradas'}
              </>
            ) : (
              'Nenhum registro para os filtros atuais'
            )}
          </div>

          <Pagination className="mx-0 w-auto justify-start md:justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page <= 1 || isLoading}
                  onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}
                >
                  Anterior
                </Button>
              </PaginationItem>

              {paginationItems.map(pageNumber => (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={pageNumber === meta.current_page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilters(current => ({ ...current, page: pageNumber }))}
                    disabled={isLoading}
                    className="min-w-9"
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page >= meta.last_page || isLoading}
                  onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}
                >
                  Próxima
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <ComplaintDetailSheet
        complaint={selectedComplaint}
        onOpenChange={open => {
          if (!open) setSelectedComplaint(null)
        }}
      />

      <ComplaintCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}
