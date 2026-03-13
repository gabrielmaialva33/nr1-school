import type { Dispatch, ElementType, SetStateAction } from 'react'
import { AlertTriangle, Building2, Filter, GraduationCap, MoreVertical, Search, Users } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatDatePtBr } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Environment } from '@/services/environments'
import type { PaginationMeta } from '@/types/api'
import {
  createEmptyEnvironmentDraft,
  getEnvironmentRisk,
  getEnvironmentTypeLabel,
  riskMeta,
  type EnvironmentCreateDraft,
  type TypeFilter,
  typeFilterLabels,
} from './helpers'

export function EnvironmentStatCard({
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

export function EnvironmentsStatsGrid({
  environments,
}: {
  environments: Environment[]
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <EnvironmentStatCard
        title="Total de Setores"
        value={environments.length}
        helper="Ambientes cadastrados na escola"
        icon={Building2}
        tone="primary"
      />
      <EnvironmentStatCard
        title="Educacionais"
        value={environments.filter(environment => environment.type === 'educational').length}
        helper="Salas de aula e laboratórios"
        icon={GraduationCap}
        tone="info"
      />
      <EnvironmentStatCard
        title="Funcionários"
        value={environments.reduce((sum, environment) => sum + environment.employee_count, 0)}
        helper="Total de colaboradores alocados"
        icon={Users}
        tone="success"
      />
      <EnvironmentStatCard
        title="Risco Crítico"
        value={environments.filter(environment => getEnvironmentRisk(environment) === 'critical').length}
        helper="Setores classificados como críticos"
        icon={AlertTriangle}
        tone="destructive"
      />
    </div>
  )
}

export function EnvironmentsTableCard({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  isLoading,
  error,
  environments,
  meta,
  paginationItems,
  onPreviousPage,
  onNextPage,
  onGoToPage,
  onSelectEnvironment,
}: {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: TypeFilter
  onTypeFilterChange: (value: TypeFilter) => void
  isLoading: boolean
  error: string | null
  environments: Environment[]
  meta: PaginationMeta
  paginationItems: number[]
  onPreviousPage: () => void
  onNextPage: () => void
  onGoToPage: (page: number) => void
  onSelectEnvironment: (environment: Environment | null) => void
}) {
  return (
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
                onChange={event => onSearchChange(event.target.value)}
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
                  onSelect={() => onTypeFilterChange(key)}
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
                <TableHead className="hidden text-center md:table-cell">Funcionários</TableHead>
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
              ) : environments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhum setor encontrado</p>
                      <p className="text-sm text-muted-foreground">
                        Refine a busca para localizar um ambiente específico.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                environments.map(environment => {
                  const risk = getEnvironmentRisk(environment)

                  return (
                    <TableRow key={environment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{environment.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {environment.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {getEnvironmentTypeLabel(environment.type)}
                      </TableCell>
                      <TableCell className="hidden text-center font-medium md:table-cell">
                        {environment.employee_count}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {formatDatePtBr(environment.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border-0', riskMeta[risk].className)}>
                          {riskMeta[risk].label}
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
                                    aria-label={`Ações para ${environment.name}`}
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>Mais ações</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => onSelectEnvironment(environment)}>
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onSelectEnvironment(environment)}>
                                Editar setor
                              </DropdownMenuItem>
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
              Exibindo {(meta.current_page - 1) * meta.per_page + 1} a{' '}
              {Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} setores
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
    </Card>
  )
}

export function EnvironmentDetailsSheet({
  environment,
  onOpenChange,
}: {
  environment: Environment | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={!!environment} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{environment?.name}</SheetTitle>
          <SheetDescription>
            Contexto do setor, criticidade operacional e composição básica do ambiente.
          </SheetDescription>
        </SheetHeader>
        {environment && (() => {
          const risk = getEnvironmentRisk(environment)
          return (
            <SheetBody className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                <p className="text-sm">{environment.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-sm">{getEnvironmentTypeLabel(environment.type)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Funcionários</p>
                  <p className="text-sm">{environment.employee_count}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="text-sm">{formatDatePtBr(environment.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Nível de risco</p>
                  <Badge className={cn('border-0', riskMeta[risk].className)}>
                    {riskMeta[risk].label}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => toast.success(`Editando setor "${environment.name}"`)}
                >
                  Editar setor
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => toast.success(`Visualizando funcionários de "${environment.name}"`)}
                >
                  Ver funcionários
                </Button>
              </div>
            </SheetBody>
          )
        })()}
      </SheetContent>
    </Sheet>
  )
}

export function EnvironmentCreateDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: EnvironmentCreateDraft
  setForm: Dispatch<SetStateAction<EnvironmentCreateDraft>>
  onSubmit: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Setor</DialogTitle>
          <DialogDescription>
            Cadastre o ambiente com tipo operacional e contexto mínimo para classificação de risco.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="env-name">Nome do setor</Label>
            <Input
              id="env-name"
              variant="lg"
              placeholder="Ex: Sala de Informática"
              value={form.name}
              onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="env-type">Tipo</Label>
            <Select value={form.type} onValueChange={value => setForm(current => ({ ...current, type: value }))}>
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
              value={form.description}
              onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setForm(createEmptyEnvironmentDraft())
              onOpenChange(false)
            }}
          >
            Cancelar
          </Button>
          <Button variant="primary" size="lg" onClick={onSubmit}>
            Cadastrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
