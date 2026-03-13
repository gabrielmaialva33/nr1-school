import { useEffect, useMemo, useState, type ElementType, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  GripVertical,
  ListChecks,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
  UserPlus2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountingNumber } from '@/components/ui/counting-number'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDatePtBr, getNameInitials } from '@/lib/formatters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from '@/components/ui/kanban'
import {
  fetchActionPlans,
  type ActionPlan,
  type ActionPlanInvolvedEmployee,
  type PlanStatus,
} from '@/services/action-plans'
import { fetchEmployees, type Employee } from '@/services/employees'

type BoardColumnId = 'pending' | 'in_progress' | 'completed'

const boardColumnConfig: Array<{
  id: BoardColumnId
  status: PlanStatus[]
  title: string
  helper: string
  color: string
  bgColor: string
  dotColor: string
}> = [
  {
    id: 'pending',
    status: ['pending', 'overdue'],
    title: 'Pendente',
    helper: 'Aguardando priorização ou início',
    color: 'text-orange-800 dark:text-orange-200',
    bgColor: 'bg-orange-100/90 dark:bg-orange-950/55',
    dotColor: 'bg-orange-500',
  },
  {
    id: 'in_progress',
    status: ['in_progress'],
    title: 'Em Andamento',
    helper: 'Planos em execução com responsável ativo',
    color: 'text-cyan-800 dark:text-cyan-200',
    bgColor: 'bg-cyan-100/90 dark:bg-cyan-950/55',
    dotColor: 'bg-cyan-500',
  },
  {
    id: 'completed',
    status: ['completed', 'verified'],
    title: 'Concluído',
    helper: 'Ações concluídas e prontas para evidência',
    color: 'text-emerald-800 dark:text-emerald-200',
    bgColor: 'bg-emerald-100/90 dark:bg-emerald-950/55',
    dotColor: 'bg-emerald-500',
  },
]

const typeMeta: Record<string, { label: string; className: string }> = {
  preventive: {
    label: 'Preventiva',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200',
  },
  corrective: {
    label: 'Corretiva',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200',
  },
  monitoring: {
    label: 'Monitoramento',
    className: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-200',
  },
}

const statusLabels: Record<PlanStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  verified: 'Verificado',
  overdue: 'Vencido',
}

const validPlanStatuses = new Set<PlanStatus | 'all'>([
  'all',
  'pending',
  'in_progress',
  'completed',
  'verified',
  'overdue',
])

interface EmployeeOption {
  id: string
  name: string
  role: string
  avatar_url: string | null
}

interface CreatePlanDraft {
  title: string
  action_type: ActionPlan['action_type']
  responsible_name: string
  deadline: string
  description: string
}

const initialCreatePlanDraft: CreatePlanDraft = {
  title: '',
  action_type: 'preventive',
  responsible_name: '',
  deadline: '',
  description: '',
}

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date()
}

function getBoardColumnId(status: PlanStatus): BoardColumnId {
  if (status === 'in_progress') return 'in_progress'
  if (status === 'completed' || status === 'verified') return 'completed'
  return 'pending'
}

function getStatusForColumn(plan: ActionPlan, columnId: BoardColumnId): PlanStatus {
  if (columnId === 'pending') {
    return isOverdue(plan.deadline) ? 'overdue' : 'pending'
  }

  if (columnId === 'in_progress') {
    return 'in_progress'
  }

  return plan.status === 'verified' ? 'verified' : 'completed'
}

function createPlanOrder(plans: ActionPlan[]) {
  return plans.reduce<Record<string, number>>((acc, plan, index) => {
    acc[plan.id] = index
    return acc
  }, {})
}

function sortPlans(plans: ActionPlan[], planOrder: Record<string, number>) {
  return [...plans].sort((left, right) => {
    const leftOrder = planOrder[left.id] ?? Number.MAX_SAFE_INTEGER
    const rightOrder = planOrder[right.id] ?? Number.MAX_SAFE_INTEGER
    return leftOrder - rightOrder
  })
}

function buildBoardColumns(plans: ActionPlan[]): Record<BoardColumnId, ActionPlan[]> {
  return {
    pending: plans.filter(plan => getBoardColumnId(plan.status) === 'pending'),
    in_progress: plans.filter(plan => getBoardColumnId(plan.status) === 'in_progress'),
    completed: plans.filter(plan => getBoardColumnId(plan.status) === 'completed'),
  }
}

