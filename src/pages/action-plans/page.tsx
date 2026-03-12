import { useEffect, useState } from 'react'
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
  Plus,
  Search,
  Trash2,
  User,
  Pencil,
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
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type PlanStatus = 'pending' | 'in_progress' | 'completed' | 'verified' | 'overdue'

interface ActionPlan {
  id: string
  risk_id: string
  school_id: string
  title: string
  description: string
  action_type: 'preventive' | 'corrective' | 'monitoring'
  responsible_name: string
  deadline: string
  status: PlanStatus
  created_at: string
}

const columnConfig: Array<{
  status: PlanStatus[]
  title: string
  color: string
  bgColor: string
  dotColor: string
}> = [
  {
    status: ['pending', 'overdue'],
    title: 'Pendente',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    dotColor: 'bg-orange-500',
  },
  {
    status: ['in_progress'],
    title: 'Em Andamento',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    dotColor: 'bg-blue-500',
  },
  {
    status: ['completed', 'verified'],
    title: 'Concluído',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    dotColor: 'bg-emerald-500',
  },
]

const typeMeta: Record<string, { label: string; className: string }> = {
  preventive: { label: 'Preventiva', className: 'bg-blue-100 text-blue-700' },
  corrective: { label: 'Corretiva', className: 'bg-orange-100 text-orange-700' },
  monitoring: { label: 'Monitoramento', className: 'bg-purple-100 text-purple-700' },
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

function isOverdue(deadline: string) {
  return new Date(deadline) < new Date()
}

function KanbanCard({ plan, onSelect }: { plan: ActionPlan; onSelect: (plan: ActionPlan) => void }) {
  const type = typeMeta[plan.action_type]
  const overdue = plan.status !== 'completed' && plan.status !== 'verified' && isOverdue(plan.deadline)

  return (
    <div className="group rounded-lg border bg-card p-4 shadow-xs shadow-black/5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <Badge className={cn('border-0 text-[10px]', type?.className)}>
          {type?.label}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100" onClick={() => onSelect(plan)}>
              <MoreVertical className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ver detalhes</TooltipContent>
        </Tooltip>
      </div>

      <h4 className="mt-2 text-sm font-medium leading-snug line-clamp-2">
        {plan.title}
      </h4>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
        {plan.description}
      </p>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="size-3" />
          <span className="max-w-24 truncate">{plan.responsible_name}</span>
        </div>
        <div className={cn('flex items-center gap-1', overdue && 'text-destructive font-medium')}>
          <Calendar className="size-3" />
          <span>{new Date(plan.deadline).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {overdue && (
        <div className="mt-2 flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700">
          <AlertTriangle className="size-3" />
          Prazo vencido
        </div>
      )}
    </div>
  )
}

function KanbanColumn({
  title,
  plans,
  color,
  bgColor,
  dotColor,
  onSelectPlan,
}: {
  title: string
  plans: ActionPlan[]
  color: string
  bgColor: string
  dotColor: string
  onSelectPlan: (plan: ActionPlan) => void
}) {
  return (
    <div className="min-w-[280px] flex-shrink-0 lg:min-w-0 flex flex-col rounded-xl border bg-muted/30">
      <div className={cn('flex items-center gap-2 rounded-t-xl px-4 py-3', bgColor)}>
        <div className={cn('size-2 rounded-full', dotColor)} />
        <h3 className={cn('text-sm font-semibold', color)}>{title}</h3>
        <Badge variant="outline" className="ml-auto text-xs">
          {plans.length}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GripVertical className="size-8 text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">Nenhum plano</p>
          </div>
        ) : (
          plans.map(plan => <KanbanCard key={plan.id} plan={plan} onSelect={onSelectPlan} />)
        )}
      </div>
    </div>
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
  icon: React.ElementType
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
    <div className="rounded-xl border bg-card p-5 shadow-xs shadow-black/5">
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
  const [searchParams] = useSearchParams()
  const [plans, setPlans] = useState<ActionPlan[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>(() => {
    const statusParam = searchParams.get('status')
    return validPlanStatuses.has(statusParam as PlanStatus | 'all')
      ? (statusParam as PlanStatus | 'all')
      : 'all'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    const query = new URLSearchParams()
    if (statusFilter !== 'all') query.set('status', statusFilter)

    setIsLoading(true)
    setError(null)

    fetch(`/api/action-plans${query.toString() ? `?${query.toString()}` : ''}`)
      .then(res => res.json())
      .then(res => setPlans(res.data))
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar dados'))
      .finally(() => setIsLoading(false))
  }, [statusFilter])

  useEffect(() => {
    const statusParam = searchParams.get('status')
    setStatusFilter(
      validPlanStatuses.has(statusParam as PlanStatus | 'all')
        ? (statusParam as PlanStatus | 'all')
        : 'all',
    )
  }, [searchParams])

  const filtered = search.trim()
    ? plans.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.responsible_name.toLowerCase().includes(search.toLowerCase())
      )
    : plans

  const pending = filtered.filter(p => p.status === 'pending' || p.status === 'overdue').length
  const inProgress = filtered.filter(p => p.status === 'in_progress').length
  const completed = filtered.filter(p => p.status === 'completed' || p.status === 'verified').length
  const overdue = filtered.filter(p => p.status !== 'completed' && p.status !== 'verified' && isOverdue(p.deadline)).length

  function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    toast.success('Plano de ação criado com sucesso')
    setIsCreateOpen(false)
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planos de Ação</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as ações corretivas e preventivas para cada risco identificado.
          </p>
        </div>
        <Button variant="primary" size="lg" className="gap-2 self-start" onClick={() => setIsCreateOpen(true)}>
          <Plus className="size-4" />
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total" value={filtered.length} helper="Planos de ação cadastrados" icon={ListChecks} tone="primary" />
        <StatCard title="Pendentes" value={pending} helper="Aguardando início" icon={Clock} tone="warning" />
        <StatCard title="Concluídos" value={completed} helper="Finalizados com sucesso" icon={CheckCircle2} tone="success" />
        <StatCard title="Vencidos" value={overdue} helper="Prazo expirado" icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="flex items-center gap-3">
        <InputGroup className="w-full max-w-md">
          <InputWrapper variant="lg">
            <Search className="size-4 text-muted-foreground" />
            <Input
              variant="lg"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título ou responsável"
            />
          </InputWrapper>
        </InputGroup>
        <Select
          value={statusFilter}
          onValueChange={value => setStatusFilter(value as PlanStatus | 'all')}
        >
          <SelectTrigger size="lg" className="min-w-44">
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

      <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {columnConfig.map(col => (
          <KanbanColumn
            key={col.title}
            title={col.title}
            plans={filtered.filter(p => col.status.includes(p.status))}
            color={col.color}
            bgColor={col.bgColor}
            dotColor={col.dotColor}
            onSelectPlan={setSelectedPlan}
          />
        ))}
      </div>

      {/* Plan Details Sheet */}
      <Sheet open={!!selectedPlan} onOpenChange={open => { if (!open) setSelectedPlan(null) }}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedPlan?.title}</SheetTitle>
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
                  <p className={cn(
                    'text-sm',
                    selectedPlan.status !== 'completed' && selectedPlan.status !== 'verified' && isOverdue(selectedPlan.deadline) && 'text-destructive font-medium'
                  )}>
                    {new Date(selectedPlan.deadline).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Risco vinculado</p>
                <p className="text-sm font-mono">{selectedPlan.risk_id}</p>
              </div>

              <Separator />

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  className="w-full gap-2"
                  onClick={() => {
                    toast.success('Plano marcado como concluído')
                    setSelectedPlan(null)
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
                    setSelectedPlan(null)
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
                    setSelectedPlan(null)
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

      {/* New Plan Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Plano de Ação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <DialogBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-title">Título</Label>
                <Input id="plan-title" placeholder="Título do plano de ação" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-type">Tipo de ação</Label>
                <Select required>
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
                <Input id="plan-responsible" placeholder="Nome do responsável" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-deadline">Prazo</Label>
                <Input id="plan-deadline" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-description">Descrição</Label>
                <Textarea id="plan-description" placeholder="Descreva o plano de ação" rows={4} />
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
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
