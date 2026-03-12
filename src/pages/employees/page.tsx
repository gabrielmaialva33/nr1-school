import { useEffect, useMemo, useState, type ElementType } from 'react'
import { toast } from 'sonner'
import { AlertCircle, Filter, Plus, Search, UserCheck, UserMinus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CountingNumber } from '@/components/ui/counting-number'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'

type EmployeeStatus = 'active' | 'on_leave' | 'inactive'

interface Employee {
  id: string
  environment_id: string
  environment_name: string
  name: string
  cpf: string
  role: string
  admission_date: string
  status: EmployeeStatus
  email: string
}

interface PaginationMeta {
  total: number
  current_page: number
  per_page: number
  last_page: number
  first_page: number
}

interface EmployeesResponse {
  meta: PaginationMeta
  data: Employee[]
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
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

const statusMeta: Record<EmployeeStatus, { label: string; description: string; variant: 'success' | 'warning' | 'info' }> = {
  active: { label: 'Ativo', description: 'Funcionário em exercício regular', variant: 'success' },
  on_leave: { label: 'Afastado', description: 'Em licença ou afastamento temporário', variant: 'warning' },
  inactive: { label: 'Em férias', description: 'Funcionário em período de descanso', variant: 'info' },
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function formatCpf(cpf: string) {
  const lastDigits = cpf.slice(-5)
  return `***.***.${lastDigits.slice(0, 3)}-${lastDigits.slice(3)}`
}

async function fetchEmployees(params: {
  page: number
  per_page: number
  search: string
  status: EmployeeStatus | 'all'
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    per_page: String(params.per_page),
  })

  if (params.search.trim()) query.set('search', params.search.trim())
  if (params.status !== 'all') query.set('status', params.status)

  const response = await fetch(`/api/employees?${query.toString()}`)
  if (!response.ok) throw new Error('Falha ao carregar funcionários')
  return response.json() as Promise<EmployeesResponse>
}

async function fetchEmployeesStats() {
  const response = await fetch('/api/employees?page=1&per_page=200')
  if (!response.ok) throw new Error('Falha ao carregar indicadores de funcionários')

  const payload: EmployeesResponse = await response.json()

  return {
    total: payload.meta.total,
    active: payload.data.filter(employee => employee.status === 'active').length,
    on_leave: payload.data.filter(employee => employee.status === 'on_leave').length,
  }
}

export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
    first_page: 1,
  })
  const [stats, setStats] = useState({ total: 0, active: 0, on_leave: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all')

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchEmployees({ page, per_page: 10, search, status: statusFilter })
      .then(response => {
        if (!active) return
        setEmployees(response.data)
        setMeta(response.meta)
      })
      .catch(err => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os funcionários')
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

    fetchEmployeesStats()
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funcionários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie o quadro de colaboradores e acompanhe a situação de cada profissional.
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="primary" size="lg" className="gap-2 self-start" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
              Novo Funcionário
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cadastrar novo funcionário</TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total" value={stats.total} helper="Funcionários cadastrados" icon={Users} tone="primary" />
        <StatCard title="Ativos" value={stats.active} helper="Em exercício regular" icon={UserCheck} tone="success" />
        <StatCard title="Afastados" value={stats.on_leave} helper="Licença ou afastamento" icon={UserMinus} tone="warning" />
        <StatCard title="Em Férias" value={stats.total - stats.active - stats.on_leave} helper="Período de descanso" icon={AlertCircle} tone="info" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Lista de funcionários</CardTitle>
          <CardToolbar className="w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                  placeholder="Buscar por nome ou cargo"
                />
              </InputWrapper>
            </InputGroup>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 self-start">
                  <Filter className="size-4" />
                  Filtros
                  {statusFilter !== 'all' && <Badge variant="primary" className="ml-1">{statusMeta[statusFilter].label}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => { setStatusFilter('all'); setPage(1) }}>Todos</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setStatusFilter('active'); setPage(1) }}>Ativos</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setStatusFilter('on_leave'); setPage(1) }}>Afastados</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => { setStatusFilter('inactive'); setPage(1) }}>Em Férias</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardToolbar>
        </CardHeader>

        <div className="p-4">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="hidden md:table-cell">Setor</TableHead>
                <TableHead className="hidden md:table-cell">Admissão</TableHead>
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
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhum funcionário encontrado</p>
                      <p className="text-sm text-muted-foreground">Ajuste a busca para ampliar os resultados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px]">{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium">{formatCpf(employee.cpf)}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.role}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{employee.environment_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(employee.admission_date)}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Badge variant={statusMeta[employee.status].variant} appearance="light">
                              {statusMeta[employee.status].label}
                            </Badge>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>{statusMeta[employee.status].description}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(employee)}>
                              Ver perfil
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes de {employee.name}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              'Carregando funcionários...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} funcionários
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

      {/* Employee Profile Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={open => !open && setSelectedEmployee(null)}>
        <SheetContent side="right" className="sm:max-w-lg">
          {selectedEmployee && (
            <>
              <SheetHeader className="border-b pb-4">
                <SheetTitle>{selectedEmployee.name}</SheetTitle>
                <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
              </SheetHeader>
              <SheetBody className="mt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <p className="text-sm font-medium">{formatCpf(selectedEmployee.cpf)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo</p>
                    <p className="text-sm font-medium">{selectedEmployee.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Setor</p>
                    <p className="text-sm font-medium">{selectedEmployee.environment_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data de Admissão</p>
                    <p className="text-sm font-medium">{formatDate(selectedEmployee.admission_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusMeta[selectedEmployee.status].variant} appearance="light" className="mt-1">
                      {statusMeta[selectedEmployee.status].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="text-sm font-medium">{selectedEmployee.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success('Dados exportados com sucesso')}>Exportar dados</Button>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => { toast.success(`${selectedEmployee.name} desligado com sucesso`); setSelectedEmployee(null) }}>Desligar funcionário</Button>
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* New Employee Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="create-employee-form"
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault()
                toast.success('Funcionário cadastrado com sucesso')
                setIsCreateOpen(false)
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="employee-name">Nome</Label>
                <Input id="employee-name" placeholder="Nome completo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-email">E-mail</Label>
                <Input id="employee-email" type="email" placeholder="email@exemplo.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-cpf">CPF</Label>
                <Input id="employee-cpf" placeholder="000.000.000-00" required />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Coordenador">Coordenador</SelectItem>
                    <SelectItem value="Auxiliar de limpeza">Auxiliar de limpeza</SelectItem>
                    <SelectItem value="Cozinheira">Cozinheira</SelectItem>
                    <SelectItem value="Secretaria">Secretaria</SelectItem>
                    <SelectItem value="Porteiro">Porteiro</SelectItem>
                    <SelectItem value="Bibliotecaria">Bibliotecária</SelectItem>
                    <SelectItem value="Monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-sector">Setor</Label>
                <Input id="employee-sector" placeholder="Ex: Sala 1, Cozinha, Biblioteca" required />
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" form="create-employee-form">Cadastrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
