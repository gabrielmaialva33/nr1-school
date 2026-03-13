import type { Dispatch, ElementType, FormEvent, SetStateAction } from 'react'
import { CalendarClock, Filter, GraduationCap, MoreVertical, Search, Users } from 'lucide-react'
import { toast } from 'sonner'
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
import { Label } from '@/components/ui/label'
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatDatePtBr } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { PaginationMeta, Training, TrainingStatus } from '@/services/trainings'
import {
  createEmptyTrainingDraft,
  getTrainingProgress,
  trainingStatusMeta,
  type TrainingCreateDraft,
} from './helpers'

export function TrainingStatCard({
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

export function TrainingsStatsGrid({
  stats,
}: {
  stats: {
    completed: number
    attendance_rate: number
    expiring_soon: number
    impacted_employees: number
  }
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <TrainingStatCard
        title="Realizados"
        value={stats.completed}
        helper="Treinamentos concluídos no ciclo atual"
        icon={GraduationCap}
        tone="success"
      />
      <TrainingStatCard
        title="Índice Presença"
        value={`${stats.attendance_rate}%`}
        helper="Participação consolidada nos treinamentos"
        icon={Users}
        tone="primary"
      />
      <TrainingStatCard
        title="A Vencer <30d"
        value={stats.expiring_soon}
        helper="Certificações que precisam de renovação"
        icon={CalendarClock}
        tone="warning"
      />
      <TrainingStatCard
        title="Colab. Impactados"
        value={stats.impacted_employees}
        helper="Soma total de participantes registrados"
        icon={Users}
        tone="info"
      />
    </div>
  )
}

export function TrainingsTableCard({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isLoading,
  isStatsLoading,
  error,
  trainings,
  selectedTraining,
  onSelectTraining,
  meta,
  paginationItems,
  hasActiveFilters,
  onPreviousPage,
  onNextPage,
  onGoToPage,
}: {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: TrainingStatus | 'all'
  onStatusFilterChange: (status: TrainingStatus | 'all') => void
  isLoading: boolean
  isStatsLoading: boolean
  error: string | null
  trainings: Training[]
  selectedTraining: Training | null
  onSelectTraining: (training: Training | null) => void
  meta: PaginationMeta
  paginationItems: number[]
  hasActiveFilters: boolean
  onPreviousPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
}) {
  return (
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
                onChange={event => onSearchChange(event.target.value)}
                placeholder="Buscar por tema ou instrutor"
              />
            </InputWrapper>
          </InputGroup>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2 self-start">
                <Filter className="size-4" />
                {statusFilter === 'all' ? 'Filtros' : trainingStatusMeta[statusFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onStatusFilterChange('all')}>
                <span className={cn(statusFilter === 'all' && 'font-semibold')}>Todos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onStatusFilterChange('completed')}>
                <span className={cn(statusFilter === 'completed' && 'font-semibold')}>Regular</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onStatusFilterChange('scheduled')}>
                <span className={cn(statusFilter === 'scheduled' && 'font-semibold')}>Agendado</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onStatusFilterChange('in_progress')}>
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
                      <p className="text-sm text-muted-foreground">
                        Tente outro termo para localizar a agenda desejada.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trainings.map(training => (
                  <TableRow key={training.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{training.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Validade de {training.validity_months} meses
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {training.instructor}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDatePtBr(training.scheduled_date)}
                    </TableCell>
                    <TableCell className="hidden font-medium md:table-cell">
                      {training.duration_hours}h
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDatePtBr(training.validity_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trainingStatusMeta[training.status].variant} appearance="light">
                        {trainingStatusMeta[training.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  mode="icon"
                                  aria-label={`Ações para ${training.title}`}
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Mais ações</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onSelectTraining(training)}>
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onSelectTraining(training)}>
                              Editar treinamento
                            </DropdownMenuItem>
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
              Exibindo {(meta.current_page - 1) * meta.per_page + 1} a{' '}
              {Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} treinamentos
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
                onClick={onPreviousPage}
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
                  onClick={() => onGoToPage(pageNumber)}
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
                onClick={onNextPage}
              >
                Próxima
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>

      <TrainingDetailsSheet training={selectedTraining} onOpenChange={open => !open && onSelectTraining(null)} />
    </Card>
  )
}

export function TrainingDetailsSheet({
  training,
  onOpenChange,
}: {
  training: Training | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={!!training} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
        {training && (
          <>
            <SheetHeader>
              <SheetTitle>{training.title}</SheetTitle>
              <SheetDescription>
                Detalhes do treinamento, validade da certificação e progresso operacional da turma.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-5">
              <div className="flex items-center gap-2">
                <Badge variant={trainingStatusMeta[training.status].variant} appearance="light">
                  {trainingStatusMeta[training.status].label}
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Instrutor</p>
                  <p className="text-sm font-medium">{training.instructor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Carga horária</p>
                  <p className="text-sm font-medium">{training.duration_hours}h</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Participantes</p>
                  <p className="text-sm font-medium">{training.attendees}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Validade</p>
                  <p className="text-sm font-medium">{training.validity_months} meses</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Data agendada</p>
                  <p className="text-sm font-medium">{formatDatePtBr(training.scheduled_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Vencimento</p>
                  <p className="text-sm font-medium">{formatDatePtBr(training.validity_date)}</p>
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
                        training.status === 'completed' && 'bg-success',
                        training.status === 'in_progress' && 'bg-warning',
                        training.status === 'scheduled' && 'bg-info',
                      )}
                      style={{ width: `${getTrainingProgress(training)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{getTrainingProgress(training)}%</span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => toast.success(`Editando treinamento: ${training.title}`)}
                >
                  Editar treinamento
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => toast.success(`Visualizando participantes de: ${training.title}`)}
                >
                  Ver participantes
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => toast.success(`Emitindo certificados de: ${training.title}`)}
                >
                  Emitir certificados
                </Button>
              </div>
            </SheetBody>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

export function TrainingCreateDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: TrainingCreateDraft
  setForm: Dispatch<SetStateAction<TrainingCreateDraft>>
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Treinamento</DialogTitle>
          <DialogDescription>
            Cadastre o treinamento com dados mínimos para agenda, validade e emissão futura de certificados.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Nome do treinamento</Label>
              <Input
                id="create-title"
                placeholder="Ex: NR-1 Segurança do Trabalho"
                value={form.title}
                onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-instructor">Instrutor</Label>
              <Input
                id="create-instructor"
                placeholder="Nome do instrutor"
                value={form.instructor}
                onChange={event => setForm(prev => ({ ...prev, instructor: event.target.value }))}
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
                  value={form.duration_hours}
                  onChange={event => setForm(prev => ({ ...prev, duration_hours: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-date">Data de início</Label>
                <Input
                  id="create-date"
                  type="date"
                  value={form.scheduled_date}
                  onChange={event => setForm(prev => ({ ...prev, scheduled_date: event.target.value }))}
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
                value={form.description}
                onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(createEmptyTrainingDraft())
                onOpenChange(false)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
