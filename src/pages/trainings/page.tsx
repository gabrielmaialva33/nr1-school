import { useEffect, useMemo, useState, type ElementType } from 'react'
import { toast } from 'sonner'
import { CalendarClock, Filter, GraduationCap, MoreVertical, Plus, Search, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountingNumber } from '@/components/ui/counting-number'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createPaginationMeta } from '@/lib/pagination'
import { cn } from '@/lib/utils'
import {
  fetchTrainings,
  fetchTrainingStats,
  type PaginationMeta,
  type Training,
  type TrainingStatus,
} from '@/services/trainings'

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  title: string
  value: string | number
  helper: string
  icon: ElementType
  tone?: 'primary' | 'warning' | 'info' | 'success'
}) {
  const tones = {
    primary: {
      iconWrap: 'bg-primary/10 text-primary',
      value: 'text-primary',
    },
    warning: {
      iconWrap: 'bg-warning/10 text-warning',
      value: 'text-warning',
    },
    info: {
      iconWrap: 'bg-info/10 text-info',
      value: 'text-info',
    },
    success: {
      iconWrap: 'bg-success/10 text-success',
      value: 'text-success',
    },
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-semibold tracking-tight', tones[tone].value)}>
            {typeof value === 'number' ? <CountingNumber to={value} duration={1.5} /> : value}
          </p>
        </div>
        <div className={cn('flex size-11 items-center justify-center rounded-xl', tones[tone].iconWrap)}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

const statusMeta: Record<TrainingStatus, { label: string; variant: 'success' | 'info' | 'warning' }> = {
  completed: { label: 'Regular', variant: 'success' },
  scheduled: { label: 'Agendado', variant: 'info' },
  in_progress: { label: 'Em andamento', variant: 'warning' },
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

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

  const [createForm, setCreateForm] = useState({
    title: '',
    instructor: '',
    duration_hours: '',
    scheduled_date: '',
    description: '',
  })

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

  function handleCreateSubmit(event: React.FormEvent) {
    event.preventDefault()
    toast.success('Treinamento cadastrado com sucesso')
    setIsCreateOpen(false)
    setCreateForm({
      title: '',
      instructor: '',
      duration_hours: '',
      scheduled_date: '',
      description: '',
    })
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Realizados" value={stats.completed} helper="Treinamentos concluídos no ciclo atual" icon={GraduationCap} tone="success" />
        <StatCard title="Índice Presença" value={`${stats.attendance_rate}%`} helper="Participação consolidada nos treinamentos" icon={Users} tone="primary" />
        <StatCard title="A Vencer <30d" value={stats.expiring_soon} helper="Certificações que precisam de renovação" icon={CalendarClock} tone="warning" />
        <StatCard title="Colab. Impactados" value={stats.impacted_employees} helper="Soma total de participantes registrados" icon={Users} tone="info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de Treinamentos</CardTitle>
          <CardToolbar>
            <InputGroup className="w-full xl:max-w-md">
              <InputWrapper variant="lg">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  variant="lg"
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Buscar por tema ou instrutor"
                />
              </InputWrapper>
            </InputGroup>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 self-start">
                  <Filter className="size-4" />
                  {statusFilter === 'all' ? 'Filtros' : statusMeta[statusFilter].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => { setStatusFilter('all'); setPage(1) }}>
                  <span className={cn(statusFilter === 'all' && 'font-semibold')}>Todos</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setStatusFilter('completed'); setPage(1) }}>
                  <span className={cn(statusFilter === 'completed' && 'font-semibold')}>Regular</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setStatusFilter('scheduled'); setPage(1) }}>
                  <span className={cn(statusFilter === 'scheduled' && 'font-semibold')}>Agendado</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setStatusFilter('in_progress'); setPage(1) }}>
                  <span className={cn(statusFilter === 'in_progress' && 'font-semibold')}>Em andamento</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tema</TableHead>
                <TableHead className="hidden md:table-cell">Instrutor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="hidden md:table-cell">C.H.</TableHead>
                <TableHead className="hidden md:table-cell">Validade</TableHead>
                <TableHead>Status</TableHead>
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
              ) : trainings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhum treinamento encontrado</p>
                      <p className="text-sm text-muted-foreground">Tente outro termo para localizar a agenda desejada.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trainings.map(training => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{training.title}</p>
                        <p className="text-xs text-muted-foreground">Validade de {training.validity_months} meses</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{training.instructor}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(training.scheduled_date)}</TableCell>
                    <TableCell className="hidden md:table-cell font-medium">{training.duration_hours}h</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(training.validity_date)}</TableCell>
                    <TableCell>
                      <Badge variant={statusMeta[training.status].variant} appearance="light">
                        {statusMeta[training.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" mode="icon" aria-label={`Ações para ${training.title}`}>
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Mais ações</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setSelectedTraining(training)}>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setSelectedTraining(training)}>Editar treinamento</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading || isStatsLoading ? (
              'Carregando treinamentos...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} treinamentos
                {hasActiveFilters && ' filtrados'}
              </>
            ) : (
              'Nenhum registro para a busca atual'
            )}
          </div>

          <Pagination className="mx-0 w-auto justify-start md:justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.current_page <= 1 || isLoading}
                  onClick={() => setPage(current => current - 1)}
                >
                  Anterior
                </Button>
              </PaginationItem>

              {paginationItems.map(pageNumber => (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={pageNumber === meta.current_page ? 'primary' : 'outline'}
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setPage(pageNumber)}
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
                  onClick={() => setPage(current => current + 1)}
                >
                  Próxima
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      {/* Training Details Sheet */}
      <Sheet open={!!selectedTraining} onOpenChange={open => !open && setSelectedTraining(null)}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedTraining && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTraining.title}</SheetTitle>
              </SheetHeader>

              <SheetBody className="space-y-5">
                <div className="flex items-center gap-2">
                  <Badge variant={statusMeta[selectedTraining.status].variant} appearance="light">
                    {statusMeta[selectedTraining.status].label}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Instrutor</p>
                    <p className="text-sm font-medium">{selectedTraining.instructor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Carga horária</p>
                    <p className="text-sm font-medium">{selectedTraining.duration_hours}h</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Participantes</p>
                    <p className="text-sm font-medium">{selectedTraining.attendees}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Validade</p>
                    <p className="text-sm font-medium">{selectedTraining.validity_months} meses</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Data agendada</p>
                    <p className="text-sm font-medium">{formatDate(selectedTraining.scheduled_date)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Vencimento</p>
                    <p className="text-sm font-medium">{formatDate(selectedTraining.validity_date)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Progresso</p>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          selectedTraining.status === 'completed' && 'bg-success',
                          selectedTraining.status === 'in_progress' && 'bg-warning',
                          selectedTraining.status === 'scheduled' && 'bg-info',
                        )}
                        style={{
                          width: selectedTraining.status === 'completed' ? '100%' : selectedTraining.status === 'in_progress' ? '50%' : '0%',
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {selectedTraining.status === 'completed' ? '100%' : selectedTraining.status === 'in_progress' ? '50%' : '0%'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success(`Editando treinamento: ${selectedTraining.title}`)}
                  >
                    Editar treinamento
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success(`Visualizando participantes de: ${selectedTraining.title}`)}
                  >
                    Ver participantes
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success(`Emitindo certificados de: ${selectedTraining.title}`)}
                  >
                    Emitir certificados
                  </Button>
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* New Training Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Treinamento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-title">Nome do treinamento</Label>
                <Input
                  id="create-title"
                  placeholder="Ex: NR-1 Segurança do Trabalho"
                  value={createForm.title}
                  onChange={event => setCreateForm(prev => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-instructor">Instrutor</Label>
                <Input
                  id="create-instructor"
                  placeholder="Nome do instrutor"
                  value={createForm.instructor}
                  onChange={event => setCreateForm(prev => ({ ...prev, instructor: event.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-hours">Carga horária</Label>
                  <Input
                    id="create-hours"
                    type="number"
                    min={1}
                    placeholder="Horas"
                    value={createForm.duration_hours}
                    onChange={event => setCreateForm(prev => ({ ...prev, duration_hours: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-date">Data de início</Label>
                  <Input
                    id="create-date"
                    type="date"
                    value={createForm.scheduled_date}
                    onChange={event => setCreateForm(prev => ({ ...prev, scheduled_date: event.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Descrição</Label>
                <Textarea
                  id="create-description"
                  placeholder="Descreva o conteúdo e objetivos do treinamento"
                  rows={4}
                  value={createForm.description}
                  onChange={event => setCreateForm(prev => ({ ...prev, description: event.target.value }))}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
