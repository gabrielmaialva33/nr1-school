import type { ChangeEvent, Dispatch, ElementType, FormEvent, RefObject, SetStateAction } from 'react'
import { AlertCircle, Brain, Check, HeartPulse, Printer, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatDatePtBr, formatOptionalFileSize, getNameInitials } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { CountingNumber } from '@/components/ui/counting-number'
import type { EmployeeOption, MedicalCertificate } from '@/services/medical-certificates'
import {
  createEmptyUploadDraft,
  employeeStatusMeta,
  nexusRiskMeta,
  type UploadDraft,
} from './helpers'

export function MedicalCertificateStatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = 'primary',
}: {
  title: string
  value: number | string
  helper: string
  icon: ElementType
  tone?: 'primary' | 'destructive' | 'info' | 'success' | 'warning'
}) {
  const tones = {
    primary: { iconWrap: 'bg-primary/10 text-primary', value: 'text-primary' },
    destructive: { iconWrap: 'bg-destructive/10 text-destructive', value: 'text-destructive' },
    info: { iconWrap: 'bg-info/10 text-info', value: 'text-info' },
    success: { iconWrap: 'bg-success/10 text-success', value: 'text-success' },
    warning: { iconWrap: 'bg-orange-500/10 text-orange-500', value: 'text-orange-500' },
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

export function MedicalCertificateDetailSheet({
  certificate,
  onOpenChange,
}: {
  certificate: MedicalCertificate | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={!!certificate} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:w-[540px]">
        {certificate && (
          <>
            <SheetHeader className="border-b pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <SheetTitle className="text-lg leading-tight">{certificate.employee_name}</SheetTitle>
                  <SheetDescription>
                    Detalhes clínicos e ocupacionais do atestado, com foco em rastreabilidade e retorno ao trabalho.
                  </SheetDescription>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Atestado registrado em {formatDatePtBr(certificate.created_at)}
                  </p>
                </div>
                <Badge className={cn('shrink-0 border-0', nexusRiskMeta[certificate.nexus_risk]?.className)}>
                  Nexo: {nexusRiskMeta[certificate.nexus_risk]?.label}
                </Badge>
              </div>
            </SheetHeader>

            <SheetBody className="mt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Código CID</p>
                  <p className="text-sm font-medium">{certificate.icd_code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Saúde Mental</p>
                  <div>
                    {certificate.is_mental_health ? (
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
                  <p className="text-sm font-medium">{formatDatePtBr(certificate.issue_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Data de Retorno</p>
                  <p className="text-sm font-medium">{formatDatePtBr(certificate.return_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Dias de Afastamento</p>
                  <p className="text-sm font-medium">{certificate.days_off} dias</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Encaminhamento INSS</p>
                  <div>
                    {certificate.inss_referral ? (
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
                <p className="text-sm font-medium">{certificate.doctor_name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Risco de Nexo</p>
                <Badge className={cn('border-0', nexusRiskMeta[certificate.nexus_risk]?.className)}>
                  {nexusRiskMeta[certificate.nexus_risk]?.label}
                </Badge>
              </div>

              <Separator />

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="primary"
                  className="w-full gap-2"
                  onClick={() => {
                    toast.success(`Atestado de ${certificate.employee_name} aprovado`)
                    onOpenChange(false)
                  }}
                >
                  <Check className="size-4" />
                  Aprovar
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => {
                    toast.success(`Atestado de ${certificate.employee_name} recusado`)
                    onOpenChange(false)
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
  )
}

export function MedicalCertificateUploadDialog({
  open,
  onOpenChange,
  uploadDraft,
  setUploadDraft,
  employeeOptions,
  selectedUploadEmployee,
  uploadAlerts,
  isUploadReady,
  fileInputRef,
  onUploadFileChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadDraft: UploadDraft
  setUploadDraft: Dispatch<SetStateAction<UploadDraft>>
  employeeOptions: EmployeeOption[]
  selectedUploadEmployee: EmployeeOption | undefined
  uploadAlerts: string[]
  isUploadReady: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onUploadFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onSubmit={onSubmit}
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
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.value = ''
                          setUploadDraft((current) => ({ ...current, file: null }))
                        }}
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
                  onChange={onUploadFileChange}
                />

                <div className="mt-4 rounded-xl border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {uploadDraft.file?.name || 'Nenhum arquivo selecionado'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatOptionalFileSize(uploadDraft.file)}</p>
                    </div>
                    <Badge variant={uploadDraft.file ? 'success' : 'secondary'} appearance="light">
                      {uploadDraft.file ? 'Arquivo pronto' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" appearance="light">PDF, JPG ou PNG</Badge>
                    <Badge variant="secondary" appearance="light">Até 10 MB</Badge>
                    <Badge variant={selectedUploadEmployee ? 'success' : 'secondary'} appearance="light">
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
                    onValueChange={(value) => {
                      setUploadDraft((current) => ({ ...current, employee_id: value }))
                    }}
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
                    onChange={(event) => {
                      setUploadDraft((current) => ({
                        ...current,
                        doctor_name: event.target.value,
                      }))
                    }}
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
                    onChange={(event) => {
                      setUploadDraft((current) => ({
                        ...current,
                        issue_date: event.target.value,
                      }))
                    }}
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
                    onChange={(event) => {
                      setUploadDraft((current) => ({
                        ...current,
                        days_off: event.target.value,
                      }))
                    }}
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
                    onChange={(event) => {
                      setUploadDraft((current) => ({
                        ...current,
                        return_date: event.target.value,
                      }))
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-cid">CID</Label>
                  <Input
                    id="cert-cid"
                    value={uploadDraft.icd_code}
                    onChange={(event) => {
                      setUploadDraft((current) => ({
                        ...current,
                        icd_code: event.target.value.toUpperCase(),
                      }))
                    }}
                    placeholder="Ex: F32.1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risco de nexo</Label>
                  <Select
                    value={uploadDraft.nexus_risk}
                    onValueChange={(value: UploadDraft['nexus_risk']) => {
                      setUploadDraft((current) => ({
                        ...current,
                        nexus_risk: value,
                      }))
                    }}
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
                    onCheckedChange={(checked) => {
                      setUploadDraft((current) => ({
                        ...current,
                        is_mental_health: Boolean(checked),
                      }))
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">Relaciona-se à saúde mental</p>
                    <p className="text-xs text-muted-foreground">
                      Use para CID do grupo F ou casos com impacto psicossocial.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3">
                  <Checkbox
                    checked={uploadDraft.inss_referral}
                    onCheckedChange={(checked) => {
                      setUploadDraft((current) => ({
                        ...current,
                        inss_referral: Boolean(checked),
                      }))
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">Encaminhamento ao INSS</p>
                    <p className="text-xs text-muted-foreground">
                      Marque quando o caso exigir fluxo previdenciário.
                    </p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert-notes">Observações</Label>
                <Textarea
                  id="cert-notes"
                  value={uploadDraft.notes}
                  onChange={(event) => {
                    setUploadDraft((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }}
                  placeholder="Ex.: colaborador relatou agravamento após episódio crítico no setor."
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm">Resumo do registro</CardTitle>
                </CardHeader>
                <CardFooter className="block space-y-4">
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
                        {uploadDraft.return_date ? formatDatePtBr(uploadDraft.return_date) : 'A definir'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-xs text-muted-foreground">Classificação inicial</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className={cn('border-0', nexusRiskMeta[uploadDraft.nexus_risk].className)}>
                        Nexo {nexusRiskMeta[uploadDraft.nexus_risk].label}
                      </Badge>
                      <Badge variant={uploadDraft.is_mental_health ? 'destructive' : 'secondary'} appearance="light">
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
                            uploadDraft.doctor_name.trim() &&
                            uploadDraft.issue_date &&
                            uploadDraft.icd_code.trim()
                              ? 'success'
                              : 'secondary'
                          }
                          appearance="light"
                        >
                          {uploadDraft.doctor_name.trim() &&
                          uploadDraft.issue_date &&
                          uploadDraft.icd_code.trim()
                            ? 'OK'
                            : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setUploadDraft(createEmptyUploadDraft())
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="upload-certificate-form"
            variant="primary"
            disabled={!isUploadReady}
          >
            Registrar Atestado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MedicalCertificateAlertBadges({
  certificate,
  hasMultiple,
}: {
  certificate: MedicalCertificate
  hasMultiple: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {certificate.nexus_risk === 'high' && (
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
  )
}

export function MedicalCertificateMentalHealthBadge({
  isMentalHealth,
}: {
  isMentalHealth: boolean
}) {
  return isMentalHealth ? (
    <Badge variant="destructive" appearance="light">
      <Brain className="mr-1 size-3" />
      Sim
    </Badge>
  ) : (
    <Badge variant="secondary" appearance="light">Não</Badge>
  )
}

export function MedicalCertificateHeaderIcon({
  name,
}: {
  name: string
}) {
  return (
    <Avatar className="size-8">
      <AvatarFallback className="text-[10px]">
        {getNameInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
