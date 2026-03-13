import { useEffect, useMemo, useState, type ElementType } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, UserCheck, UserMinus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import { createPaginationMeta } from '@/lib/pagination'
import { formatCpfMasked, formatDatePtBr, getNameInitials } from '@/lib/formatters'
import { toAbsoluteUrl } from '@/lib/asset-path'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CountingNumber } from '@/components/ui/counting-number'
import { TableRowsSkeleton } from '@/components/loading/page-skeletons'
import {
  employeeStatusMeta,
} from './profile-utils'
import {
  fetchEmployees,
  fetchEmployeesStats,
  type Employee,
  type EmployeeStatus,
  type PaginationMeta,
} from '@/services/employees'

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
    primary: { iconWrap: 'bg-primary/10 text-primary', value: 'text-primary' },
    warning: { iconWrap: 'bg-warning/10 text-warning', value: 'text-warning' },
    info: { iconWrap: 'bg-info/10 text-info', value: 'text-info' },
    success: { iconWrap: 'bg-success/10 text-success', value: 'text-success' },
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

export function EmployeesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(() => createPaginationMeta(0, 1, 10))
  const [stats, setStats] = useState({ total: 0, active: 0, on_leave: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchEmployees({ page, per_page: perPage, search, status: statusFilter })
      .then((response) => {
        if (!active) return
        setEmployees(response.data)
        setMeta(response.meta)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err instanceof Error ? err.message : 'Não foi possível carregar os funcionários',
        )
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, perPage, search, statusFilter])

  useEffect(() => {
    let active = true
    setIsStatsLoading(true)

    fetchEmployeesStats()
      .then((data) => {
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
  const documentedEmployees = stats.total - stats.on_leave

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funcionários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lista operacional do quadro de colaboradores com navegação direta para o perfil completo.
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="primary"
              size="lg"
              className="gap-2 self-start"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              Novo Funcionário
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cadastrar novo funcionário</TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={isStatsLoading ? '...' : stats.total}
          helper="Funcionários cadastrados"
          icon={Users}
          tone="primary"
        />
        <StatCard
          title="Ativos"
          value={isStatsLoading ? '...' : stats.active}
          helper="Em exercício regular"
          icon={UserCheck}
          tone="success"
        />
        <StatCard
          title="Afastados"
          value={isStatsLoading ? '...' : stats.on_leave}
          helper="Licenças e ausências temporárias"
          icon={UserMinus}
          tone="warning"
        />
        <StatCard
          title="Perfis Prontos"
          value={isStatsLoading ? '...' : `${documentedEmployees}/${stats.total || 1}`}
          helper="Navegação dedicada para dossiê 360º"
          icon={Users}
          tone="info"
        />
      </div>

      <Card className="border-dashed bg-muted/20">
        <CardHeader className="gap-2">
          <CardTitle className="text-base">Estrutura da tela</CardTitle>
          <CardDescription>
            A listagem ficou enxuta. Documentos, EPI, certificados e histórico de compliance vivem só no perfil individual.
          </CardDescription>
        </CardHeader>
      </Card>

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
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Buscar por nome, cargo ou setor"
                />
              </InputWrapper>
            </InputGroup>

            <div className="flex items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value: EmployeeStatus | 'all') => {
                  setStatusFilter(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="min-w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="on_leave">Afastados</SelectItem>
                  <SelectItem value="inactive">Em férias</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    {perPage} por página
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[10, 20, 30].map((perPage) => (
                    <DropdownMenuItem
                      key={perPage}
                      onSelect={() => {
                        setPage(1)
                        setPerPage(perPage)
                      }}
                    >
                      {perPage} por página
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardToolbar>
        </CardHeader>

        <div className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
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
                  <TableRowsSkeleton rows={8} colSpan={7} />
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
                        <p className="text-sm text-muted-foreground">
                          Tente outro termo para busca ou ajuste os filtros.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            {employee.avatar_url ? (
                              <AvatarImage src={toAbsoluteUrl(employee.avatar_url)} alt={employee.name} />
                            ) : null}
                            <AvatarFallback className="text-[10px]">
                              {getNameInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-0.5">
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-medium md:table-cell">
                        {formatCpfMasked(employee.cpf)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{employee.role}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {employee.environment_name}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDatePtBr(employee.admission_date)}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                variant={employeeStatusMeta[employee.status].variant}
                                appearance="light"
                              >
                                {employeeStatusMeta[employee.status].label}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {employeeStatusMeta[employee.status].description}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/employees/${employee.id}`)}
                              >
                                Ver perfil
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Abrir dossiê 360º de {employee.name}
                            </TooltipContent>
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
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total}{' '}
                funcionários
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
                  onClick={() => setPage((current) => current - 1)}
                >
                  Anterior
                </Button>
              </PaginationItem>

              {paginationItems.map((pageNumber) => (
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
                  onClick={() => setPage((current) => current + 1)}
                >
                  Próxima
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="create-employee-form"
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
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
                    <SelectItem value="Secretaria">Secretária</SelectItem>
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
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" form="create-employee-form">
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
