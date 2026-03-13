import type { Dispatch, ElementType, SetStateAction } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountingNumber } from '@/components/ui/counting-number'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { Complaint } from '@/services/complaints'
import {
  complaintCategoryOptions,
  complaintStatusMeta,
  getComplaintCategoryLabel,
  getComplaintPriority,
  type ComplaintCreateDraft,
} from './helpers'

export function ComplaintStatCard({
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

export function ComplaintDetailSheet({
  complaint,
  onOpenChange,
}: {
  complaint: Complaint | null
  onOpenChange: (open: boolean) => void
}) {
  if (!complaint) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto" />
      </Sheet>
    )
  }

  const priority = getComplaintPriority(complaint.category)
  const status = complaintStatusMeta[complaint.status]

  return (
    <Sheet open={!!complaint} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{complaint.protocol_number}</SheetTitle>
            <SheetDescription>
              Detalhes da denúncia, contexto da apuração e ações operacionais vinculadas ao caso.
            </SheetDescription>
          </SheetHeader>
        <Separator />
        <SheetBody className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Categoria</p>
              <p className="text-sm font-medium">{getComplaintCategoryLabel(complaint.category)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <Badge className={cn('border-0', status.className)}>{status.label}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Prioridade</p>
              <Badge className={cn('border-0', priority.className)}>{priority.label}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Anônima</p>
              <p className="text-sm font-medium">{complaint.is_anonymous ? 'Sim' : 'Não'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Setor Reportado</p>
              <p className="text-sm font-medium">{complaint.sector_reported}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Responsável</p>
              <p className="text-sm font-medium">{complaint.assigned_to}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Descrição</p>
            <p className="text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {complaint.resolution_description && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Resolução</p>
              <p className="text-sm leading-relaxed">{complaint.resolution_description}</p>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Data de Criação</p>
            <p className="text-sm font-medium">
              {new Date(complaint.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => toast.success('Status alterado com sucesso.')}>
              Alterar Status
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => toast.success('Relatório enviado para impressão.')}
            >
              Imprimir
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

export function ComplaintCreateDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: ComplaintCreateDraft
  setForm: Dispatch<SetStateAction<ComplaintCreateDraft>>
  onSubmit: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Denúncia</DialogTitle>
          <DialogDescription>
            Registre o caso com contexto suficiente para triagem, investigação e rastreabilidade.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complaint-category">Categoria</Label>
            <Select value={form.category} onValueChange={value => setForm(current => ({ ...current, category: value }))}>
              <SelectTrigger id="complaint-category">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {complaintCategoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-sector">Setor Reportado</Label>
            <Input
              id="complaint-sector"
              value={form.sector_reported}
              onChange={event => setForm(current => ({ ...current, sector_reported: event.target.value }))}
              placeholder="Ex: Administração, Sala 5..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint-description">Descrição</Label>
            <Textarea
              id="complaint-description"
              value={form.description}
              onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
              placeholder="Descreva a denúncia com o máximo de detalhes..."
              rows={5}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="complaint-anonymous"
              checked={form.is_anonymous}
              onCheckedChange={checked => setForm(current => ({ ...current, is_anonymous: checked }))}
            />
            <Label htmlFor="complaint-anonymous" className="cursor-pointer">
              Denúncia anônima?
            </Label>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Registrar denuncia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
