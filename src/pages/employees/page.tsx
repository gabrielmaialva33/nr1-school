import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ElementType } from 'react'
import { toast } from 'sonner'
import {
  AlertCircle,
  CalendarDays,
  FileText,
  Filter,
  GraduationCap,
  Plus,
  Search,
  Shield,
  Upload,
  UserCheck,
  UserMinus,
  Users,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { CountingNumber } from '@/components/ui/counting-number'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import {
  createEmployeeComplianceDocument,
  fetchEmployeeComplianceOverview,
  fetchTrainingsLookup,
  type ComplianceDocumentStatus,
  type ComplianceDocumentType,
  type EmployeeComplianceOverview,
  type TrainingLookup,
} from '@/services/employee-compliance'
import {
  fetchEmployees,
  fetchEmployeesStats,
  type Employee,
  type EmployeeStatus,
  type PaginationMeta,
} from '@/services/employees'

interface UploadDocumentDraft {
  document_type: ComplianceDocumentType
  training_id: string
  equipment_name: string
  ca_number: string
  issued_at: string
  expires_at: string
  notes: string
  file: File | null
}

const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_UPLOAD_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

const statusMeta: Record<EmployeeStatus, { label: string; description: string; variant: 'success' | 'warning' | 'info' }> = {
  active: { label: 'Ativo', description: 'Funcionário em exercício regular', variant: 'success' },
  on_leave: { label: 'Afastado', description: 'Em licença ou afastamento temporário', variant: 'warning' },
  inactive: { label: 'Em férias', description: 'Funcionário em período de descanso', variant: 'info' },
}

const documentTypeMeta: Record<ComplianceDocumentType, { label: string; helper: string; variant: 'info' | 'warning' }> = {
  training_certificate: {
    label: 'Certificado de treinamento',
    helper: 'Evidência de capacitação concluída pelo colaborador',
    variant: 'info',
  },
  ppe_delivery_receipt: {
    label: 'Comprovante de entrega de EPI',
    helper: 'Aceite assinado para item de proteção ou kit operacional',
    variant: 'warning',
  },
}

const documentStatusMeta: Record<ComplianceDocumentStatus, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  validated: { label: 'Validado', variant: 'success' },
  expiring_soon: { label: 'Vencendo', variant: 'warning' },
  pending_validation: { label: 'Pendente', variant: 'secondary' },
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
}