function toEmployeeOption(employee: Employee): EmployeeOption {
  return {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    avatar_url: employee.avatar_url,
  }
}

function KanbanCard({
  plan,
  onSelect,
  dragging = false,
}: {
  plan: ActionPlan
  onSelect: (planId: string) => void
  dragging?: boolean
}) {
  const type = typeMeta[plan.action_type]
  const overdue =
    plan.status !== 'completed' && plan.status !== 'verified' && isOverdue(plan.deadline)

  return (
    <div
      className={cn(
        'surface-interactive relative overflow-hidden rounded-[24px] border border-border/75 bg-card/96 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm',
        'focus-within:ring-2 focus-within:ring-primary/20',
        dragging && 'rotate-1 border-primary/35 shadow-[var(--shadow-hover)]',
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          overdue
            ? 'bg-destructive/70'
            : plan.status === 'in_progress'
              ? 'bg-cyan-500/75'
              : plan.status === 'completed' || plan.status === 'verified'
                ? 'bg-emerald-500/75'
                : 'bg-orange-500/75',
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <Badge className={cn('border-0 text-[10px] font-semibold tracking-wide uppercase', type?.className)}>
          {type?.label}
        </Badge>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <KanbanItemHandle asChild>
                <button
                  type="button"
                  className={cn(
                    'inline-flex size-8 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-muted-foreground/80 transition',
                    'hover:border-primary/35 hover:bg-primary/5 hover:text-primary focus-visible:outline-none',
                  )}
                  aria-label={`Mover ${plan.title}`}
                >
                  <GripVertical className="size-3.5" />
                </button>
              </KanbanItemHandle>
            </TooltipTrigger>
            <TooltipContent>Arrastar plano</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-xl text-muted-foreground hover:bg-muted/80"
                onClick={() => onSelect(plan.id)}
              >
                <MoreVertical className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalhes</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <h4 className="mt-3 text-sm font-semibold leading-snug text-foreground line-clamp-2">
        {plan.title}
      </h4>
      <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-3">
        {plan.description}
      </p>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/35 px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {getNameInitials(plan.responsible_name)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Responsável
            </p>
            <p className="truncate text-xs font-medium text-foreground">{plan.responsible_name}</p>
          </div>
        </div>
        {plan.involved_employees.length > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-muted/35 px-3 py-2">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              Envolvidos
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <UserPlus2 className="size-3.5 text-muted-foreground" />
              <p className="truncate text-xs font-medium text-foreground">
                {plan.involved_employees
                  .slice(0, 2)
                  .map((employee) => employee.employee_name)
                  .join(', ')}
                {plan.involved_employees.length > 2 ? ` +${plan.involved_employees.length - 2}` : ''}
              </p>
            </div>
          </div>
        ) : null}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-2xl border border-border/60 px-3 py-2 text-[11px] font-medium',
            overdue
              ? 'bg-destructive/10 text-destructive'
              : 'bg-secondary/60 text-secondary-foreground',
          )}
        >
          <Calendar className="size-3.5" />
          <span>Prazo {formatDatePtBr(plan.deadline)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/70 pt-3">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {statusLabels[plan.status]}
        </span>
        {overdue ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive">
            <AlertTriangle className="size-3" />
            Prazo vencido
          </span>
        ) : (
          <span className="text-[11px] text-muted-foreground">Risco {plan.risk_id}</span>
        )}
      </div>
    </div>
  )
}

