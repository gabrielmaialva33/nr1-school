import { useEffect, useMemo, useState, type ElementType } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, Building2, Filter, GraduationCap, MoreVertical, Plus, Search, Users } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type EnvironmentType = 'educational' | 'administrative' | 'food' | 'maintenance' | 'recreation' | 'security'
type RiskTone = 'low' | 'medium' | 'high' | 'critical'
type TypeFilter = 'all' | 'educational' | 'administrative' | 'food' | 'maintenance'

interface Environment {
  id: string
  name: string
  type: EnvironmentType
  employee_count: number
  description: string
  created_at: string
}

interface PaginationMeta {
  total: number
  current_page: number
  per_page: number
  last_page: number
  first_page: number
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function getEnvironmentTypeLabel(type: EnvironmentType) {
  const labels: Record<EnvironmentType, string> = {
    educational: 'Educacional',
    administrative: 'Administrativo',
    food: 'Alimentação',
    maintenance: 'Operacional',
    recreation: 'Operacional',
    security: 'Operacional',
  }

  return labels[type]
}

function getEnvironmentRisk(environment: Environment): RiskTone {
  const typeWeight: Record<EnvironmentType, number> = {
    educational: 1,
    administrative: 0,
    food: 2,
    maintenance: 2,
    recreation: 1,
    security: 1,
  }

  const score = environment.employee_count + typeWeight[environment.type] * 3

  if (score >= 20) return 'critical'
  if (score >= 14) return 'high'
  if (score >= 8) return 'medium'
  return 'low'
}

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
  tone?: 'primary' | 'warning' | 'info' | 'success' | 'destructive'
}) {
  const tones = {
    primary: { iconWrap: 'bg-primary/10 text-primary', value: 'text-primary' },
    warning: { iconWrap: 'bg-warning/10 text-warning', value: 'text-warning' },
    info: { iconWrap: 'bg-info/10 text-info', value: 'text-info' },
    success: { iconWrap: 'bg-success/10 text-success', value: 'text-success' },
    destructive: { iconWrap: 'bg-destructive/10 text-destructive', value: 'text-destructive' },
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

const riskMeta: Record<RiskTone, { label: string; className: string }> = {
  low: { label: 'Baixo', className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Médio', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Alto', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-700' },
}

const typeFilterLabels: Record<TypeFilter, string> = {
  all: 'Todos',
  educational: 'Educacional',
  administrative: 'Administrativo',
  food: 'Alimentação',
  maintenance: 'Operacional',
}

async function fetchEnvironments() {
  const response = await fetch('/api/environments')
  if (!response.ok) throw new Error('Falha ao carregar setores')

  const payload: { data: Environment[] } = await response.json()
  return payload.data
}

export function EnvironmentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [createName, setCreateName] = useState('')
  const [createType, setCreateType] = useState('')
  const [createDescription, setCreateDescription] = useState('')
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
    const total = filteredEnvironments.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    return {
      total,
      current_page: Math.min(page, lastPage),
      per_page: perPage,
      last_page: lastPage,
      first_page: 1,
    }
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
    if (!createName.trim()) {
      toast.error('Informe o nome do setor')
      return
    }
    if (!createType) {
      toast.error('Selecione o tipo do setor')
      return
    }

    toast.success('Setor cadastrado com sucesso')
    setIsCreateOpen(false)
    setCreateName('')
    setCreateType('')
    setCreateDescription('')
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de Setores"
          value={environments.length}
          helper="Ambientes cadastrados na escola"
          icon={Building2}
          tone="primary"
        />
        <StatCard
          title="Educacionais"
          value={environments.filter(e => e.type === 'educational').length}
          helper="Salas de aula e laboratórios"
          icon={GraduationCap}
          tone="info"
        />
        <StatCard
          title="Funcionários"
          value={environments.reduce((sum, e) => sum + e.employee_count, 0)}
          helper="Total de colaboradores alocados"
          icon={Users}
          tone="success"
        />
        <StatCard
          title="Risco Crítico"
          value={environments.filter(e => getEnvironmentRisk(e) === 'critical').length}
          helper="Setores classificados como críticos"
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setores Cadastrados</CardTitle>
          <CardToolbar>
            <InputGroup className="w-full xl:max-w-md">
              <InputWrapper variant="lg">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  variant="lg"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Buscar por nome, tipo ou descrição"
                />
              </InputWrapper>
            </InputGroup>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 self-start">
                  <Filter className="size-4" />
                  {typeFilter === 'all' ? 'Filtros' : typeFilterLabels[typeFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.entries(typeFilterLabels) as [TypeFilter, string][]).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onSelect={() => setTypeFilter(key)}
                    className={cn(typeFilter === key && 'font-semibold text-primary')}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardToolbar>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell text-center">Funcionários</TableHead>
                <TableHead className="hidden md:table-cell">Último Diagnóstico</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhum setor encontrado</p>
                      <p className="text-sm text-muted-foreground">Refine a busca para localizar um ambiente específico.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map(environment => {
                  const risk = getEnvironmentRisk(environment)

                  return (
                    <TableRow key={environment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{environment.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{environment.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{getEnvironmentTypeLabel(environment.type)}</TableCell>
                      <TableCell className="hidden md:table-cell text-center font-medium">{environment.employee_count}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(environment.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={cn('border-0', riskMeta[risk].className)}>{riskMeta[risk].label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" mode="icon" aria-label={`Ações para ${environment.name}`}>
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Mais ações</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setSelectedEnv(environment)}>Ver detalhes</DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setSelectedEnv(environment)}>Editar setor</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Carregando setores...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} setores
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

      {/* Environment Details Sheet */}
      <Sheet open={!!selectedEnv} onOpenChange={open => { if (!open) setSelectedEnv(null) }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selectedEnv?.name}</SheetTitle>
          </SheetHeader>
          {selectedEnv && (() => {
            const risk = getEnvironmentRisk(selectedEnv)
            return (
              <SheetBody className="space-y-5">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-sm">{selectedEnv.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                    <p className="text-sm">{getEnvironmentTypeLabel(selectedEnv.type)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                    <p className="text-sm">{selectedEnv.employee_count}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                    <p className="text-sm">{formatDate(selectedEnv.created_at)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Nível de risco</p>
                    <Badge className={cn('border-0', riskMeta[risk].className)}>{riskMeta[risk].label}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success(`Editando setor "${selectedEnv.name}"`)}
                  >
                    Editar setor
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => toast.success(`Visualizando funcionários de "${selectedEnv.name}"`)}
                  >
                    Ver funcionários
                  </Button>
                </div>
              </SheetBody>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* New Environment Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Setor</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="env-name">Nome do setor</Label>
              <Input
                id="env-name"
                variant="lg"
                placeholder="Ex: Sala de Informática"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-type">Tipo</Label>
              <Select value={createType} onValueChange={setCreateType}>
                <SelectTrigger size="lg" id="env-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educacional</SelectItem>
                  <SelectItem value="administrative">Administrativo</SelectItem>
                  <SelectItem value="food">Alimentação</SelectItem>
                  <SelectItem value="maintenance">Operacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="env-description">Descrição</Label>
              <Textarea
                id="env-description"
                variant="lg"
                placeholder="Descreva o setor..."
                rows={3}
                value={createDescription}
                onChange={e => setCreateDescription(e.target.value)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="lg" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="lg" onClick={handleCreateSubmit}>
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