function createEmptyUploadDraft(): UploadDocumentDraft {
  return {
    document_type: 'training_certificate',
    training_id: '',
    equipment_name: '',
    ca_number: '',
    issued_at: '',
    expires_at: '',
    notes: '',
    file: null,
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatCpf(cpf: string) {
  const lastDigits = cpf.slice(-5)
  return `***.***.${lastDigits.slice(0, 3)}-${lastDigits.slice(3)}`
}

function formatFileSize(file: File | null) {
  if (!file) return 'Nenhum arquivo anexado'
  if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
  return `${(file.size / (1024 * 1024)).toFixed(1)} MB`
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function addMonthsToDate(baseDate: string, months: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]
}

function addDaysToDate(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
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
  const [trainingsLookup, setTrainingsLookup] = useState<TrainingLookup[]>([])
  const [employeeCompliance, setEmployeeCompliance] = useState<Record<string, EmployeeComplianceOverview>>({})
  const [isComplianceLoading, setIsComplianceLoading] = useState(false)
  const [complianceError, setComplianceError] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const [uploadDraft, setUploadDraft] = useState<UploadDocumentDraft>(createEmptyUploadDraft)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  useEffect(() => {
    let active = true

    fetchTrainingsLookup()
      .then(data => {
        if (!active) return
        setTrainingsLookup(data)
      })
      .catch(() => {
        if (!active) return
        toast.error('Não foi possível carregar o catálogo de treinamentos')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedEmployee) return

    let active = true
    setIsComplianceLoading(true)
    setComplianceError(null)

    fetchEmployeeComplianceOverview(selectedEmployee.id)
      .then(payload => {
        if (!active) return
        setEmployeeCompliance(current => ({
          ...current,
          [selectedEmployee.id]: payload,
        }))
      })
      .catch(err => {
        if (!active) return
        setComplianceError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o dossiê de compliance',
        )
      })
      .finally(() => {
        if (!active) return
        setIsComplianceLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedEmployee])

  useEffect(() => {
    if (!isUploadOpen) return
    setUploadDraft(createEmptyUploadDraft())
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [isUploadOpen, selectedEmployee?.id])

  const selectedCompliance = selectedEmployee ? employeeCompliance[selectedEmployee.id] ?? null : null

  const availableTrainingOptions = useMemo(() => {
    if (selectedCompliance && selectedCompliance.training_catalog.length > 0) {
      return selectedCompliance.training_catalog
    }

    return trainingsLookup.filter(training => training.status !== 'scheduled')
  }, [selectedCompliance, trainingsLookup])

  const selectedTrainingOption = availableTrainingOptions.find(training => training.id === uploadDraft.training_id)

  useEffect(() => {
    if (!uploadDraft.issued_at) return

    const nextExpiresAt = uploadDraft.document_type === 'training_certificate'
      ? selectedTrainingOption
        ? addMonthsToDate(uploadDraft.issued_at, selectedTrainingOption.validity_months)
        : ''
      : addDaysToDate(uploadDraft.issued_at, 180)

    if (!nextExpiresAt) return

    setUploadDraft(current => (
      current.expires_at === nextExpiresAt
        ? current
        : { ...current, expires_at: nextExpiresAt }
    ))
  }, [
    uploadDraft.document_type,
    uploadDraft.issued_at,
    selectedTrainingOption,
  ])

  const paginationItems = useMemo(() => {
    return Array.from({ length: meta.last_page || 1 }, (_, index) => index + 1)
  }, [meta.last_page])

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all'

  const trainingEnrollmentLookup = useMemo(() => {
    return new Map(
      (selectedCompliance?.training_enrollments ?? []).map(enrollment => [enrollment.id, enrollment]),
    )
  }, [selectedCompliance])

  const ppeDeliveryLookup = useMemo(() => {
    return new Map(
      (selectedCompliance?.ppe_deliveries ?? []).map(delivery => [delivery.id, delivery]),
    )
  }, [selectedCompliance])

  const trainingLookup = useMemo(() => {
    const source = selectedCompliance?.training_catalog.length
      ? selectedCompliance.training_catalog
      : trainingsLookup

    return new Map(source.map(training => [training.id, training]))
  }, [selectedCompliance, trainingsLookup])

  const complianceSummary = useMemo(() => {
    const documents = selectedCompliance?.compliance_documents ?? []

    return {
      total_documents: documents.length,
      valid_documents: documents.filter(document => document.status === 'validated').length,
      expiring_documents: documents.filter(document => document.status === 'expiring_soon').length,
      pending_documents: selectedCompliance?.meta.open_requirements ?? 0,
    }
  }, [selectedCompliance])

  const uploadChecklist = [
    uploadDraft.file ? 'Arquivo anexado' : null,
    uploadDraft.document_type === 'training_certificate'
      ? uploadDraft.training_id
        ? 'Treinamento vinculado'
        : null
      : uploadDraft.equipment_name.trim()
        ? 'Entrega de EPI informada'
        : null,
    uploadDraft.issued_at ? 'Data de emissão preenchida' : null,
  ].filter(Boolean)

  const isUploadReady = Boolean(
    selectedEmployee &&
    selectedCompliance &&
    uploadDraft.file &&
    uploadDraft.issued_at &&
    uploadDraft.expires_at &&
    (
      (uploadDraft.document_type === 'training_certificate' && uploadDraft.training_id) ||
      (
        uploadDraft.document_type === 'ppe_delivery_receipt' &&
        uploadDraft.equipment_name.trim() &&
        uploadDraft.ca_number.trim()
      )
    ),
  )

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      setUploadDraft(current => ({ ...current, file: null }))
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

    setUploadDraft(current => ({ ...current, file }))
  }

  const clearSelectedUploadFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploadDraft(current => ({ ...current, file: null }))
  }

  const openUploadDialog = () => {
    if (!selectedCompliance) {
      toast.error('Carregue o dossiê do colaborador antes de anexar documentos')
      return
    }
    setIsUploadOpen(true)
  }

  const refreshSelectedEmployeeCompliance = async () => {
    if (!selectedEmployee) return

    const payload = await fetchEmployeeComplianceOverview(selectedEmployee.id)
    setEmployeeCompliance(current => ({
      ...current,
      [selectedEmployee.id]: payload,
    }))
  }

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedEmployee || !selectedCompliance) {
      toast.error('Selecione um colaborador antes de anexar documentos')
      return
    }

    if (!uploadDraft.file) {
      toast.error('Anexe o arquivo antes de registrar')
      return
    }

    setIsUploadingDocument(true)

    try {
      await createEmployeeComplianceDocument(selectedEmployee.id, {
        tenant_id: selectedCompliance.meta.tenant_id,
        document_type: uploadDraft.document_type,
        training_id: uploadDraft.document_type === 'training_certificate' ? uploadDraft.training_id : undefined,
        equipment_name: uploadDraft.document_type === 'ppe_delivery_receipt' ? uploadDraft.equipment_name.trim() : undefined,
        ca_number: uploadDraft.document_type === 'ppe_delivery_receipt' ? uploadDraft.ca_number.trim() : undefined,
        issued_at: uploadDraft.issued_at,
        expires_at: uploadDraft.expires_at,
        notes: uploadDraft.notes.trim() || undefined,
        file_name: uploadDraft.file.name,
        mime_type: uploadDraft.file.type || 'application/octet-stream',
        file_size_bytes: uploadDraft.file.size,
      })

      await refreshSelectedEmployeeCompliance()
      toast.success(`Documento anexado ao dossiê de ${selectedEmployee.name}`)
      setIsUploadOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Não foi possível registrar o documento do colaborador',
      )
    } finally {
      setIsUploadingDocument(false)
    }
  }

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
          title="Compliance"
          value={isStatsLoading ? '...' : `${stats.active}/${stats.total || 1}`}
          helper="Base pronta para vincular documentos"
          icon={FileText}
          tone="info"
        />
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
                  placeholder="Buscar por nome, cargo ou setor"
                />
              </InputWrapper>
            </InputGroup>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Filter className="size-4" />
                    Filtros
                    {statusFilter !== 'all' && (
                      <Badge className="ml-1 border-0 bg-primary/10 px-1.5 py-0 text-[10px] text-primary">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setStatusFilter('all'); setPage(1) }}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setStatusFilter('active'); setPage(1) }}>
                    Ativos
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setStatusFilter('on_leave'); setPage(1) }}>
                    Afastados
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => { setStatusFilter('inactive'); setPage(1) }}>
                    Em férias
                  </DropdownMenuItem>
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
                  Array.from({ length: 8 }).map((_, index) => (
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
                        <p className="text-sm text-muted-foreground">Tente outro termo para busca ou ajuste os filtros.</p>
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

      <Sheet
        open={!!selectedEmployee}
        onOpenChange={open => {
          if (!open) {
            setSelectedEmployee(null)
            setIsUploadOpen(false)
          }
        }}
      >
        <SheetContent side="right" className="overflow-y-auto sm:max-w-3xl">
          {selectedEmployee && (
            <>
              <SheetHeader className="border-b pb-4">
                <SheetTitle>{selectedEmployee.name}</SheetTitle>
                <SheetDescription>
                  Perfil 360º do colaborador com documentos, treinamentos e entregas de EPI vinculadas por tenant.
                </SheetDescription>
              </SheetHeader>

              <SheetBody className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">CPF</p>
                    <p className="mt-1 text-sm font-medium">{formatCpf(selectedEmployee.cpf)}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Cargo</p>
                    <p className="mt-1 text-sm font-medium">{selectedEmployee.role}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Setor</p>
                    <p className="mt-1 text-sm font-medium">{selectedEmployee.environment_name}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Data de admissão</p>
                    <p className="mt-1 text-sm font-medium">{formatDate(selectedEmployee.admission_date)}</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusMeta[selectedEmployee.status].variant} appearance="light" className="mt-2">
                      {statusMeta[selectedEmployee.status].label}
                    </Badge>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">E-mail</p>
                    <p className="mt-1 text-sm font-medium">{selectedEmployee.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-2"
                    onClick={openUploadDialog}
                    disabled={isComplianceLoading || !selectedCompliance}
                  >
                    <Upload className="size-4" />
                    Subir certificado / entrega
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => toast.success('Dossiê exportado com sucesso')}
                  >
                    Exportar dossiê
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive"
                    onClick={() => {
                      toast.success(`${selectedEmployee.name} desligado com sucesso`)
                      setSelectedEmployee(null)
                    }}
                  >
                    Desligar funcionário
                  </Button>
                </div>

                <Separator />

                {isComplianceLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
                    ))}
                  </div>
                ) : complianceError ? (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                    {complianceError}
                  </div>
                ) : selectedCompliance ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="size-4 text-info" />
                          Documentos
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{complianceSummary.total_documents}</p>
                        <p className="text-xs text-muted-foreground">Arquivos vinculados ao prontuário</p>
                      </div>
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <GraduationCap className="size-4 text-primary" />
                          Treinamentos
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{selectedCompliance.training_enrollments.length}</p>
                        <p className="text-xs text-muted-foreground">Registros ligados ao colaborador</p>
                      </div>
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Shield className="size-4 text-warning" />
                          Entregas de EPI
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{selectedCompliance.ppe_deliveries.length}</p>
                        <p className="text-xs text-muted-foreground">Comprovantes e próximos ciclos</p>
                      </div>
                      <div className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <AlertCircle className="size-4 text-destructive" />
                          Pendências
                        </div>
                        <p className="mt-3 text-2xl font-semibold">{complianceSummary.pending_documents}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedCompliance.meta.expiring_documents} documento(s) vencendo
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold">Contexto do tenant</p>
                          <p className="text-sm text-muted-foreground">
                            `tenant_id` {selectedCompliance.meta.tenant_id} com dados prontos para integrar API Adonis v6.
                          </p>
                        </div>
                        <Badge variant="outline">Atualizado em {formatDateTime(selectedCompliance.meta.generated_at)}</Badge>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-2xl border bg-card p-5">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-primary" />
                          <p className="font-semibold">Treinamentos vinculados</p>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedCompliance.training_enrollments.length > 0 ? (
                            selectedCompliance.training_enrollments.map(enrollment => {
                              const training = trainingLookup.get(enrollment.training_id)
                              return (
                                <div key={enrollment.id} className="rounded-xl border p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="font-medium">{training?.title ?? 'Treinamento não encontrado'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        Instrutor: {enrollment.instructor_name}
                                      </p>
                                    </div>
                                    <Badge variant={enrollment.status === 'completed' ? 'success' : 'warning'} appearance="light">
                                      {enrollment.status === 'completed' ? 'Concluído' : 'Em andamento'}
                                    </Badge>
                                  </div>
                                  <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Conclusão</p>
                                      <p>{formatDate(enrollment.completed_at)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Validade</p>
                                      <p>{formatDate(enrollment.valid_until)}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Nenhum treinamento vinculado ao colaborador neste tenant.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-card p-5">
                        <div className="flex items-center gap-2">
                          <Shield className="size-4 text-warning" />
                          <p className="font-semibold">Entregas de EPI</p>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedCompliance.ppe_deliveries.length > 0 ? (
                            selectedCompliance.ppe_deliveries.map(delivery => (
                              <div key={delivery.id} className="rounded-xl border p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium">{delivery.item_name}</p>
                                    <p className="text-xs text-muted-foreground">CA {delivery.ca_number}</p>
                                  </div>
                                  <Badge variant="warning" appearance="light">Assinado</Badge>
                                </div>
                                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Entrega</p>
                                    <p>{formatDate(delivery.delivered_at)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Próxima troca</p>
                                    <p>{formatDate(delivery.next_replacement_at)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Nenhuma entrega de EPI registrada para o colaborador.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-5">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-info" />
                        <p className="font-semibold">Documentos anexados</p>
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedCompliance.compliance_documents.length > 0 ? (
                          selectedCompliance.compliance_documents.map(document => {
                            const trainingEnrollment = document.training_enrollment_id
                              ? trainingEnrollmentLookup.get(document.training_enrollment_id)
                              : null
                            const ppeDelivery = document.ppe_delivery_id
                              ? ppeDeliveryLookup.get(document.ppe_delivery_id)
                              : null
                            const training = trainingEnrollment
                              ? trainingLookup.get(trainingEnrollment.training_id)
                              : null

                            return (
                              <div key={document.id} className="rounded-xl border p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-medium">{document.file_name}</p>
                                      <Badge variant={documentTypeMeta[document.document_type].variant} appearance="light">
                                        {documentTypeMeta[document.document_type].label}
                                      </Badge>
                                      <Badge variant={documentStatusMeta[document.status].variant} appearance="light">
                                        {documentStatusMeta[document.status].label}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {document.document_type === 'training_certificate'
                                        ? `Treinamento: ${training?.title ?? 'Não vinculado'}`
                                        : `EPI: ${ppeDelivery?.item_name ?? 'Não vinculado'}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Upload em {formatDateTime(document.uploaded_at)} • {formatBytes(document.file_size_bytes)}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm md:min-w-64">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Emissão</p>
                                      <p>{formatDate(document.issued_at)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Validade</p>
                                      <p>{formatDate(document.expires_at)}</p>
                                    </div>
                                  </div>
                                </div>
                                {document.notes && (
                                  <p className="mt-3 rounded-lg bg-muted/30 p-3 text-sm text-muted-foreground">
                                    {document.notes}
                                  </p>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Nenhum documento anexado para este colaborador.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : null}
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Subir documento do colaborador</DialogTitle>
            <DialogDescription>
              Fluxo normalizado para certificado de treinamento ou comprovante de entrega de EPI, pronto para acoplar API real com `snake_case`.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form
              id="employee-compliance-upload-form"
              className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
              onSubmit={handleUploadSubmit}
            >
              <div className="space-y-5">
                <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Upload className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium">Arquivo do documento</p>
                        <p className="text-sm text-muted-foreground">
                          Aceite PDF, JPG ou PNG com até 10 MB. O mock grava metadados normalizados para `compliance_documents`.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() => fileInputRef.current?.click()}
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
                      <Badge variant={uploadDraft.file ? 'success' : 'secondary'} appearance="light">
                        {uploadDraft.file ? 'Arquivo pronto' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo do documento</Label>
                    <Select
                      value={uploadDraft.document_type}
                      onValueChange={(value: ComplianceDocumentType) =>
                        setUploadDraft(current => ({
                          ...current,
                          document_type: value,
                          training_id: '',
                          equipment_name: '',
                          ca_number: '',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="training_certificate">Certificado de treinamento</SelectItem>
                        <SelectItem value="ppe_delivery_receipt">Comprovante de entrega de EPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compliance-issued-at">Data de emissão</Label>
                    <Input
                      id="compliance-issued-at"
                      type="date"
                      value={uploadDraft.issued_at}
                      onChange={event =>
                        setUploadDraft(current => ({ ...current, issued_at: event.target.value }))
                      }
                      required
                    />
                  </div>
                </div>

                {uploadDraft.document_type === 'training_certificate' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Treinamento concluído</Label>
                      <Select
                        value={uploadDraft.training_id}
                        onValueChange={value =>
                          setUploadDraft(current => ({ ...current, training_id: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o treinamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrainingOptions.map(training => (
                            <SelectItem key={training.id} value={training.id}>
                              {training.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="compliance-expires-at">Validade</Label>
                      <Input
                        id="compliance-expires-at"
                        type="date"
                        value={uploadDraft.expires_at}
                        onChange={event =>
                          setUploadDraft(current => ({ ...current, expires_at: event.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="equipment-name">Equipamento entregue</Label>
                      <Input
                        id="equipment-name"
                        value={uploadDraft.equipment_name}
                        onChange={event =>
                          setUploadDraft(current => ({ ...current, equipment_name: event.target.value }))
                        }
                        placeholder="Ex: Luva nitrílica, colete refletivo, avental térmico"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="equipment-ca">CA / referência</Label>
                      <Input
                        id="equipment-ca"
                        value={uploadDraft.ca_number}
                        onChange={event =>
                          setUploadDraft(current => ({ ...current, ca_number: event.target.value.toUpperCase() }))
                        }
                        placeholder="Ex: CA 33458"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="compliance-expires-at-ppe">Próxima troca / revisão</Label>
                      <Input
                        id="compliance-expires-at-ppe"
                        type="date"
                        value={uploadDraft.expires_at}
                        onChange={event =>
                          setUploadDraft(current => ({ ...current, expires_at: event.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                      Use também este fluxo quando a escola controlar EPI/IPI operacional por recibo individual.
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="compliance-notes">Observações</Label>
                  <Textarea
                    id="compliance-notes"
                    rows={4}
                    value={uploadDraft.notes}
                    onChange={event =>
                      setUploadDraft(current => ({ ...current, notes: event.target.value }))
                    }
                    placeholder="Ex.: certificado emitido após reciclagem anual ou recibo assinado em entrega emergencial."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border bg-card p-5">
                  <p className="text-sm font-semibold">Resumo do payload</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">Colaborador</p>
                      <p className="mt-1 text-sm font-medium">{selectedEmployee?.name ?? 'Sem colaborador selecionado'}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedEmployee
                          ? `${selectedEmployee.role} • ${selectedEmployee.environment_name}`
                          : 'O documento ficará vinculado ao perfil individual'}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={documentTypeMeta[uploadDraft.document_type].variant} appearance="light">
                          {documentTypeMeta[uploadDraft.document_type].label}
                        </Badge>
                        {uploadDraft.expires_at && (
                          <Badge variant="outline">
                            Validade {formatDate(uploadDraft.expires_at)}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {documentTypeMeta[uploadDraft.document_type].helper}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Vínculo operacional</p>
                      <p className="mt-1 text-sm font-medium">
                        {uploadDraft.document_type === 'training_certificate'
                          ? selectedTrainingOption?.title || 'Selecione um treinamento'
                          : uploadDraft.equipment_name || 'Informe o equipamento entregue'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCompliance
                          ? `tenant_id ${selectedCompliance.meta.tenant_id}`
                          : 'tenant_id será resolvido no mock'}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Checklist</p>
                      <div className="mt-3 space-y-2">
                        {uploadChecklist.length > 0 ? (
                          uploadChecklist.map(item => (
                            <div key={item} className="flex items-center gap-2 text-sm">
                              <Badge variant="success" appearance="light">OK</Badge>
                              <span>{item}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Complete os campos para habilitar o registro.
                          </p>
                        )}
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
              form="employee-compliance-upload-form"
              variant="primary"
              disabled={!isUploadReady || isUploadingDocument}
            >
              {isUploadingDocument ? 'Registrando...' : 'Registrar documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Funcionário</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <form
              id="create-employee-form"
              className="space-y-4"
              onSubmit={event => {
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
