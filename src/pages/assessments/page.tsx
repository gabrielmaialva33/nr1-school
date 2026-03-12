import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ClipboardCheck, Lightbulb, QrCode, ArrowRight, FileText, AlertTriangle, TrendingUp, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { fetchAssessments, type Assessment } from '@/services/assessments'

const riskMeta: Record<string, { label: string; className: string }> = {
  low: { label: 'Baixo', className: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Médio', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Alto', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-700' },
}

function formatPeriod(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(s)} — ${fmt(e)}`
}

const copsoqQuestions = [
  '1. Com que frequência você se sente emocionalmente esgotado no trabalho?',
  '2. Você tem autonomia para tomar decisões sobre como realizar seu trabalho?',
  '3. Existe apoio adequado por parte da liderança em situações difíceis?',
  '4. Você se sente seguro para reportar problemas no ambiente de trabalho?',
]

const frequencyOptions = ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre']

function ResponseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [selected, setSelected] = useState<Record<number, string>>({})

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Formulário COPSOQ III</DialogTitle>
        </DialogHeader>
        <DialogBody className="max-h-[60vh] space-y-5 overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Copenhagen Psychosocial Questionnaire — avaliação de fatores psicossociais no ambiente de trabalho.
          </p>
          <Separator />
          {copsoqQuestions.map((question, qi) => (
            <div key={qi} className="space-y-3">
              <p className="text-sm font-medium">{question}</p>
              <div className="flex flex-wrap gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected((prev) => ({ ...prev, [qi]: option }))}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                      selected[qi] === option
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {qi < copsoqQuestions.length - 1 && <Separator />}
            </div>
          ))}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.success('Respostas registradas com sucesso!')
              onOpenChange(false)
              setSelected({})
            }}
          >
            Enviar Respostas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QrCodeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code - Link de Acesso</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Escaneie o QR Code abaixo para acessar a pesquisa ou compartilhe o link diretamente.
          </p>
          <div className="mx-auto flex size-48 items-center justify-center rounded-xl border-2 border-dashed bg-muted">
            <QrCode className="size-24 text-muted-foreground" />
          </div>
          <div className="w-full rounded-lg bg-muted/50 px-4 py-2.5 text-center">
            <p className="text-xs text-muted-foreground">Link da pesquisa</p>
            <p className="mt-0.5 text-sm font-medium">https://nr1school.com.br/pesquisa/abc123</p>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              toast.success('Impressão iniciada')
            }}
          >
            Imprimir
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.success('Link copiado para a área de transferência!')
            }}
          >
            Copiar Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResultsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Análise de Resultados</DialogTitle>
        </DialogHeader>
        <DialogBody className="max-h-[60vh] space-y-5 overflow-y-auto">
          <p className="text-sm text-muted-foreground">
            Resumo consolidado da avaliação psicossocial com base nas respostas coletadas.
          </p>
          <Separator />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <TrendingUp className="mx-auto size-5 text-primary" />
              <p className="mt-2 text-2xl font-bold text-primary">7.2</p>
              <p className="text-xs text-muted-foreground">Score Geral</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <Shield className="mx-auto size-5 text-emerald-600" />
              <p className="mt-2 text-2xl font-bold text-emerald-600">82%</p>
              <p className="text-xs text-muted-foreground">Participação</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <AlertTriangle className="mx-auto size-5 text-yellow-600" />
              <p className="mt-2 text-2xl font-bold text-yellow-600">3</p>
              <p className="text-xs text-muted-foreground">Dimensões Críticas</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-center">
              <FileText className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-2 text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Respostas</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Dimensões mais críticas</h4>
            <div className="space-y-2">
              {[
                { name: 'Exigências Emocionais', score: 3.2, level: 'critical' as const },
                { name: 'Ritmo de Trabalho', score: 4.1, level: 'high' as const },
                { name: 'Conflito Trabalho-Família', score: 4.8, level: 'medium' as const },
              ].map((dim) => (
                <div key={dim.name} className="flex items-center justify-between rounded-lg border px-4 py-2.5">
                  <span className="text-sm font-medium">{dim.name}</span>
                  <Badge className={cn('border-0', riskMeta[dim.level].className)}>
                    {dim.score.toFixed(1)} — {riskMeta[dim.level].label}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Recomendações</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Implementar programa de suporte emocional com acompanhamento psicológico periódico.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Revisar distribuição de carga de trabalho nos setores com maior incidência de esgotamento.
              </li>
              <li className="flex gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                Promover ações de flexibilização de horários para mitigar conflito trabalho-família.
              </li>
            </ul>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast.success('Relatório exportado com sucesso!')
            }}
          >
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CampaignCard({ assessment, isActive }: { assessment: Assessment; isActive: boolean }) {
  const risk = riskMeta[assessment.risk_level]
  const [isResponseOpen, setIsResponseOpen] = useState(false)
  const [isQrOpen, setIsQrOpen] = useState(false)

  return (
    <>
      <div className={cn(
        'rounded-xl border-2 p-6 transition-all',
        isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-card',
      )}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{assessment.name}</h3>
          <Badge className={cn('border-0', risk.className)}>{risk.label}</Badge>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Período: {formatPeriod(assessment.period_start, assessment.period_end)}
        </p>
        <p className="text-sm font-medium">
          {assessment.sectors_count} setores | {assessment.responses_count} respostas
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taxa de participação</span>
          <span className={cn(
            'text-2xl font-bold',
            assessment.participation_rate >= 80 ? 'text-emerald-600' : assessment.participation_rate >= 50 ? 'text-yellow-600' : 'text-primary',
          )}>
            {assessment.participation_rate}%
          </span>
        </div>

        <div className="mt-2 h-2 rounded-full bg-muted">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              assessment.participation_rate >= 80 ? 'bg-emerald-500' : assessment.participation_rate >= 50 ? 'bg-yellow-500' : 'bg-primary',
            )}
            style={{ width: `${assessment.participation_rate}%` }}
          />
        </div>

        {isActive && (
          <div className="mt-4 flex gap-2">
            <Button variant="primary" size="sm" className="gap-1.5" onClick={() => setIsResponseOpen(true)}>
              <ClipboardCheck className="size-3.5" />
              Responder
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsQrOpen(true)}>
              <QrCode className="size-3.5" />
              QR Code
            </Button>
          </div>
        )}
      </div>

      <ResponseDialog open={isResponseOpen} onOpenChange={setIsResponseOpen} />
      <QrCodeDialog open={isQrOpen} onOpenChange={setIsQrOpen} />
    </>
  )
}

export function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isResultsOpen, setIsResultsOpen] = useState(false)

  useEffect(() => {
    fetchAssessments()
      .then(setAssessments)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar dados'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const activeCampaign = assessments.find(a => a.status === 'active')
  const orderedAssessments = [...assessments].sort((a, b) => {
    const priority = { active: 0, completed: 1, draft: 2 }
    const byStatus = priority[a.status] - priority[b.status]

    if (byStatus !== 0) return byStatus

    return new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Diagnóstico Psicossocial</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Encontre aqui todas as informações de diagnóstico psicossocial
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {orderedAssessments.map(assessment => (
          <CampaignCard
            key={assessment.id}
            assessment={assessment}
            isActive={assessment.status === 'active'}
          />
        ))}
      </div>

      {activeCampaign && activeCampaign.participation_rate < 80 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
              <Lightbulb className="size-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800">Ação analítica recomendada</h3>
              <p className="mt-1 text-sm text-emerald-700">
                A campanha {activeCampaign.name} permanece em andamento com {activeCampaign.participation_rate}% de participação.
                Priorize os setores abaixo da meta, acompanhe tendência semanal e antecipe focos de risco psicossocial antes do fechamento.
              </p>
              <Button variant="primary" size="sm" className="mt-3 gap-1.5" onClick={() => setIsResultsOpen(true)}>
                Analisar Resultados
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <ResultsDialog open={isResultsOpen} onOpenChange={setIsResultsOpen} />
    </div>
  )
}
