import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import {
  AlertCircle,
  Brain,
  CalendarDays,
  Check,
  FileText,
  Filter,
  HeartPulse,
  MoreVertical,
  Printer,
  Search,
  Upload,
  X,
} from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { CountingNumber } from '@/components/ui/counting-number'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import {
  fetchCertificateStats,
  fetchCertificates,
  fetchEmployeesLookup,
  type EmployeeOption,
  type MedicalCertificate,
  type MedicalCertificateFilters,
  type PaginationMeta,
} from '@/services/medical-certificates'

interface Filters extends MedicalCertificateFilters {
  search: string
  page: number
  per_page: number
  nexus_risk: string
}

interface UploadDraft {
  employee_id: string
  issue_date: string
  return_date: string
  days_off: string
  icd_code: string
  doctor_name: string
  nexus_risk: 'low' | 'medium' | 'high' | 'none'
  is_mental_health: boolean
  inss_referral: boolean
  notes: string
  file: File | null
}

const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_UPLOAD_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

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
            {typeof value === 'number' ? <CountingNumber to={value} duration={1.5} /> : value}
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

const nexusRiskMeta: Record<string, { label: string; description: string; className: string }> = {
  high: { label: 'Alto', description: 'Forte relação com ambiente de trabalho', className: 'bg-red-100 text-red-700' },
  medium: { label: 'Médio', description: 'Possível relação com ambiente de trabalho', className: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Baixo', description: 'Pouca relação com ambiente de trabalho', className: 'bg-green-100 text-green-700' },
  none: { label: '\u2014', description: 'Sem relação com ambiente de trabalho', className: 'bg-secondary/50 text-muted-foreground' },
}

const employeeStatusMeta: Record<EmployeeOption['status'], { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-green-100 text-green-700' },
  on_leave: { label: 'Afastado', className: 'bg-yellow-100 text-yellow-700' },
  inactive: { label: 'Em férias', className: 'bg-slate-100 text-slate-700' },
}

function createEmptyUploadDraft(): UploadDraft {
  return {
    employee_id: '',
    issue_date: '',
    return_date: '',
    days_off: '7',
    icd_code: '',
    doctor_name: '',
    nexus_risk: 'medium',
    is_mental_health: false,
    inss_referral: false,
    notes: '',
    file: null,
  }
}

function formatFileSize(file: File | null) {
  if (!file) return 'Nenhum arquivo anexado'
  if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`
}

export function MedicalCertificatesPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    page: 1,
    per_page: 10,
    nexus_risk: 'all',
  })
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1,
    first_page: 1,
  })
  const [stats, setStats] = useState({
    total: 0,
    mentalHealth: 0,
    highNexus: 0,
    avgDays: '0',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([])
  const [uploadDraft, setUploadDraft] = useState<UploadDraft>(createEmptyUploadDraft)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    fetchCertificates(filters)
      .then((response) => {
        if (!active) return
        setCertificates(response.data)
        setMeta(response.meta)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os atestados',
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

    fetchCertificateStats()
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
    let active = true

    fetchEmployeesLookup()
      .then((data) => {
        if (!active) return
        setEmployeeOptions(data)
      })
      .catch(() => {
        if (!active) return
        toast.error('Não foi possível carregar a lista de colaboradores')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isUploadOpen) return
    setUploadDraft(createEmptyUploadDraft())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [isUploadOpen])

  useEffect(() => {
    if (!uploadDraft.issue_date) return
    const daysOff = Number(uploadDraft.days_off || '0')
    if (Number.isNaN(daysOff) || daysOff <= 0) return

    const issueDate = new Date(`${uploadDraft.issue_date}T00:00:00`)
    issueDate.setDate(issueDate.getDate() + daysOff)

    setUploadDraft((current) => ({
      ...current,
      return_date: issueDate.toISOString().split('T')[0],
    }))
  }, [uploadDraft.issue_date, uploadDraft.days_off])

  const paginationItems = useMemo(() => {
    return Array.from({ length: meta.last_page || 1 }, (_, index) => index + 1)
  }, [meta.last_page])

  // Simple logic to mock multiple certificates check (for UI alerts)
  const employeeCertCount = useMemo(() => {
    const counts: Record<string, number> = {}
    certificates.forEach((c) => {
      counts[c.employee_id] = (counts[c.employee_id] || 0) + 1
    })
    return counts
  }, [certificates])

  const hasActiveFilters = filters.search.trim() !== '' || filters.nexus_risk !== 'all'
  const selectedUploadEmployee = employeeOptions.find((employee) => employee.id === uploadDraft.employee_id)
  const uploadAlerts = [
    uploadDraft.is_mental_health ? 'CID relacionado a saúde mental' : null,
    uploadDraft.nexus_risk === 'high' ? 'Encaminhar para análise de nexo ocupacional' : null,
    Number(uploadDraft.days_off || '0') >= 15 ? 'Afastamento prolongado exige acompanhamento' : null,
    uploadDraft.inss_referral ? 'Fluxo com INSS indicado no cadastro' : null,
  ].filter(Boolean)
  const isUploadReady =
    Boolean(uploadDraft.file) &&
    Boolean(selectedUploadEmployee) &&
    uploadDraft.doctor_name.trim() !== '' &&
    uploadDraft.issue_date !== '' &&
    uploadDraft.return_date !== '' &&
    uploadDraft.icd_code.trim() !== ''

  const openUploadFilePicker = () => {
    fileInputRef.current?.click()
  }

  const clearSelectedUploadFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploadDraft((current) => ({ ...current, file: null }))
  }

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setUploadDraft((current) => ({ ...current, file: null }))
      return
    }

    const hasSupportedMimeType = ACCEPTED_UPLOAD_FILE_TYPES.includes(file.type)
    const hasSupportedExtension = /\.(pdf|png|jpe?g)$/i.test(file.name)

    if (!hasSupportedMimeType && !hasSupportedExtension) {
      toast.error('Formato inválido. Envie PDF, JPG ou PNG.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      toast.error('Arquivo acima de 10 MB. Reduza o tamanho antes do upload.')
      event.target.value = ''
      return
    }

    setUploadDraft((current) => ({ ...current, file }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Atestados Médicos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie atestados e analise o nexo com riscos ocupacionais.
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="solid"
              className="gap-2 self-start bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => setIsUploadOpen(true)}
            >
              <Upload className="size-4" />
              Upload Atestado
            </Button>
          </TooltipTrigger>
          <TooltipContent>Registrar novo atestado médico</TooltipContent>
        </Tooltip>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Atestados"
          value={stats.total}
          helper="No período selecionado"
          icon={FileText}
          tone="primary"
        />
        <StatCard
          title="Saúde Mental"
          value={stats.mentalHealth}
          helper="CID grupo F"
          icon={Brain}
          tone="warning"
        />
        <StatCard
          title="Nexo Alto"
          value={stats.highNexus}
          helper="Relação com trabalho"
          icon={AlertCircle}
          tone="destructive"
        />
        <StatCard
          title="Média Dias"
          value={stats.avgDays}
          helper="Dias de afastamento por atestado"
          icon={CalendarDays}
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="sr-only">Lista de atestados</CardTitle>
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
                  placeholder="Buscar por funcionário, CID ou médico"
                />
              </InputWrapper>
            </InputGroup>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Filter className="size-4" />
                    Filtros
                    {filters.nexus_risk !== 'all' && (
                      <Badge className="ml-1 border-0 bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Risco de Nexo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilters((c) => ({ ...c, nexus_risk: 'all', page: 1 }))}
                  >
                    {filters.nexus_risk === 'all' && <Check className="size-4" />}
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((c) => ({ ...c, nexus_risk: 'high', page: 1 }))}
                  >
                    {filters.nexus_risk === 'high' && <Check className="size-4" />}
                    Alto
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((c) => ({ ...c, nexus_risk: 'medium', page: 1 }))}
                  >
                    {filters.nexus_risk === 'medium' && <Check className="size-4" />}
                    Médio
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((c) => ({ ...c, nexus_risk: 'low', page: 1 }))}
                  >
                    {filters.nexus_risk === 'low' && <Check className="size-4" />}
                    Baixo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters((c) => ({ ...c, nexus_risk: 'none', page: 1 }))}
                  >
                    {filters.nexus_risk === 'none' && <Check className="size-4" />}
                    Nenhum
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
                <TableHead>Funcionário</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>CID</TableHead>
                <TableHead className="hidden md:table-cell text-center">Dias</TableHead>
                <TableHead className="hidden md:table-cell">Saúde Mental</TableHead>
                <TableHead>Nexo Risco</TableHead>
                <TableHead className="hidden md:table-cell">Alertas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <div className="h-10 animate-pulse rounded-lg bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">Nenhum atestado encontrado</p>
                      <p className="text-sm text-muted-foreground">
                        Ajuste os filtros para tentar novamente.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => {
                  const hasMultiple = employeeCertCount[cert.employee_id] > 1
                  return (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-[10px]">{getInitials(cert.employee_name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{cert.employee_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(cert.issue_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{cert.icd_code}</TableCell>
                      <TableCell className="hidden md:table-cell text-center font-medium">
                        {cert.days_off}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {cert.is_mental_health ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge className="border-0 bg-red-100 text-red-700">
                                  Sim
                                </Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>CID do grupo F - saúde mental</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge className="border-0 bg-secondary text-secondary-foreground">
                            Não
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Badge
                                className={cn(
                                  'border-0',
                                  nexusRiskMeta[cert.nexus_risk]?.className,
                                )}
                              >
                                {nexusRiskMeta[cert.nexus_risk]?.label}
                              </Badge>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{nexusRiskMeta[cert.nexus_risk]?.description}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-2">
                          {cert.nexus_risk === 'high' && (
                            <div className="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                              <AlertCircle className="size-3" />
                              Nexo alto
                            </div>
                          )}
                          {hasMultiple && (
                            <div className="flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 ring-1 ring-orange-600/10 ring-inset">
                              <HeartPulse className="size-3" />
                              Múltiplos
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={`Ações para atestado de ${cert.employee_name}`}
                                onClick={() => setSelectedCertificate(cert)}
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
              'Carregando atestados...'
            ) : meta.total > 0 ? (
              <>
                Exibindo {(meta.current_page - 1) * meta.per_page + 1} a{' '}
                {Math.min(meta.current_page * meta.per_page, meta.total)} de{' '}
                {meta.total} atestados
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

      {/* Certificate Details Sheet */}
      <Sheet
        open={!!selectedCertificate}
        onOpenChange={(open) => !open && setSelectedCertificate(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:w-[540px] overflow-y-auto"
        >
          {selectedCertificate && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle className="text-lg leading-tight">
                      {selectedCertificate.employee_name}
                    </SheetTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Atestado registrado em{' '}
                      {new Date(selectedCertificate.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'border-0 shrink-0',
                      nexusRiskMeta[selectedCertificate.nexus_risk]?.className,
                    )}
                  >
                    Nexo: {nexusRiskMeta[selectedCertificate.nexus_risk]?.label}
                  </Badge>
                </div>
              </SheetHeader>

              <SheetBody className="mt-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Código CID</p>
                    <p className="text-sm font-medium">{selectedCertificate.icd_code}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Saúde Mental</p>
                    <div>
                      {selectedCertificate.is_mental_health ? (
                        <Badge className="border-0 bg-red-100 text-red-700">Sim</Badge>
                      ) : (
                        <Badge className="border-0 bg-secondary text-secondary-foreground">Não</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Data de Emissão</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedCertificate.issue_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Data de Retorno</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedCertificate.return_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Dias de Afastamento</p>
                    <p className="text-sm font-medium">{selectedCertificate.days_off} dias</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Encaminhamento INSS</p>
                    <div>
                      {selectedCertificate.inss_referral ? (
                        <Badge className="border-0 bg-orange-100 text-orange-700">Sim</Badge>
                      ) : (
                        <Badge className="border-0 bg-secondary text-secondary-foreground">Não</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Médico Responsável</p>
                  <p className="text-sm font-medium">{selectedCertificate.doctor_name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Risco de Nexo</p>
                  <Badge
                    className={cn(
                      'border-0',
                      nexusRiskMeta[selectedCertificate.nexus_risk]?.className,
                    )}
                  >
                    {nexusRiskMeta[selectedCertificate.nexus_risk]?.label}
                  </Badge>
                </div>

                <Separator />

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="solid"
                    className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
                    onClick={() => {
                      toast.success(`Atestado de ${selectedCertificate.employee_name} aprovado`)
                      setSelectedCertificate(null)
                    }}
                  >
                    <Check className="size-4" />
                    Aprovar
                  </Button>
                  <Button
                    variant="solid"
                    className="w-full gap-2 bg-red-600 text-white hover:bg-red-700"
                    onClick={() => {
                      toast.success(`Atestado de ${selectedCertificate.employee_name} recusado`)
                      setSelectedCertificate(null)
                    }}
                  >
                    <X className="size-4" />
                    Recusar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      toast.success('Enviando atestado para impressão...')
                    }}
                  >
                    <Printer className="size-4" />
                    Imprimir
                  </Button>
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Upload Certificate Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Registrar Atestado Médico</DialogTitle>
            <DialogDescription>
              Faça o upload do arquivo e complete os metadados para manter a rastreabilidade do caso.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form
              id="upload-certificate-form"
              className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
              onSubmit={(e) => {
                e.preventDefault()
                if (!uploadDraft.file) {
                  toast.error('Anexe o arquivo do atestado antes de registrar')
                  return
                }

                if (!selectedUploadEmployee) {
                  toast.error('Selecione o colaborador para continuar')
                  return
                }

                toast.success(`Atestado de ${selectedUploadEmployee.name} registrado com sucesso`)
                setIsUploadOpen(false)
              }}
            >
              <div className="space-y-5">
                <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-700">
                        <Upload className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">Arquivo do atestado</p>
                        <p className="text-sm text-muted-foreground">
                          Aceite PDF, JPG ou PNG com até 10 MB. O upload fica vinculado ao histórico do colaborador.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={openUploadFilePicker}
                      >
                        <Upload className="size-4" />
                        {uploadDraft.file ? 'Trocar arquivo' : 'Selecionar arquivo'}
                      </Button>
                      {uploadDraft.file && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="gap-2 text-muted-foreground"
                          onClick={clearSelectedUploadFile}
                        >
                          <X className="size-4" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleUploadFileChange}
                  />

                  <div className="mt-4 rounded-xl border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {uploadDraft.file?.name || 'Nenhum arquivo selecionado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadDraft.file)}
                        </p>
                      </div>
                      <Badge
                        variant={uploadDraft.file ? 'success' : 'secondary'}
                        appearance="light"
                      >
                        {uploadDraft.file ? 'Arquivo pronto' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" appearance="light">PDF, JPG ou PNG</Badge>
                      <Badge variant="secondary" appearance="light">Até 10 MB</Badge>
                      <Badge
                        variant={selectedUploadEmployee ? 'success' : 'secondary'}
                        appearance="light"
                      >
                        {selectedUploadEmployee ? 'Colaborador vinculado' : 'Vincular colaborador'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Colaborador</Label>
                    <Select
                      value={uploadDraft.employee_id}
                      onValueChange={(value) =>
                        setUploadDraft((current) => ({ ...current, employee_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeOptions.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cert-doctor">Médico responsável</Label>
                    <Input
                      id="cert-doctor"
                      value={uploadDraft.doctor_name}
                      onChange={(event) =>
                        setUploadDraft((current) => ({
                          ...current,
                          doctor_name: event.target.value,
                        }))
                      }
                      placeholder="Dr(a). Nome"
                      required
                    />
                  </div>
                </div>

                {selectedUploadEmployee && (
                  <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Cargo</p>
                      <p className="text-sm font-medium">{selectedUploadEmployee.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Setor</p>
                      <p className="text-sm font-medium">{selectedUploadEmployee.environment_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Situação</p>
                      <Badge className={cn('mt-1 border-0', employeeStatusMeta[selectedUploadEmployee.status].className)}>
                        {employeeStatusMeta[selectedUploadEmployee.status].label}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cert-issue-date">Data de emissão</Label>
                    <Input
                      id="cert-issue-date"
                      type="date"
                      value={uploadDraft.issue_date}
                      onChange={(event) =>
                        setUploadDraft((current) => ({
                          ...current,
                          issue_date: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cert-days-off">Dias de afastamento</Label>
                    <Input
                      id="cert-days-off"
                      type="number"
                      min="1"
                      max="180"
                      value={uploadDraft.days_off}
                      onChange={(event) =>
                        setUploadDraft((current) => ({
                          ...current,
                          days_off: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cert-return-date">Retorno previsto</Label>
                    <Input
                      id="cert-return-date"
                      type="date"
                      value={uploadDraft.return_date}
                      onChange={(event) =>
                        setUploadDraft((current) => ({
                          ...current,
                          return_date: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cert-cid">CID</Label>
                    <Input
                      id="cert-cid"
                      value={uploadDraft.icd_code}
                      onChange={(event) =>
                        setUploadDraft((current) => ({
                          ...current,
                          icd_code: event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="Ex: F32.1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Risco de nexo</Label>
                    <Select
                      value={uploadDraft.nexus_risk}
                      onValueChange={(value: UploadDraft['nexus_risk']) =>
                        setUploadDraft((current) => ({
                          ...current,
                          nexus_risk: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="none">Nenhum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 md:grid-cols-2">
                  <label className="flex items-start gap-3">
                    <Checkbox
                      checked={uploadDraft.is_mental_health}
                      onCheckedChange={(checked) =>
                        setUploadDraft((current) => ({
                          ...current,
                          is_mental_health: Boolean(checked),
                        }))
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">Relaciona-se à saúde mental</p>
                      <p className="text-xs text-muted-foreground">Use para CID do grupo F ou casos com impacto psicossocial.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3">
                    <Checkbox
                      checked={uploadDraft.inss_referral}
                      onCheckedChange={(checked) =>
                        setUploadDraft((current) => ({
                          ...current,
                          inss_referral: Boolean(checked),
                        }))
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">Encaminhamento ao INSS</p>
                      <p className="text-xs text-muted-foreground">Marque quando o caso exigir fluxo previdenciário.</p>
                    </div>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert-notes">Observações</Label>
                  <Textarea
                    id="cert-notes"
                    value={uploadDraft.notes}
                    onChange={(event) =>
                      setUploadDraft((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Ex.: colaborador relatou agravamento após episódio crítico no setor."
                    rows={4}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border bg-card p-5">
                  <p className="text-sm font-semibold">Resumo do registro</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">Colaborador</p>
                      <p className="mt-1 text-sm font-medium">
                        {selectedUploadEmployee?.name || 'Selecione um colaborador'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedUploadEmployee
                          ? `${selectedUploadEmployee.role} • ${selectedUploadEmployee.environment_name}`
                          : 'O histórico ficará vinculado ao prontuário ocupacional'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border p-3">
                        <p className="text-xs text-muted-foreground">Afastamento</p>
                        <p className="text-lg font-semibold">{uploadDraft.days_off || '0'} dias</p>
                      </div>
                      <div className="rounded-xl border p-3">
                        <p className="text-xs text-muted-foreground">Retorno</p>
                        <p className="text-sm font-medium">
                          {uploadDraft.return_date
                            ? new Date(`${uploadDraft.return_date}T00:00:00`).toLocaleDateString('pt-BR')
                            : 'A definir'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Classificação inicial</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={cn('border-0', nexusRiskMeta[uploadDraft.nexus_risk].className)}>
                          Nexo {nexusRiskMeta[uploadDraft.nexus_risk].label}
                        </Badge>
                        <Badge
                          variant={uploadDraft.is_mental_health ? 'destructive' : 'secondary'}
                          appearance="light"
                        >
                          {uploadDraft.is_mental_health ? 'Saúde mental' : 'Clínico geral'}
                        </Badge>
                        {uploadDraft.inss_referral && (
                          <Badge variant="warning" appearance="light">INSS</Badge>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Alertas automáticos</p>
                      <div className="mt-3 space-y-2">
                        {uploadAlerts.length > 0 ? (
                          uploadAlerts.map((alert) => (
                            <div key={alert} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="mt-0.5 size-4 text-orange-600" />
                              <span>{alert}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Complete os campos para gerar alertas de acompanhamento.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Checklist do cadastro</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span>Arquivo anexado</span>
                          <Badge variant={uploadDraft.file ? 'success' : 'secondary'} appearance="light">
                            {uploadDraft.file ? 'OK' : 'Pendente'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Colaborador identificado</span>
                          <Badge variant={selectedUploadEmployee ? 'success' : 'secondary'} appearance="light">
                            {selectedUploadEmployee ? 'OK' : 'Pendente'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Dados clínicos mínimos</span>
                          <Badge
                            variant={
                              uploadDraft.doctor_name.trim() && uploadDraft.issue_date && uploadDraft.icd_code.trim()
                                ? 'success'
                                : 'secondary'
                            }
                            appearance="light"
                          >
                            {uploadDraft.doctor_name.trim() && uploadDraft.issue_date && uploadDraft.icd_code.trim()
                              ? 'OK'
                              : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="upload-certificate-form"
              variant="solid"
              className="bg-orange-600 text-white hover:bg-orange-700"
              disabled={!isUploadReady}
            >
              Registrar Atestado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