function ActionPlanKanbanColumn({
  columnId,
  title,
  helper,
  plans,
  color,
  bgColor,
  dotColor,
  onSelectPlan,
}: {
  columnId: BoardColumnId
  title: string
  helper: string
  plans: ActionPlan[]
  color: string
  bgColor: string
  dotColor: string
  onSelectPlan: (planId: string) => void
}) {
  return (
    <KanbanColumn
      value={columnId}
      className="rounded-[28px] border border-border/80 bg-card/68 shadow-[var(--shadow-soft)] backdrop-blur-sm"
    >
      <div className={cn('sticky top-0 z-10 rounded-t-[28px] border-b border-border/70 px-4 py-4 backdrop-blur-sm', bgColor)}>
        <div className="flex items-start gap-3">
          <div className={cn('mt-1 size-2.5 rounded-full', dotColor)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn('text-sm font-semibold', color)}>{title}</h3>
              <Badge variant="outline" className="rounded-full border-border/70 bg-background/75 text-xs">
                {plans.length}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
          </div>
        </div>
      </div>

      <KanbanColumnContent value={columnId} className="min-h-[420px] gap-3 p-3">
        {plans.length === 0 ? (
          <div className="flex min-h-[240px] flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-border/80 bg-muted/25 px-6 text-center">
            <GripVertical className="size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium text-foreground">Nenhum plano nesta etapa</p>
            <p className="mt-1 max-w-52 text-xs leading-5 text-muted-foreground">
              Arraste um card para esta coluna para reorganizar o fluxo da execução.
            </p>
          </div>
        ) : (
          plans.map(plan => (
            <KanbanItem key={plan.id} value={plan.id}>
              <KanbanCard plan={plan} onSelect={onSelectPlan} />
            </KanbanItem>
          ))
        )}
      </KanbanColumnContent>
    </KanbanColumn>
  )
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  title: string
  value: number
  helper: string
  icon: ElementType
  tone?: 'primary' | 'destructive' | 'info' | 'success' | 'warning'
}) {
  const tones = {
    primary: { iconWrap: 'bg-primary/10 text-primary', value: 'text-primary' },
    destructive: { iconWrap: 'bg-destructive/10 text-destructive', value: 'text-destructive' },
    info: { iconWrap: 'bg-info/10 text-info', value: 'text-info' },
    success: { iconWrap: 'bg-success/10 text-success', value: 'text-success' },
    warning: { iconWrap: 'bg-orange-500/10 text-orange-500', value: 'text-orange-500' },
  }
  const t = tones[tone]

  return (
    <div className="surface-card rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-semibold tracking-tight', t.value)}>
            <CountingNumber to={value} duration={1.5} />
          </p>
        </div>
        <div className={cn('flex size-11 items-center justify-center rounded-xl', t.iconWrap)}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

export function ActionPlansPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [plans, setPlans] = useState<ActionPlan[]>([])
  const [planOrder, setPlanOrder] = useState<Record<string, number>>({})
  const [boardColumns, setBoardColumns] = useState<Record<BoardColumnId, ActionPlan[]>>({
    pending: [],
    in_progress: [],
    completed: [],
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>(() => {
    const statusParam = searchParams.get('status')
    return validPlanStatuses.has(statusParam as PlanStatus | 'all')
      ? (statusParam as PlanStatus | 'all')
      : 'all'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([])
  const [createPlanDraft, setCreatePlanDraft] = useState<CreatePlanDraft>(initialCreatePlanDraft)
  const [involvedEmployeeId, setInvolvedEmployeeId] = useState('')
  const [createInvolvedEmployees, setCreateInvolvedEmployees] = useState<ActionPlanInvolvedEmployee[]>([])

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    Promise.all([
      fetchActionPlans('all'),
      fetchEmployees({
        page: 1,
        per_page: 200,
        search: '',
        status: 'all',
      }),
    ])
      .then(([plansPayload, employeesPayload]) => {
        const normalizedPlans = plansPayload.data.map((plan) => ({
          ...plan,
          involved_employees: plan.involved_employees ?? [],
        }))
        setPlans(normalizedPlans)
        setPlanOrder(createPlanOrder(normalizedPlans))
        setEmployeeOptions(employeesPayload.data.map(toEmployeeOption))
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar dados'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const statusParam = searchParams.get('status')
    setStatusFilter(
      validPlanStatuses.has(statusParam as PlanStatus | 'all')
        ? (statusParam as PlanStatus | 'all')
        : 'all',
    )
  }, [searchParams])

  const filteredPlans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return sortPlans(plans, planOrder).filter(plan => {
      if (statusFilter !== 'all' && plan.status !== statusFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return (
        plan.title.toLowerCase().includes(normalizedSearch) ||
        plan.responsible_name.toLowerCase().includes(normalizedSearch) ||
        plan.involved_employees.some((employee) =>
          employee.employee_name.toLowerCase().includes(normalizedSearch),
        )
      )
    })
  }, [planOrder, plans, search, statusFilter])

  const selectedPlan = useMemo(
    () => plans.find(plan => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  )

  const planIndex = useMemo(() => {
    return plans.reduce<Record<string, ActionPlan>>((acc, plan) => {
      acc[plan.id] = plan
      return acc
    }, {})
  }, [plans])

  useEffect(() => {
    setBoardColumns(buildBoardColumns(filteredPlans))
  }, [filteredPlans])

  const totalPlans = filteredPlans.length
  const pendingPlans = filteredPlans.filter(plan => getBoardColumnId(plan.status) === 'pending').length
  const completedPlans = filteredPlans.filter(plan => getBoardColumnId(plan.status) === 'completed').length
  const inProgressPlans = filteredPlans.filter(plan => getBoardColumnId(plan.status) === 'in_progress').length
  const overduePlans = filteredPlans.filter(
    plan => plan.status !== 'completed' && plan.status !== 'verified' && isOverdue(plan.deadline),
  ).length
  const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0

  function handleStatusFilterChange(value: PlanStatus | 'all') {
    setStatusFilter(value)

    const nextParams = new URLSearchParams(searchParams)
    if (value === 'all') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', value)
    }
    setSearchParams(nextParams, { replace: true })
  }

  function handleBoardChange(nextBoardColumns: Record<BoardColumnId, ActionPlan[]>) {
    setBoardColumns(nextBoardColumns)

    const nextOrderEntries = boardColumnConfig.flatMap(column =>
      nextBoardColumns[column.id].map(plan => plan.id),
    )

    if (nextOrderEntries.length > 0) {
      setPlanOrder(current => {
        const nextOrder = { ...current }
        nextOrderEntries.forEach((planId, index) => {
          nextOrder[planId] = index
        })
        return nextOrder
      })
    }

    const nextStatusById = new Map<string, PlanStatus>()
    boardColumnConfig.forEach(column => {
      nextBoardColumns[column.id].forEach(plan => {
        nextStatusById.set(plan.id, getStatusForColumn(plan, column.id))
      })
    })

    setPlans(currentPlans => {
      let hasChanges = false

      const nextPlans = currentPlans.map(plan => {
        const nextStatus = nextStatusById.get(plan.id)
        if (!nextStatus || nextStatus === plan.status) {
          return plan
        }

        hasChanges = true
        return { ...plan, status: nextStatus }
      })

      return hasChanges ? nextPlans : currentPlans
    })
  }

  function resetCreatePlanDialogState() {
    setCreatePlanDraft(initialCreatePlanDraft)
    setCreateInvolvedEmployees([])
    setInvolvedEmployeeId('')
  }

  function handleCreateDialogOpenChange(open: boolean) {
    setIsCreateOpen(open)
    if (!open) {
      resetCreatePlanDialogState()
    }
  }

  function handleAddInvolvedEmployee() {
    if (!involvedEmployeeId) return

    const employee = employeeOptions.find((option) => option.id === involvedEmployeeId)
    if (!employee) return

    setCreateInvolvedEmployees((current) => {
      if (current.some((entry) => entry.employee_id === employee.id)) {
        return current
      }

      return [
        ...current,
        {
          employee_id: employee.id,
          employee_name: employee.name,
          employee_role: employee.role,
          employee_avatar_url: employee.avatar_url,
        },
      ]
    })
    setInvolvedEmployeeId('')
  }

  function handleRemoveInvolvedEmployee(employeeId: string) {
    setCreateInvolvedEmployees((current) => current.filter((entry) => entry.employee_id !== employeeId))
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (createInvolvedEmployees.length === 0) {
      toast.error('Adicione ao menos um funcionário envolvido')
      return
    }

    const responsibleName = createPlanDraft.responsible_name.trim()
    const nextResponsibleName =
      responsibleName.length > 0 ? responsibleName : createInvolvedEmployees[0]?.employee_name ?? ''

    if (!nextResponsibleName) {
      toast.error('Preencha o responsável do plano')
      return
    }

    const newPlan: ActionPlan = {
      id: crypto.randomUUID(),
      risk_id: `RISK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      school_id: plans[0]?.school_id ?? '',
      title: createPlanDraft.title.trim(),
      description: createPlanDraft.description.trim(),
      action_type: createPlanDraft.action_type,
      responsible_name: nextResponsibleName,
      involved_employees: createInvolvedEmployees,
      deadline: createPlanDraft.deadline,
      status: 'pending',
      created_at: new Date().toISOString(),
    }

    setPlans((current) => [newPlan, ...current])
    setPlanOrder((current) => {
      const shifted = Object.fromEntries(
        Object.entries(current).map(([planId, order]) => [planId, order + 1]),
      )

      return { [newPlan.id]: 0, ...shifted }
    })
    toast.success('Plano de ação criado com sucesso')
    handleCreateDialogOpenChange(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-6">
      <div className="page-stagger grid gap-6">
        <div className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/85 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm md:p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_42%),radial-gradient(circle_at_60%_50%,rgba(8,145,178,0.1),transparent_30%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px] xl:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                <Sparkles className="size-3.5" />
                Board operacional com drag and drop
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                Planos de Ação
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Organize ações corretivas, preventivas e de monitoramento com um fluxo visual limpo.
                O board mostra prioridades, prazos e responsáveis sem te jogar para outra tela.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground">
                  {pendingPlans} aguardando início
                </div>
                <div className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground">
                  {inProgressPlans} em execução
                </div>
                <div className="rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground">
                  {completionRate}% de conclusão no recorte
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-border/70 bg-background/72 p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Ritmo do board
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {completionRate}%
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    dos planos do recorte atual já estão concluídos ou verificados.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="gap-2 self-start"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  Novo Plano
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-2xl border border-border/60 bg-muted/35 px-3 py-2">
                    <p className="font-semibold text-foreground">{pendingPlans}</p>
                    <p className="mt-1 text-muted-foreground">pendentes</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/35 px-3 py-2">
                    <p className="font-semibold text-foreground">{inProgressPlans}</p>
                    <p className="mt-1 text-muted-foreground">em andamento</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/35 px-3 py-2">
                    <p className="font-semibold text-destructive">{overduePlans}</p>
                    <p className="mt-1 text-muted-foreground">vencidos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total"
            value={totalPlans}
            helper="Planos de ação no recorte atual"
            icon={ListChecks}
            tone="primary"
          />
          <StatCard
            title="Pendentes"
            value={pendingPlans}
            helper="Aguardando priorização ou início"
            icon={Clock}
            tone="warning"
          />
          <StatCard
            title="Concluídos"
            value={completedPlans}
            helper="Finalizados ou validados"
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            title="Vencidos"
            value={overduePlans}
            helper="Demandam atenção imediata"
            icon={AlertTriangle}
            tone="destructive"
          />
        </div>

        <div className="surface-card flex flex-col gap-4 rounded-[26px] border bg-card/90 p-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <InputGroup className="w-full max-w-md">
              <InputWrapper variant="lg">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  variant="lg"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Buscar por título, responsável ou envolvido"
                />
              </InputWrapper>
            </InputGroup>
            <Select
              value={statusFilter}
              onValueChange={value => handleStatusFilterChange(value as PlanStatus | 'all')}
            >
              <SelectTrigger size="lg" className="min-w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="verified">Verificado</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/35 px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Interação
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Arraste pelo grip lateral ou use teclado para mover os cards entre as colunas.
            </p>
          </div>
        </div>

        <Kanban<ActionPlan>
          value={boardColumns}
          onValueChange={handleBoardChange}
          getItemValue={plan => plan.id}
          className="overflow-x-auto pb-2"
        >
          <KanbanBoard className="min-w-[980px] gap-5 lg:min-w-0">
            {boardColumnConfig.map(column => (
              <ActionPlanKanbanColumn
                key={column.id}
                columnId={column.id}
                title={column.title}
                helper={column.helper}
                plans={boardColumns[column.id]}
                color={column.color}
                bgColor={column.bgColor}
                dotColor={column.dotColor}
                onSelectPlan={setSelectedPlanId}
              />
            ))}
          </KanbanBoard>
          <KanbanOverlay className="z-50">
            {({ value, variant }) => {
              if (variant !== 'item') {
                return null
              }

              const draggedPlan = planIndex[String(value)]
              if (!draggedPlan) {
                return null
              }

              return <KanbanCard plan={draggedPlan} onSelect={setSelectedPlanId} dragging />
            }}
          </KanbanOverlay>
        </Kanban>
      </div>

      <Sheet
        open={!!selectedPlan}
        onOpenChange={open => {
          if (!open) setSelectedPlanId(null)
        }}
      >
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedPlan?.title}</SheetTitle>
            <SheetDescription>
              Detalhes operacionais do plano de ação, com responsável, prazo e risco vinculado.
            </SheetDescription>
          </SheetHeader>
          {selectedPlan && (
            <SheetBody className="space-y-5">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Descrição</p>
                <p className="text-sm">{selectedPlan.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Tipo</p>
                  <Badge className={cn('border-0', typeMeta[selectedPlan.action_type]?.className)}>
                    {typeMeta[selectedPlan.action_type]?.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{statusLabels[selectedPlan.status]}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Responsável</p>
                  <div className="flex items-center gap-1.5 text-sm">
                    <User className="size-3.5 text-muted-foreground" />
                    {selectedPlan.responsible_name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Prazo</p>
                  <p
                    className={cn(
                      'text-sm',
                      selectedPlan.status !== 'completed' &&
                        selectedPlan.status !== 'verified' &&
                        isOverdue(selectedPlan.deadline) &&
                        'font-medium text-destructive',
                    )}
                  >
                    {formatDatePtBr(selectedPlan.deadline)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Risco vinculado</p>
                <p className="text-sm font-mono">{selectedPlan.risk_id}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Funcionários envolvidos</p>
                {selectedPlan.involved_employees.length > 0 ? (
                  <div className="grid gap-2">
                    {selectedPlan.involved_employees.map((employee) => (
                      <div
                        key={employee.employee_id}
                        className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/35 px-3 py-2"
                      >
                        <p className="text-sm font-medium text-foreground">{employee.employee_name}</p>
                        <p className="text-xs text-muted-foreground">{employee.employee_role}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem funcionários vinculados.</p>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  className="w-full gap-2"
                  onClick={() => {
                    setPlans(currentPlans =>
                      currentPlans.map(plan =>
                        plan.id === selectedPlan.id ? { ...plan, status: 'completed' } : plan,
                      ),
                    )
                    toast.success('Plano marcado como concluído')
                    setSelectedPlanId(null)
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  Marcar como concluído
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    toast.success('Abrindo edição do plano')
                    setSelectedPlanId(null)
                  }}
                >
                  <Pencil className="size-4" />
                  Editar plano
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive"
                  onClick={() => {
                    toast.success('Plano excluído com sucesso')
                    setSelectedPlanId(null)
                  }}
                >
                  <Trash2 className="size-4" />
                  Excluir plano
                </Button>
              </div>
            </SheetBody>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCreateOpen} onOpenChange={handleCreateDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Plano de Ação</DialogTitle>
            <DialogDescription>
              Cadastre uma ação corretiva, preventiva ou de monitoramento para o risco selecionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-title">Título</Label>
                <Input
                  id="plan-title"
                  value={createPlanDraft.title}
                  onChange={(event) =>
                    setCreatePlanDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Título do plano de ação"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-type">Tipo de ação</Label>
                <Select
                  value={createPlanDraft.action_type}
                  onValueChange={(value) =>
                    setCreatePlanDraft((current) => ({
                      ...current,
                      action_type: value as ActionPlan['action_type'],
                    }))
                  }
                >
                  <SelectTrigger id="plan-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="monitoring">Monitoramento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-responsible">Responsável</Label>
                <Input
                  id="plan-responsible"
                  value={createPlanDraft.responsible_name}
                  onChange={(event) =>
                    setCreatePlanDraft((current) => ({
                      ...current,
                      responsible_name: event.target.value,
                    }))
                  }
                  placeholder="Nome do responsável"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label>Funcionários envolvidos</Label>
                <div className="flex gap-2">
                  <Select value={involvedEmployeeId} onValueChange={setInvolvedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeOptions.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} • {employee.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 gap-2"
                    disabled={!involvedEmployeeId}
                    onClick={handleAddInvolvedEmployee}
                  >
                    <UserPlus2 className="size-4" />
                    Adicionar
                  </Button>
                </div>
                {createInvolvedEmployees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {createInvolvedEmployees.map((employee) => (
                      <Badge
                        key={employee.employee_id}
                        variant="outline"
                        className="flex items-center gap-1.5 rounded-full bg-muted/40 pl-3 pr-2 py-1.5"
                      >
                        <span className="text-xs font-medium">{employee.employee_name}</span>
                        <button
                          type="button"
                          className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={() => handleRemoveInvolvedEmployee(employee.employee_id)}
                          aria-label={`Remover ${employee.employee_name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Nenhum funcionário envolvido selecionado.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-deadline">Prazo</Label>
                <Input
                  id="plan-deadline"
                  type="date"
                  value={createPlanDraft.deadline}
                  onChange={(event) =>
                    setCreatePlanDraft((current) => ({ ...current, deadline: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-description">Descrição</Label>
                <Textarea
                  id="plan-description"
                  value={createPlanDraft.description}
                  onChange={(event) =>
                    setCreatePlanDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Descreva o plano de ação"
                  rows={4}
                />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Criar Plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
