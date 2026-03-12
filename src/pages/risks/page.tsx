import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card'
import { CountingNumber } from '@/components/ui/counting-number'
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
type RiskStatus = 'identified' | 'treating' | 'controlled' | 'eliminated'

interface Risk {
  id: string
  category: string
  category_label: string
  environment_name: string
  probability: number
  severity: number
  risk_level: RiskLevel
  status: RiskStatus
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

interface RisksResponse {
  data: Risk[]
  meta: PaginationMeta
}

interface RiskFilters {
  search: string
  status: 'all' | RiskStatus
  level: 'all' | RiskLevel
  page: number
  per_page: number
}

const validRiskLevels = new Set<RiskFilters['level']>([
  'all',
  'low',
  'medium',
  'high',
  'critical',
])

const validRiskStatuses = new Set<RiskFilters['status']>([
  'all',
  'identified',
  'treating',
  'controlled',
  'eliminated',
])

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
  tone?: 'primary' | 'destructive' | 'info' | 'success'
}) {
  const tones = {
    primary: {
      iconWrap: 'bg-primary/10 text-primary',
      value: 'text-primary',
    },
    destructive: {
      iconWrap: 'bg-destructive/10 text-destructive',
      value: 'text-destructive',
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
          <p
            className={cn(
              'text-3xl font-semibold tracking-tight',
              tones[tone].value,
            )}
          >
            <CountingNumber to={value} duration={1.5} />
          </p>
        </div>
        <div
          className={cn(
            'flex size-11 items-center justify-center rounded-xl',
            tones[tone].iconWrap,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

const levelMeta: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: 'Trivial', className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Tolerável', className: 'bg-blue-100 text-blue-700' },
  high: { label: 'Substancial', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Intolerável', className: 'bg-red-100 text-red-700' },
}

const statusMeta: Record<
  RiskStatus,
  {
    label: string
    variant: 'outline' | 'info' | 'success' | 'secondary'
    appearance?: 'default' | 'light'
  }
> = {
  identified: { label: 'Identificado', variant: 'outline' },
  treating: { label: 'Em Tratamento', variant: 'info', appearance: 'light' },
  controlled: { label: 'Controlado', variant: 'success', appearance: 'light' },
  eliminated: { label: 'Eliminado', variant: 'secondary', appearance: 'light' },
}

const statusTabs: Array<{ value: RiskFilters['status']; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'identified', label: 'Identificado' },
  { value: 'treating', label: 'Em Tratamento' },
  { value: 'controlled', label: 'Controlado' },
  { value: 'eliminated', label: 'Eliminado' },
]

async function fetchRisks(filters: RiskFilters): Promise<RisksResponse> {
  const params = new URLSearchParams({
    page: String(filters.page),
    per_page: String(filters.per_page),
  })

  if (filters.search.trim()) params.set('search', filters.search.trim())
  if (filters.status !== 'all') params.set('status', filters.status)
  if (filters.level !== 'all') params.set('level', filters.level)

  const response = await fetch(`/api/risks?${params.toString()}`)
  if (!response.ok) throw new Error('Falha ao carregar inventário de riscos')
  return response.json()
}

async function fetchRiskStats() {
  const response = await fetch('/api/risks?page=1&per_page=200')
  if (!response.ok) throw new Error('Falha ao carregar indicadores de riscos')

  const payload: RisksResponse = await response.json()
  const allRisks = payload.data

  return {
    total: payload.meta.total,
    critical: allRisks.filter((r) => r.risk_level === 'critical').length,
    treating: allRisks.filter((r) => r.status === 'treating').length,
    controlled: allRisks.filter((r) => r.status === 'controlled').length,
  }
}

export function RisksPage() {
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<RiskFilters>(() => {
    const levelParam = searchParams.get('level')
    const statusParam = searchParams.get('status')

    return {
      search: '',
      status: validRiskStatuses.has(statusParam as RiskFilters['status'])
        ? (statusParam as RiskFilters['status'])
        : 'all',
      level: validRiskLevels.has(levelParam as RiskFilters['level'])
        ? (levelParam as RiskFilters['level'])
        : 'all',
      page: 1,
      per_page: 10,
    }
  })
  const [risks, setRisks] = useState<Risk[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
    first_page: 1,
  })
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    treating: 0,
    controlled: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchRisks(filters)
      .then((response) => {
        if (!active) return
        setRisks(response.data)
        setMeta(response.meta)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os riscos',
        )
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

    fetchRiskStats()
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

  useEffect(() => {
    const levelParam = searchParams.get('level')
    const statusParam = searchParams.get('status')

    setFilters((current) => {
      const level = validRiskLevels.has(levelParam as RiskFilters['level'])
        ? (levelParam as RiskFilters['level'])
        : 'all'
      const status = validRiskStatuses.has(statusParam as RiskFilters['status'])
        ? (statusParam as RiskFilters['status'])
        : 'all'

      if (current.level === level && current.status === status) return current

      return {
        ...current,
        level,
        status,
        page: 1,
      }
    })
  }, [searchParams])

  const paginationItems = useMemo(() => {
    return Array.from({ length: meta.last_page || 1 }, (_, index) => index + 1)
  }, [meta.last_page])

  const hasActiveFilters =
    filters.search.trim() || filters.status !== 'all' || filters.level !== 'all'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Inventário de Riscos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mapeie, priorize e acompanhe os riscos psicossociais por setor.
          </p>
        </div>
        <Button variant="primary" size="lg" className="gap-2 self-start">
          <Plus className="size-4" />
          Novo Risco
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total de Riscos"
          value={stats.total}
          helper="Inventário consolidado da escola"
          icon={AlertTriangle}
          tone="primary"
        />
        <StatCard
          title="Críticos"
          value={stats.critical}
          helper="Riscos intoleráveis e prioritários"
          icon={ShieldX}
          tone="destructive"
        />
        <StatCard
          title="Em Tratamento"
          value={stats.treating}
          helper="Demandam acompanhamento ativo"
          icon={Wrench}
          tone="info"
        />
        <StatCard
          title="Controlados"
          value={stats.controlled}
          helper="Riscos com medidas estabilizadas"
          icon={ShieldCheck}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="flex-col items-start gap-4">
          <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <CardTitle>Inventário de Riscos</CardTitle>
            <CardToolbar>
              <InputGroup className="w-full xl:max-w-md">
                <InputWrapper variant="lg">
                  <Search className="size-4 text-muted-foreground" />
                  <Input
                    variant="lg"
                    value={filters.search}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        search: event.target.value,
                        page: 1,
                      }))
                    }
                    placeholder="Buscar por categoria, setor ou descrição"
                  />
                </InputWrapper>
              </InputGroup>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  value={filters.level}
                  onValueChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      level: value as RiskFilters['level'],
                      page: 1,
                    }))
                  }
                >
                  <SelectTrigger size="lg" className="min-w-52">
                    <SelectValue placeholder="Filtrar por nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os níveis</SelectItem>
                    <SelectItem value="low">Trivial</SelectItem>
                    <SelectItem value="medium">Tolerável</SelectItem>
                    <SelectItem value="high">Substancial</SelectItem>
                    <SelectItem value="critical">Intolerável</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={String(filters.per_page)}
                  onValueChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      per_page: Number(value),
                      page: 1,
                    }))
                  }
                >
                  <SelectTrigger size="lg" className="min-w-40">
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
          </div>

          <Tabs
            value={filters.status}
            onValueChange={(value) =>
              setFilters((current) => ({
                ...current,
                status: value as RiskFilters['status'],
                page: 1,
              }))
            }
          >
            <TabsList
              variant="button"
              className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0"
            >
              {statusTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-full border border-border px-4 data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria MTE</TableHead>
                <TableHead className="hidden md:table-cell">Setor</TableHead>
                <TableHead className="hidden md:table-cell text-center">Probabilidade</TableHead>
                <TableHead className="hidden md:table-cell text-center">Severidade</TableHead>
                <TableHead>Nível</TableHead>
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
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : risks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhum risco encontrado</p>
                      <p className="text-sm text-muted-foreground">
                        Ajuste os filtros para ampliar a busca no inventário.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{risk.category_label}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {risk.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {risk.environment_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center font-medium">
                      {risk.probability}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-center font-medium">
                      {risk.severity}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'border-0',
                          levelMeta[risk.risk_level].className,
                        )}
                      >
                        {levelMeta[risk.risk_level].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusMeta[risk.status].variant}
                        appearance={statusMeta[risk.status].appearance}
                      >
                        {statusMeta[risk.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setSelectedRisk(risk)}
                            >
                              <Eye className="size-3.5" />
                              Ver
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalhes do risco</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() =>
                                toast.success('Abrindo editor de risco...')
                              }
                            >
                              <Pencil className="size-3.5" />
                              Editar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar risco</TooltipContent>
                        </Tooltip>
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
              'Carregando inventário...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} riscos
                {hasActiveFilters && ' filtrados'}
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
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: current.page - 1,
                    }))
                  }
                >
                  Anterior
                </Button>
              </PaginationItem>

              {paginationItems.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={
                      pageNumber === meta.current_page ? 'primary' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        page: pageNumber,
                      }))
                    }
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
                  onClick={() =>
                    setFilters((current) => ({
                      ...current,
                      page: current.page + 1,
                    }))
                  }
                >
                  Próxima
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <Sheet
        open={!!selectedRisk}
        onOpenChange={(open) => !open && setSelectedRisk(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] overflow-y-auto"
        >
          {selectedRisk && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle className="text-lg leading-tight">
                      {selectedRisk.category_label}
                    </SheetTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedRisk.environment_name}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'shrink-0 border-0',
                      levelMeta[selectedRisk.risk_level].className,
                    )}
                  >
                    {levelMeta[selectedRisk.risk_level].label}
                  </Badge>
                </div>
              </SheetHeader>

              <SheetBody className="mt-4 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">
                    Descrição do Risco
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedRisk.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">
                      Status
                    </span>
                    <div>
                      <Badge
                        variant={statusMeta[selectedRisk.status].variant}
                        appearance={statusMeta[selectedRisk.status].appearance}
                      >
                        {statusMeta[selectedRisk.status].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">
                      Data de Identificação
                    </span>
                    <p className="text-sm font-medium">
                      {new Date(selectedRisk.created_at).toLocaleDateString(
                        'pt-BR',
                      )}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">
                      Responsável
                    </span>
                    <p className="text-sm font-medium">Equipe SST</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                  <h4 className="text-sm font-medium">Matriz de Risco</h4>
                  <div className="flex items-center gap-6">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Probabilidade
                      </span>
                      <p className="text-2xl font-semibold">
                        {selectedRisk.probability}
                      </p>
                    </div>
                    <div className="text-2xl text-muted-foreground/30">×</div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Severidade
                      </span>
                      <p className="text-2xl font-semibold">
                        {selectedRisk.severity}
                      </p>
                    </div>
                    <div className="text-2xl text-muted-foreground/30">=</div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Score
                      </span>
                      <p
                        className={cn(
                          'text-2xl font-semibold',
                          levelMeta[selectedRisk.risk_level].className
                            .split(' ')
                            .find((c) => c.startsWith('text-')),
                        )}
                      >
                        {selectedRisk.probability * selectedRisk.severity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    className="w-full"
                    onClick={() =>
                      toast.success('Redirecionando para criação de plano...')
                    }
                  >
                    Criar Plano de Ação
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toast.success('Abrindo editor de risco...')}
                  >
                    Editar Risco
                  </Button>
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
