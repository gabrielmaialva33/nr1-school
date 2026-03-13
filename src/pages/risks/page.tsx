import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Sparkles,
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
  SheetDescription,
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
import { TableRowsSkeleton } from '@/components/loading/page-skeletons'
import { createPaginationMeta } from '@/lib/pagination'
import {
  fetchRisks,
  fetchRiskStats,
  type PaginationMeta,
  type Risk,
  type RiskFilters,
  type RiskLevel,
  type RiskStatus,
} from '@/services/risks'

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
      accent: 'from-primary/90 via-orange-400/80 to-transparent',
    },
    destructive: {
      iconWrap: 'bg-destructive/10 text-destructive',
      value: 'text-destructive',
      accent: 'from-destructive/85 via-orange-400/75 to-transparent',
    },
    info: {
      iconWrap: 'bg-info/10 text-info',
      value: 'text-info',
      accent: 'from-info/85 via-cyan-400/70 to-transparent',
    },
    success: {
      iconWrap: 'bg-success/10 text-success',
      value: 'text-success',
      accent: 'from-success/85 via-emerald-400/70 to-transparent',
    },
  }

  return (
    <div className="surface-card relative overflow-hidden rounded-2xl border border-border/75 bg-card/95 p-5 shadow-[var(--shadow-soft)]">
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r', tones[tone].accent)} />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
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
      <p className="mt-3 text-xs text-muted-foreground/90">{helper}</p>
    </div>
  )
}

const levelMeta: Record<RiskLevel, { label: string; className: string }> = {
  low: {
    label: 'Trivial',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/55 dark:text-emerald-200',
  },
  medium: {
    label: 'Tolerável',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/55 dark:text-blue-200',
  },
  high: {
    label: 'Substancial',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-950/55 dark:text-orange-200',
  },
  critical: {
    label: 'Intolerável',
    className: 'bg-red-100 text-red-800 dark:bg-red-950/55 dark:text-red-200',
  },
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
  const [meta, setMeta] = useState<PaginationMeta>(() => createPaginationMeta(0, 1, 10))
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
  const criticalRate = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0
  const controlledRate = stats.total > 0 ? Math.round((stats.controlled / stats.total) * 100) : 0
  const monitoredRate = stats.total > 0 ? Math.round((stats.treating / stats.total) * 100) : 0

  return (
    <div className="page-shell space-y-6">
      <div className="page-stagger grid gap-6">
        <div className="relative overflow-hidden rounded-[30px] border border-border/75 bg-gradient-to-br from-card via-card to-orange-50/35 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm dark:to-orange-950/20 md:p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.2),transparent_40%),radial-gradient(circle_at_62%_56%,rgba(249,115,22,0.18),transparent_34%)]" />
          <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px] xl:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                <Sparkles className="size-3.5" />
                Radar de exposição psicossocial
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                Inventário de Riscos
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Mapeie, priorize e acompanhe os riscos psicossociais por setor com foco no que exige ação rápida.
                O inventário consolida criticidade, tratamento e controle em uma visão operacional.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <div className="rounded-full border border-border/70 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-soft)]">
                  {stats.critical} intoleráveis no radar
                </div>
                <div className="rounded-full border border-border/70 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-soft)]">
                  {stats.treating} em tratamento ativo
                </div>
                <div className="rounded-full border border-border/70 bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-soft)]">
                  {controlledRate}% sob controle
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-border/70 bg-background/92 p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Exposição prioritária
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                    {criticalRate}%
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    do inventário atual está em faixa crítica e pede resposta imediata.
                  </p>
                </div>
                <Button variant="primary" size="lg" className="gap-2 self-start">
                  <Plus className="size-4" />
                  Novo Risco
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-destructive via-orange-500 to-primary transition-all"
                    style={{ width: `${criticalRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-2xl border border-border/70 bg-muted/25 px-3 py-2">
                    <p className="font-semibold text-destructive">{stats.critical}</p>
                    <p className="mt-1 text-muted-foreground">críticos</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/25 px-3 py-2">
                    <p className="font-semibold text-info">{monitoredRate}%</p>
                    <p className="mt-1 text-muted-foreground">em tratamento</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/25 px-3 py-2">
                    <p className="font-semibold text-success">{controlledRate}%</p>
                    <p className="mt-1 text-muted-foreground">controlados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

        <Card className="surface-card rounded-[28px] border border-border/80 bg-card/96 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <CardHeader className="flex-col items-stretch gap-4 border-b border-border/70 pb-5">
            <div>
              <CardTitle>Inventário de Riscos</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Use os filtros para refinar criticidade, etapa do tratamento e volume por página.
              </p>
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
                    className="rounded-full border border-border bg-background/80 px-4 data-[state=active]:border-primary data-[state=active]:bg-primary/12 data-[state=active]:text-primary"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <CardToolbar className="w-full flex-col items-stretch gap-3 xl:flex-row xl:items-center xl:justify-between">
              <InputGroup className="w-full xl:max-w-xl">
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

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center">
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
                  <SelectTrigger size="lg" className="w-full sm:min-w-52">
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
                  <SelectTrigger size="lg" className="w-full sm:min-w-40">
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

          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/15 px-4 py-3 text-xs">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 font-medium text-foreground">
                <Activity className="size-3.5 text-primary" />
                {meta.total} registros no recorte atual
              </div>
              {hasActiveFilters ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 font-medium text-foreground">
                  <AlertTriangle className="size-3.5 text-orange-500" />
                  filtros ativos aplicados
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 font-medium text-foreground">
                  <ShieldCheck className="size-3.5 text-success" />
                  visão consolidada do inventário
                </div>
              )}
            </div>
            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-background/70">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
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
                    <TableRowsSkeleton colSpan={7} />
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
                      <TableRow key={risk.id} className="border-t border-border/70 hover:bg-muted/25">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{risk.category_label}</p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
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
                                  className="gap-1.5 bg-background/90"
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
                                  className="gap-1.5 bg-background/90"
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
      </div>

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
                    <SheetDescription className="mt-2">
                      Panorama operacional do risco, com criticidade, ambiente afetado e status atual de tratamento.
                    </SheetDescription>
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-1.5">
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
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-1.5">
                    <span className="text-xs text-muted-foreground">
                      Data de Identificação
                    </span>
                    <p className="text-sm font-medium">
                      {new Date(selectedRisk.created_at).toLocaleDateString(
                        'pt-BR',
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-1.5 sm:col-span-2">
                    <span className="text-xs text-muted-foreground">
                      Responsável
                    </span>
                    <p className="text-sm font-medium">Equipe SST</p>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border bg-muted/35 p-5">
                  <h4 className="text-sm font-medium">Matriz de Risco</h4>
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3">
                    <div className="space-y-1 rounded-2xl border border-border/60 bg-background/65 p-4 text-center">
                      <span className="text-xs text-muted-foreground">
                        Probabilidade
                      </span>
                      <p className="text-2xl font-semibold">
                        {selectedRisk.probability}
                      </p>
                    </div>
                    <div className="text-2xl text-muted-foreground/30">×</div>
                    <div className="space-y-1 rounded-2xl border border-border/60 bg-background/65 p-4 text-center">
                      <span className="text-xs text-muted-foreground">
                        Severidade
                      </span>
                      <p className="text-2xl font-semibold">
                        {selectedRisk.severity}
                      </p>
                    </div>
                    <div className="text-2xl text-muted-foreground/30">=</div>
                    <div className="space-y-1 rounded-2xl border border-border/60 bg-background/65 p-4 text-center">
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
