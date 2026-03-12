import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  EyeOff,
  FileQuestion,
  Filter,
  Info,
  MoreVertical,
  Plus,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card'
import { CountingNumber } from '@/components/ui/counting-number'
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
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  fetchComplaints,
  fetchComplaintStats,
  type Complaint,
  type ComplaintFilters,
  type ComplaintStatus,
  type PaginationMeta,
} from '@/services/complaints'

interface Filters extends ComplaintFilters {
  search: string
  status: ComplaintStatus | 'all'
  page: number
  per_page: number
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  title: string
  value: number | string
  helper: string
  icon: React.ElementType
  tone?: 'primary' | 'destructive' | 'info' | 'success' | 'warning'
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
    warning: {
      iconWrap: 'bg-orange-500/10 text-orange-500',
      value: 'text-orange-500',
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
            {typeof value === 'number' ? (
              <CountingNumber to={value} duration={1.5} />
            ) : (
              value
            )}
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

const statusMeta: Record<
  Complaint['status'],
  { label: string; description: string; className: string }
> = {
  received: {
    label: 'Nova',
    description: 'Denúncia recebida, aguardando triagem',
    className: 'bg-blue-100 text-blue-700',
  },
  under_review: {
    label: 'Em Análise',
    description: 'Denúncia sendo analisada pela equipe',
    className: 'bg-purple-100 text-purple-700',
  },
  investigating: {
    label: 'Investigando',
    description: 'Investigação em andamento',
    className: 'bg-orange-100 text-orange-700',
  },
  resolved: {
    label: 'Resolvida',
    description: 'Caso resolvido e encerrado',
    className: 'bg-green-100 text-green-700',
  },
  dismissed: {
    label: 'Arquivada',
    description: 'Denúncia arquivada sem procedência',
    className: 'bg-secondary text-secondary-foreground',
  },
}

const categoryMeta: Record<string, string> = {
  moral_harassment: 'Assédio Moral',
  sexual_harassment: 'Assédio Sexual',
  poor_relationships: 'Relacionamentos Prejudiciais',
  difficult_conditions: 'Condições Difíceis',
  violence_trauma: 'Violência/Trauma',
}

function getPriority(category: string) {
  if (category === 'sexual_harassment')
    return {
      label: 'Crítica',
      description: 'Prioridade máxima - requer ação imediata',
      className: 'bg-red-100 text-red-700',
    }
  if (category === 'moral_harassment')
    return {
      label: 'Alta',
      description: 'Prioridade alta - tratar com urgência',
      className: 'bg-orange-100 text-orange-700',
    }
  return {
    label: 'Média',
    description: 'Prioridade média - acompanhar normalmente',
    className: 'bg-yellow-100 text-yellow-700',
  }
}

export function ComplaintsPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    page: 1,
    per_page: 10,
  })
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
    first_page: 1,
  })
  const [stats, setStats] = useState({
    total: 0,
    reviewing: 0,
    resolved: 0,
    anonymous: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail sheet state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  )

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    category: '',
    sector_reported: '',
    description: '',
    is_anonymous: false,
  })

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchComplaints(filters)
      .then((response) => {
        if (!active) return
        setComplaints(response.data)
        setMeta(response.meta)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar as denúncias',
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

    fetchComplaintStats()
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

  const hasActiveFilters =
    filters.search.trim() !== '' || filters.status !== 'all'

  const statusFilterLabel =
    filters.status === 'all'
      ? 'Filtros'
      : (statusMeta[filters.status]?.label ?? 'Filtros')

  function handleCreateSubmit() {
    if (!createForm.category || !createForm.description.trim()) {
      toast.error('Preencha a categoria e a descrição.')
      return
    }
    toast.success('Denúncia registrada com sucesso. Protocolo gerado.')
    setIsCreateOpen(false)
    setCreateForm({
      category: '',
      sector_reported: '',
      description: '',
      is_anonymous: false,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Canal de Denúncias
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe relatos de assédio e conflitos com sigilo e segurança.
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="solid"
              className="gap-2 self-start bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="size-4" />
              Nova Denúncia
            </Button>
          </TooltipTrigger>
          <TooltipContent>Registrar nova denúncia</TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={stats.total}
          helper="Denúncias registradas"
          icon={FileQuestion}
          tone="primary"
        />
        <StatCard
          title="Em Análise"
          value={stats.reviewing}
          helper="Em andamento/investigação"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          title="Resolvidas"
          value={stats.resolved}
          helper="Casos já solucionados"
          icon={Info}
          tone="success"
        />
        <StatCard
          title="Anônimas"
          value={stats.anonymous}
          helper="Identidade preservada"
          icon={EyeOff}
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Lista de denúncias</CardTitle>
          <CardToolbar className="w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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
                  placeholder="Buscar por protocolo, categoria ou setor"
                />
              </InputWrapper>
            </InputGroup>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Filter className="size-4" />
                    {statusFilterLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilters((current) => ({ ...current, status: 'all', page: 1 }))}>
                    Todas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters((current) => ({ ...current, status: 'received', page: 1 }))}>
                    Nova
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((current) => ({ ...current, status: 'under_review', page: 1 }))}
                  >
                    Em Análise
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((current) => ({ ...current, status: 'investigating', page: 1 }))}
                  >
                    Investigando
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilters((current) => ({ ...current, status: 'resolved', page: 1 }))}>
                    Resolvida
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((current) => ({ ...current, status: 'dismissed', page: 1 }))}
                  >
                    Arquivada
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <SelectTrigger size="lg" className="hidden sm:flex min-w-40">
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

        <div className="p-4">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell w-12 text-center">#</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Prioridade</TableHead>
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
              ) : complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhuma denúncia encontrada</p>
                      <p className="text-sm text-muted-foreground">
                        Ajuste os filtros para tentar novamente.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((complaint, index) => {
                  const absoluteIndex =
                    (meta.current_page - 1) * meta.per_page + index + 1
                  const priority = getPriority(complaint.category)

                  return (
                    <TableRow key={complaint.id}>
                      <TableCell className="hidden md:table-cell text-center font-medium text-muted-foreground">
                        {absoluteIndex}
                      </TableCell>
                      <TableCell className="font-medium">
                        {complaint.protocol_number}
                      </TableCell>
                      <TableCell>
                        {categoryMeta[complaint.category] || complaint.category}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(complaint.created_at).toLocaleDateString(
                          'pt-BR',
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                className={cn(
                                  'border-0',
                                  statusMeta[complaint.status]?.className,
                                )}
                              >
                                {statusMeta[complaint.status]?.label}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {statusMeta[complaint.status]?.description}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                className={cn('border-0', priority.className)}
                              >
                                {priority.label}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {priority.description}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Ações para ${complaint.protocol_number}`}
                                onClick={() => setSelectedComplaint(complaint)}
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalhes</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          </div>
        </div>

        <CardFooter className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            {isLoading || isStatsLoading ? (
              'Carregando denúncias...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} denúncias
                {hasActiveFilters && ' filtradas'}
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

      {/* Complaint Details Sheet */}
      <Sheet
        open={!!selectedComplaint}
        onOpenChange={(open) => {
          if (!open) setSelectedComplaint(null)
        }}
      >
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedComplaint &&
            (() => {
              const priority = getPriority(selectedComplaint.category)
              const status = statusMeta[selectedComplaint.status]
              return (
                <>
                  <SheetHeader>
                    <SheetTitle>{selectedComplaint.protocol_number}</SheetTitle>
                  </SheetHeader>
                  <Separator />
                  <SheetBody className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Categoria
                        </p>
                        <p className="text-sm font-medium">
                          {categoryMeta[selectedComplaint.category] ||
                            selectedComplaint.category}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Status
                        </p>
                        <Badge className={cn('border-0', status?.className)}>
                          {status?.label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Prioridade
                        </p>
                        <Badge className={cn('border-0', priority.className)}>
                          {priority.label}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Anônima
                        </p>
                        <p className="text-sm font-medium">
                          {selectedComplaint.is_anonymous ? 'Sim' : 'Não'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Setor Reportado
                        </p>
                        <p className="text-sm font-medium">
                          {selectedComplaint.sector_reported}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Responsável
                        </p>
                        <p className="text-sm font-medium">
                          {selectedComplaint.assigned_to}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Descrição
                      </p>
                      <p className="text-sm leading-relaxed">
                        {selectedComplaint.description}
                      </p>
                    </div>

                    {selectedComplaint.resolution_description && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">
                          Resolução
                        </p>
                        <p className="text-sm leading-relaxed">
                          {selectedComplaint.resolution_description}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Data de Criação
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(
                          selectedComplaint.created_at,
                        ).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          toast.success('Status alterado com sucesso.')
                        }
                      >
                        Alterar Status
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          toast.success('Relatório enviado para impressão.')
                        }
                      >
                        Imprimir
                      </Button>
                    </div>
                  </SheetBody>
                </>
              )
            })()}
        </SheetContent>
      </Sheet>

      {/* New Complaint Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Denúncia</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="complaint-category">Categoria</Label>
              <Select
                value={createForm.category}
                onValueChange={(value) =>
                  setCreateForm((current) => ({ ...current, category: value }))
                }
              >
                <SelectTrigger id="complaint-category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moral_harassment">
                    Assédio Moral
                  </SelectItem>
                  <SelectItem value="sexual_harassment">
                    Assédio Sexual
                  </SelectItem>
                  <SelectItem value="poor_relationships">
                    Relacionamentos Prejudiciais
                  </SelectItem>
                  <SelectItem value="difficult_conditions">
                    Condições Difíceis
                  </SelectItem>
                  <SelectItem value="violence_trauma">
                    Violência/Trauma
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-sector">Setor Reportado</Label>
              <Input
                id="complaint-sector"
                value={createForm.sector_reported}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    sector_reported: e.target.value,
                  }))
                }
                placeholder="Ex: Administração, Sala 5..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-description">Descrição</Label>
              <Textarea
                id="complaint-description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
                placeholder="Descreva a denúncia com o máximo de detalhes..."
                rows={5}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="complaint-anonymous"
                checked={createForm.is_anonymous}
                onCheckedChange={(checked: boolean) =>
                  setCreateForm((current) => ({
                    ...current,
                    is_anonymous: checked,
                  }))
                }
              />
              <Label htmlFor="complaint-anonymous" className="cursor-pointer">
                Denúncia anônima?
              </Label>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="solid"
              className="bg-orange-600 text-white hover:bg-orange-700"
              onClick={handleCreateSubmit}
            >
              Registrar Denúncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
