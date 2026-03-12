import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { AlertCircle, Brain, CalendarDays, Check, FileText, Filter, MoreVertical, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDatePtBr } from '@/lib/formatters'
import { createPaginationMeta } from '@/lib/pagination'
import {
  createMedicalCertificate,
  fetchCertificateStats,
  fetchCertificates,
  fetchEmployeesLookup,
  type EmployeeOption,
  type MedicalCertificate,
  type MedicalCertificateFilters,
  type PaginationMeta,
} from '@/services/medical-certificates'
import {
  MedicalCertificateAlertBadges,
  MedicalCertificateDetailSheet,
  MedicalCertificateHeaderIcon,
  MedicalCertificateMentalHealthBadge,
  MedicalCertificateStatCard,
  MedicalCertificateUploadDialog,
} from './components'
import {
  ACCEPTED_UPLOAD_FILE_TYPES,
  createEmptyUploadDraft,
  MAX_UPLOAD_FILE_SIZE,
  nexusRiskMeta,
  type UploadDraft,
} from './helpers'

type Filters = MedicalCertificateFilters

export function MedicalCertificatesPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    page: 1,
    per_page: 10,
    nexus_risk: 'all',
  })
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(() => createPaginationMeta(0, 1, 10))
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
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os atestados')
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

  const employeeCertCount = useMemo(() => {
    const counts: Record<string, number> = {}
    certificates.forEach((certificate) => {
      counts[certificate.employee_id] = (counts[certificate.employee_id] || 0) + 1
    })
    return counts
  }, [certificates])

  const hasActiveFilters = filters.search.trim() !== '' || filters.nexus_risk !== 'all'
  const selectedUploadEmployee = employeeOptions.find(
    (employee) => employee.id === uploadDraft.employee_id,
  )
  const uploadAlerts = [
    uploadDraft.is_mental_health ? 'CID relacionado a saúde mental' : null,
    uploadDraft.nexus_risk === 'high' ? 'Encaminhar para análise de nexo ocupacional' : null,
    Number(uploadDraft.days_off || '0') >= 15 ? 'Afastamento prolongado exige acompanhamento' : null,
    uploadDraft.inss_referral ? 'Fluxo com INSS indicado no cadastro' : null,
  ].filter(Boolean) as string[]
  const isUploadReady =
    Boolean(uploadDraft.file) &&
    Boolean(selectedUploadEmployee) &&
    uploadDraft.doctor_name.trim() !== '' &&
    uploadDraft.issue_date !== '' &&
    uploadDraft.return_date !== '' &&
    uploadDraft.icd_code.trim() !== ''

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

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!uploadDraft.file) {
      toast.error('Anexe o arquivo do atestado antes de registrar')
      return
    }

    if (!selectedUploadEmployee) {
      toast.error('Selecione o colaborador para continuar')
      return
    }

    try {
      await createMedicalCertificate({
        employee_id: selectedUploadEmployee.id,
        employee_name: selectedUploadEmployee.name,
        issue_date: uploadDraft.issue_date,
        days_off: Number(uploadDraft.days_off || '0'),
        icd_code: uploadDraft.icd_code.trim(),
        is_mental_health: uploadDraft.is_mental_health,
        doctor_name: uploadDraft.doctor_name.trim(),
        return_date: uploadDraft.return_date,
        inss_referral: uploadDraft.inss_referral,
        nexus_risk: uploadDraft.nexus_risk,
        attachment: {
          file_name: uploadDraft.file.name,
          mime_type: uploadDraft.file.type || 'application/octet-stream',
          file_size_bytes: uploadDraft.file.size,
        },
      })

      const [certificateResponse, certificateStats] = await Promise.all([
        fetchCertificates({ ...filters, page: 1 }),
        fetchCertificateStats(),
      ])

      setCertificates(certificateResponse.data)
      setMeta(certificateResponse.meta)
      setStats(certificateStats)
      setFilters((current) => ({ ...current, page: 1 }))
      toast.success(`Atestado de ${selectedUploadEmployee.name} registrado com sucesso`)
      setIsUploadOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Não foi possível registrar o atestado',
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Atestados Médicos</h1>
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
        <MedicalCertificateStatCard
          title="Total Atestados"
          value={stats.total}
          helper="No período selecionado"
          icon={FileText}
          tone="primary"
        />
        <MedicalCertificateStatCard
          title="Saúde Mental"
          value={stats.mentalHealth}
          helper="CID grupo F"
          icon={Brain}
          tone="warning"
        />
        <MedicalCertificateStatCard
          title="Nexo Alto"
          value={stats.highNexus}
          helper="Relação com trabalho"
          icon={AlertCircle}
          tone="destructive"
        />
        <MedicalCertificateStatCard
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
                  onChange={(event) => {
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                      page: 1,
                    }))
                  }}
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
                      <Badge className="ml-1 border-0 bg-primary/10 px-1.5 py-0 text-[10px] text-primary">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Risco de Nexo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['all', 'high', 'medium', 'low', 'none'].map((value) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => {
                        setFilters((current) => ({ ...current, nexus_risk: value, page: 1 }))
                      }}
                    >
                      {filters.nexus_risk === value && <Check className="size-4" />}
                      {value === 'all'
                        ? 'Todos'
                        : value === 'high'
                          ? 'Alto'
                          : value === 'medium'
                            ? 'Médio'
                            : value === 'low'
                              ? 'Baixo'
                              : 'Nenhum'}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Select
                value={String(filters.per_page)}
                onValueChange={(value) => {
                  setFilters((current) => ({
                    ...current,
                    per_page: Number(value),
                    page: 1,
                  }))
                }}
              >
                <SelectTrigger size="lg" className="hidden min-w-40 sm:flex">
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
                  <TableHead className="hidden text-center md:table-cell">Dias</TableHead>
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
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-destructive">
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
                  certificates.map((certificate) => {
                    const hasMultiple = employeeCertCount[certificate.employee_id] > 1

                    return (
                      <TableRow key={certificate.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <MedicalCertificateHeaderIcon name={certificate.employee_name} />
                            <span className="font-medium">{certificate.employee_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDatePtBr(certificate.issue_date)}
                        </TableCell>
                        <TableCell>{certificate.icd_code}</TableCell>
                        <TableCell className="hidden text-center font-medium md:table-cell">
                          {certificate.days_off}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <MedicalCertificateMentalHealthBadge
                            isMentalHealth={certificate.is_mental_health}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge className={cn('border-0', nexusRiskMeta[certificate.nexus_risk]?.className)}>
                                  {nexusRiskMeta[certificate.nexus_risk]?.label}
                                </Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {nexusRiskMeta[certificate.nexus_risk]?.description}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <MedicalCertificateAlertBadges
                            certificate={certificate}
                            hasMultiple={hasMultiple}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  aria-label={`Ações para atestado de ${certificate.employee_name}`}
                                  onClick={() => setSelectedCertificate(certificate)}
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
                {Math.min(meta.current_page * meta.per_page, meta.total)} de {meta.total} atestados
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
                  onClick={() => {
                    setFilters((current) => ({ ...current, page: current.page - 1 }))
                  }}
                >
                  Anterior
                </Button>
              </PaginationItem>

              {paginationItems.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <Button
                    variant={pageNumber === meta.current_page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilters((current) => ({ ...current, page: pageNumber }))
                    }}
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
                  onClick={() => {
                    setFilters((current) => ({ ...current, page: current.page + 1 }))
                  }}
                >
                  Próxima
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>

      <MedicalCertificateDetailSheet
        certificate={selectedCertificate}
        onOpenChange={(open) => {
          if (!open) setSelectedCertificate(null)
        }}
      />

      <MedicalCertificateUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        uploadDraft={uploadDraft}
        setUploadDraft={setUploadDraft}
        employeeOptions={employeeOptions}
        selectedUploadEmployee={selectedUploadEmployee}
        uploadAlerts={uploadAlerts}
        isUploadReady={isUploadReady}
        fileInputRef={fileInputRef}
        onUploadFileChange={handleUploadFileChange}
        onSubmit={handleUploadSubmit}
      />
    </div>
  )
}
