import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ElementType } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Shield,
  Upload,
  UserMinus,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  createEmployeeComplianceDocument,
  fetchEmployeeComplianceOverview,
  fetchTrainingsLookup,
  type EmployeeComplianceOverview,
  type TrainingLookup,
} from '@/services/employee-compliance'
import { fetchEmployeeById, type Employee } from '@/services/employees'
import {
  ACCEPTED_UPLOAD_FILE_TYPES,
  MAX_UPLOAD_FILE_SIZE,
  addMonthsToDate,
  createEmptyUploadDraft,
  documentStatusMeta,
  documentTypeMeta,
  employeeStatusMeta,
  formatBytes,
  formatCpf,
  formatDate,
  formatDateTime,
  formatFileSize,
  getInitials,
  type UploadDocumentDraft,
} from './profile-utils'

function addDaysToDate(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

function ProfileKpi({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string
  value: string | number
  helper: string
  icon: ElementType
}) {
  return (
    <div className="employee-profile-kpi">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="employee-profile-icon-wrap">
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

export function EmployeeProfilePage() {
  const navigate = useNavigate()
  const { employeeId = '' } = useParams()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [compliance, setCompliance] = useState<EmployeeComplianceOverview | null>(null)
  const [trainingsLookup, setTrainingsLookup] = useState<TrainingLookup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const [uploadDraft, setUploadDraft] = useState<UploadDocumentDraft>(createEmptyUploadDraft)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)

    Promise.all([
      fetchEmployeeById(employeeId),
      fetchEmployeeComplianceOverview(employeeId),
      fetchTrainingsLookup(),
    ])
      .then(([employeePayload, compliancePayload, trainingsPayload]) => {
        if (!active) return
        setEmployee(employeePayload)
        setCompliance(compliancePayload)
        setTrainingsLookup(trainingsPayload)
      })
      .catch((err) => {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o perfil do colaborador',
        )
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [employeeId])

  useEffect(() => {
    if (!isUploadOpen) {
      setUploadDraft(createEmptyUploadDraft())
    }
  }, [isUploadOpen])

  const trainingLookupMap = useMemo(
    () => new Map(trainingsLookup.map((training) => [training.id, training])),
    [trainingsLookup],
  )

  const trainingEnrollmentLookup = useMemo(
    () =>
      new Map(
        (compliance?.training_enrollments ?? []).map((enrollment) => [
          enrollment.id,
          enrollment,
        ]),
      ),
    [compliance?.training_enrollments],
  )

  const ppeDeliveryLookup = useMemo(
    () =>
      new Map(
        (compliance?.ppe_deliveries ?? []).map((delivery) => [delivery.id, delivery]),
      ),
    [compliance?.ppe_deliveries],
  )

  const complianceSummary = useMemo(() => {
    const documents = compliance?.compliance_documents ?? []
    return {
      total_documents: documents.length,
      pending_documents: documents.filter(
        (document) => document.status === 'pending_validation',
      ).length,
      expiring_documents: documents.filter(
        (document) => document.status === 'expiring_soon',
      ).length,
    }
  }, [compliance?.compliance_documents])

  const availableTrainingOptions = useMemo(() => {
    if (!compliance) return trainingsLookup

    const enrolledTrainingIds = new Set(
      compliance.training_enrollments.map((enrollment) => enrollment.training_id),
    )

    return trainingsLookup.filter((training) => enrolledTrainingIds.has(training.id))
  }, [compliance, trainingsLookup])

  const selectedTrainingOption = useMemo(
    () =>
      availableTrainingOptions.find(
        (training) => training.id === uploadDraft.training_id,
      ) ?? null,
    [availableTrainingOptions, uploadDraft.training_id],
  )

  const normalizedExpiryDate = useMemo(() => {
    if (!uploadDraft.issued_at) return ''

    if (uploadDraft.document_type === 'training_certificate') {
      return selectedTrainingOption
        ? addMonthsToDate(uploadDraft.issued_at, selectedTrainingOption.validity_months)
        : ''
    }

    return addDaysToDate(uploadDraft.issued_at, 180)
  }, [selectedTrainingOption, uploadDraft.document_type, uploadDraft.issued_at])

  const uploadChecklist = useMemo(() => {
    const items: string[] = []

    if (uploadDraft.file) items.push('Arquivo compatível anexado')
    if (uploadDraft.issued_at) items.push('Data de emissão preenchida')

    if (uploadDraft.document_type === 'training_certificate') {
      if (uploadDraft.training_id) items.push('Treinamento vinculado ao certificado')
      if (uploadDraft.expires_at || normalizedExpiryDate) {
        items.push('Validade do certificado calculada')
      }
    } else {
      if (uploadDraft.equipment_name.trim()) items.push('Equipamento informado')
      if (uploadDraft.ca_number.trim()) items.push('CA/referência registrada')
      if (uploadDraft.expires_at || normalizedExpiryDate) {
        items.push('Próxima troca/revisão registrada')
      }
    }

    return items
  }, [normalizedExpiryDate, uploadDraft])

  const isUploadReady = useMemo(() => {
    if (!employee || !compliance || !uploadDraft.file || !uploadDraft.issued_at) {
      return false
    }

    if (uploadDraft.document_type === 'training_certificate') {
      return Boolean(
        uploadDraft.training_id && (uploadDraft.expires_at || normalizedExpiryDate),
      )
    }

    return Boolean(
      uploadDraft.equipment_name.trim() &&
        uploadDraft.ca_number.trim() &&
        (uploadDraft.expires_at || normalizedExpiryDate),
    )
  }, [compliance, employee, normalizedExpiryDate, uploadDraft])

  async function refreshComplianceOverview() {
    if (!employee) return
    const payload = await fetchEmployeeComplianceOverview(employee.id)
    setCompliance(payload)
  }

  function clearSelectedUploadFile() {
    setUploadDraft((current) => ({ ...current, file: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleUploadFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null
    if (!nextFile) {
      setUploadDraft((current) => ({ ...current, file: null }))
      return
    }

    if (!ACCEPTED_UPLOAD_FILE_TYPES.includes(nextFile.type)) {
      toast.error('Use apenas PDF, JPG ou PNG para anexar o documento')
      event.target.value = ''
      return
    }

    if (nextFile.size > MAX_UPLOAD_FILE_SIZE) {
      toast.error('O arquivo excede o limite de 10 MB')
      event.target.value = ''
      return
    }

    setUploadDraft((current) => ({ ...current, file: nextFile }))
  }

  async function handleUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!employee || !compliance || !isUploadReady || !uploadDraft.file) {
      toast.error('Preencha os campos obrigatórios para registrar o documento')
      return
    }

    try {
      setIsUploadingDocument(true)

      await createEmployeeComplianceDocument(employee.id, {
        tenant_id: compliance.meta.tenant_id,
        document_type: uploadDraft.document_type,
        training_id:
          uploadDraft.document_type === 'training_certificate'
            ? uploadDraft.training_id
            : undefined,
        equipment_name:
          uploadDraft.document_type === 'ppe_delivery_receipt'
            ? uploadDraft.equipment_name.trim()
            : undefined,
        ca_number:
          uploadDraft.document_type === 'ppe_delivery_receipt'
            ? uploadDraft.ca_number.trim()
            : undefined,
        issued_at: uploadDraft.issued_at,
        expires_at: uploadDraft.expires_at || normalizedExpiryDate || undefined,
        notes: uploadDraft.notes.trim() || undefined,
        file_name: uploadDraft.file.name,
        mime_type: uploadDraft.file.type,
        file_size_bytes: uploadDraft.file.size,
      })

      await refreshComplianceOverview()
      setIsUploadOpen(false)
      toast.success(`Documento anexado ao dossiê de ${employee.name}`)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível anexar o documento',
      )
    } finally {
      setIsUploadingDocument(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !employee || !compliance) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="employee-profile-panel max-w-xl p-8">
          <p className="text-lg font-semibold text-foreground">
            {error ?? 'Funcionário não encontrado'}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Confira o identificador do colaborador ou volte para a listagem.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => navigate('/employees')}>
            Voltar para funcionários
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="employee-profile-hero">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <Avatar className="size-18 border border-white/40 shadow-sm">
              <AvatarFallback className="bg-white/90 text-lg font-semibold text-[var(--profile-hero-accent)] dark:bg-white/10 dark:text-white">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2 bg-background/80" onClick={() => navigate('/employees')}>
                  <ArrowLeft className="size-4" />
                  Voltar
                </Button>
                <Badge variant={employeeStatusMeta[employee.status].variant} appearance="light">
                  {employeeStatusMeta[employee.status].label}
                </Badge>
                <Badge variant="outline">tenant_id {compliance.meta.tenant_id}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--profile-hero-accent)]">
                  Perfil do colaborador
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {employee.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Dossiê individual com trilha de compliance, treinamentos, entregas
                  de EPI e documentos preparados para acoplar API real em `snake_case`.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="employee-profile-info">
                  <p className="text-xs text-muted-foreground">CPF</p>
                  <p className="mt-1 text-sm font-medium">{formatCpf(employee.cpf)}</p>
                </div>
                <div className="employee-profile-info">
                  <p className="text-xs text-muted-foreground">Cargo</p>
                  <p className="mt-1 text-sm font-medium">{employee.role}</p>
                </div>
                <div className="employee-profile-info">
                  <p className="text-xs text-muted-foreground">Setor</p>
                  <p className="mt-1 text-sm font-medium">{employee.environment_name}</p>
                </div>
                <div className="employee-profile-info">
                  <p className="text-xs text-muted-foreground">Admissão</p>
                  <p className="mt-1 text-sm font-medium">{formatDate(employee.admission_date)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[380px]">
            <Button variant="primary" className="gap-2" onClick={() => setIsUploadOpen(true)}>
              <Upload className="size-4" />
              Subir certificado
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => toast.success('Dossiê exportado com sucesso')}>
              <Download className="size-4" />
              Exportar dossiê
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
              onClick={() => toast.success(`${employee.name} desligado com sucesso`)}
            >
              <UserMinus className="size-4" />
              Desligar
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProfileKpi
              title="Documentos"
              value={complianceSummary.total_documents}
              helper="Arquivos vinculados ao prontuário"
              icon={FileText}
            />
            <ProfileKpi
              title="Treinamentos"
              value={compliance.training_enrollments.length}
              helper="Registros ligados ao colaborador"
              icon={GraduationCap}
            />
            <ProfileKpi
              title="Entregas de EPI"
              value={compliance.ppe_deliveries.length}
              helper="Comprovantes e próximos ciclos"
              icon={Shield}
            />
            <ProfileKpi
              title="Pendências"
              value={complianceSummary.pending_documents}
              helper={`${compliance.meta.expiring_documents} documento(s) vencendo`}
              icon={AlertCircle}
            />
          </div>

          <div className="employee-profile-panel p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Treinamentos vinculados</h2>
                <p className="text-sm text-muted-foreground">
                  Histórico individual de capacitações com validade e instrutor.
                </p>
              </div>
              <Link
                to="/trainings"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Abrir trilha de treinamentos
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {compliance.training_enrollments.length > 0 ? (
                compliance.training_enrollments.map((enrollment) => {
                  const training = trainingLookupMap.get(enrollment.training_id)
                  return (
                    <div key={enrollment.id} className="employee-profile-row">
                      <div>
                        <p className="font-medium text-foreground">
                          {training?.title ?? 'Treinamento não encontrado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Instrutor: {enrollment.instructor_name}
                        </p>
                      </div>
                      <div className="grid gap-3 text-sm md:min-w-72 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge
                            variant={
                              enrollment.status === 'completed'
                                ? 'success'
                                : 'warning'
                            }
                            appearance="light"
                            className="mt-1"
                          >
                            {enrollment.status === 'completed'
                              ? 'Concluído'
                              : 'Em andamento'}
                          </Badge>
                        </div>
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

          <div className="employee-profile-panel p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Entregas de EPI</h2>
                <p className="text-sm text-muted-foreground">
                  Controle individual de aceites, CA e ciclos de troca.
                </p>
              </div>
              <Link
                to="/medical-certificates"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Abrir saúde e compliance
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {compliance.ppe_deliveries.length > 0 ? (
                compliance.ppe_deliveries.map((delivery) => (
                  <div key={delivery.id} className="employee-profile-row">
                    <div>
                      <p className="font-medium text-foreground">{delivery.item_name}</p>
                      <p className="text-xs text-muted-foreground">CA {delivery.ca_number}</p>
                    </div>
                    <div className="grid gap-3 text-sm md:min-w-72 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Aceite</p>
                        <Badge variant="warning" appearance="light" className="mt-1">
                          Assinado
                        </Badge>
                      </div>
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

          <div className="employee-profile-panel p-5">
            <div>
              <h2 className="text-lg font-semibold">Documentos anexados</h2>
              <p className="text-sm text-muted-foreground">
                Histórico com emissão, validade e vínculo operacional.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {compliance.compliance_documents.length > 0 ? (
                compliance.compliance_documents.map((document) => {
                  const trainingEnrollment = document.training_enrollment_id
                    ? trainingEnrollmentLookup.get(document.training_enrollment_id)
                    : null
                  const ppeDelivery = document.ppe_delivery_id
                    ? ppeDeliveryLookup.get(document.ppe_delivery_id)
                    : null
                  const training = trainingEnrollment
                    ? trainingLookupMap.get(trainingEnrollment.training_id)
                    : null

                  return (
                    <div key={document.id} className="employee-profile-row">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">
                            {document.file_name}
                          </p>
                          <Badge
                            variant={documentTypeMeta[document.document_type].variant}
                            appearance="light"
                          >
                            {documentTypeMeta[document.document_type].label}
                          </Badge>
                          <Badge
                            variant={documentStatusMeta[document.status].variant}
                            appearance="light"
                          >
                            {documentStatusMeta[document.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {document.document_type === 'training_certificate'
                            ? `Treinamento: ${training?.title ?? 'Não vinculado'}`
                            : `EPI: ${ppeDelivery?.item_name ?? 'Não vinculado'}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload em {formatDateTime(document.uploaded_at)} •{' '}
                          {formatBytes(document.file_size_bytes)}
                        </p>
                        {document.notes && (
                          <p className="rounded-xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            {document.notes}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-3 text-sm md:min-w-72 md:grid-cols-2">
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
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum documento anexado para este colaborador.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="employee-profile-panel p-5">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">Contato e elegibilidade</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="employee-profile-info">
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="mt-1 break-all text-sm font-medium">{employee.email}</p>
              </div>
              <div className="employee-profile-info">
                <p className="text-xs text-muted-foreground">Setor</p>
                <p className="mt-1 text-sm font-medium">{employee.environment_name}</p>
              </div>
              <div className="employee-profile-info">
                <p className="text-xs text-muted-foreground">Observação de status</p>
                <p className="mt-1 text-sm font-medium">
                  {employeeStatusMeta[employee.status].description}
                </p>
              </div>
            </div>
          </div>

          <div className="employee-profile-panel p-5">
            <h2 className="text-lg font-semibold">Rastro de compliance</h2>
            <div className="mt-4 space-y-3">
              <div className="employee-profile-info">
                <p className="text-xs text-muted-foreground">Atualização do dossiê</p>
                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(compliance.meta.generated_at)}
                </p>
              </div>
              <div className="employee-profile-info">
                <p className="text-xs text-muted-foreground">Pendências abertas</p>
                <p className="mt-1 text-sm font-medium">
                  {compliance.meta.open_requirements}
                </p>
              </div>
              <div className="employee-profile-info">
                <p className="text-xs text-muted-foreground">Documentos vencendo</p>
                <p className="mt-1 text-sm font-medium">
                  {compliance.meta.expiring_documents}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              Esta tela foi desenhada com tokens de tema e contraste orientado por
              superfície, para sustentar leitura em claro e escuro sem depender de
              laranja claro em fundo branco.
            </p>
          </div>
        </aside>
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Subir documento do colaborador</DialogTitle>
            <DialogDescription>
              Fluxo normalizado para certificado de treinamento ou comprovante de
              entrega de EPI, pronto para acoplar API real com `snake_case`.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <form
              id="employee-profile-upload-form"
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
                          Aceite PDF, JPG ou PNG com até 10 MB. O mock grava
                          metadados normalizados para `compliance_documents`.
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
                      <Badge
                        variant={uploadDraft.file ? 'success' : 'secondary'}
                        appearance="light"
                      >
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
                      onValueChange={(value) =>
                        setUploadDraft((current) => ({
                          ...current,
                          document_type: value as UploadDocumentDraft['document_type'],
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
                        <SelectItem value="training_certificate">
                          Certificado de treinamento
                        </SelectItem>
                        <SelectItem value="ppe_delivery_receipt">
                          Comprovante de entrega de EPI
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-compliance-issued-at">
                      Data de emissão
                    </Label>
                    <Input
                      id="profile-compliance-issued-at"
                      type="date"
                      value={uploadDraft.issued_at}
                      onChange={(event) =>
                        setUploadDraft((current) => ({
                          ...current,
                          issued_at: event.target.value,
                        }))
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
                        onValueChange={(value) =>
                          setUploadDraft((current) => ({
                            ...current,
                            training_id: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o treinamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrainingOptions.map((training) => (
                            <SelectItem key={training.id} value={training.id}>
                              {training.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-compliance-expires-at">
                        Validade
                      </Label>
                      <Input
                        id="profile-compliance-expires-at"
                        type="date"
                        value={uploadDraft.expires_at || normalizedExpiryDate}
                        onChange={(event) =>
                          setUploadDraft((current) => ({
                            ...current,
                            expires_at: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="profile-equipment-name">
                        Equipamento entregue
                      </Label>
                      <Input
                        id="profile-equipment-name"
                        value={uploadDraft.equipment_name}
                        onChange={(event) =>
                          setUploadDraft((current) => ({
                            ...current,
                            equipment_name: event.target.value,
                          }))
                        }
                        placeholder="Ex: luva nitrílica, colete refletivo, avental térmico"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-equipment-ca">CA / referência</Label>
                      <Input
                        id="profile-equipment-ca"
                        value={uploadDraft.ca_number}
                        onChange={(event) =>
                          setUploadDraft((current) => ({
                            ...current,
                            ca_number: event.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="Ex: CA 33458"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="profile-ppe-next-review">
                        Próxima troca / revisão
                      </Label>
                      <Input
                        id="profile-ppe-next-review"
                        type="date"
                        value={uploadDraft.expires_at || normalizedExpiryDate}
                        onChange={(event) =>
                          setUploadDraft((current) => ({
                            ...current,
                            expires_at: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                      Use também este fluxo quando a escola controlar EPI/IPI
                      operacional por recibo individual.
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="profile-compliance-notes">Observações</Label>
                  <Textarea
                    id="profile-compliance-notes"
                    rows={4}
                    value={uploadDraft.notes}
                    onChange={(event) =>
                      setUploadDraft((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
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
                      <p className="mt-1 text-sm font-medium">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {employee.role} • {employee.environment_name}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant={documentTypeMeta[uploadDraft.document_type].variant}
                          appearance="light"
                        >
                          {documentTypeMeta[uploadDraft.document_type].label}
                        </Badge>
                        {(uploadDraft.expires_at || normalizedExpiryDate) && (
                          <Badge variant="outline">
                            Validade{' '}
                            {formatDate(uploadDraft.expires_at || normalizedExpiryDate)}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {documentTypeMeta[uploadDraft.document_type].helper}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">
                        Vínculo operacional
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {uploadDraft.document_type === 'training_certificate'
                          ? selectedTrainingOption?.title || 'Selecione um treinamento'
                          : uploadDraft.equipment_name || 'Informe o equipamento entregue'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        tenant_id {compliance.meta.tenant_id}
                      </p>
                    </div>

                    <div className="rounded-xl border p-4">
                      <p className="text-xs text-muted-foreground">Checklist</p>
                      <div className="mt-3 space-y-2">
                        {uploadChecklist.length > 0 ? (
                          uploadChecklist.map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Badge variant="success" appearance="light">
                                OK
                              </Badge>
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
              form="employee-profile-upload-form"
              variant="primary"
              disabled={!isUploadReady || isUploadingDocument}
            >
              {isUploadingDocument ? 'Registrando...' : 'Registrar documento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
