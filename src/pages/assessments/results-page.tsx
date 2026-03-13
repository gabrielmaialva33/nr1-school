import { ArrowLeft, CheckCircle2, FileDown, ShieldAlert, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CriticalDimension {
  name: string
  score: number
  severity: 'critical' | 'high' | 'medium'
  recommendation: string
}

interface ActionPlanMilestone {
  id: string
  title: string
  owner: string
  due_date: string
  status: 'planned' | 'in_progress' | 'done'
}

const criticalDimensions: CriticalDimension[] = [
  {
    name: 'Exigencias emocionais',
    score: 4.7,
    severity: 'critical',
    recommendation: 'Criar protocolo de acolhimento psicologico para incidentes criticos.',
  },
  {
    name: 'Ritmo de trabalho',
    score: 4.3,
    severity: 'high',
    recommendation: 'Rebalancear carga semanal entre secretaria, coordenacao e sala de aula.',
  },
  {
    name: 'Conflito trabalho-familia',
    score: 3.8,
    severity: 'medium',
    recommendation: 'Pilotar escala flexivel em setores com maior indice de estresse.',
  },
]

const actionPlanMilestones: ActionPlanMilestone[] = [
  {
    id: 'm-1',
    title: 'Workshop de saude mental para liderancas',
    owner: 'RH + Psicologia Escolar',
    due_date: '2026-04-08',
    status: 'planned',
  },
  {
    id: 'm-2',
    title: 'Revisao do quadro de pausas por setor',
    owner: 'Seguranca do Trabalho',
    due_date: '2026-04-16',
    status: 'in_progress',
  },
  {
    id: 'm-3',
    title: 'Canal sigiloso de acolhimento ativo',
    owner: 'Compliance',
    due_date: '2026-03-28',
    status: 'done',
  },
]

function severityMeta(severity: CriticalDimension['severity']) {
  if (severity === 'critical') return { label: 'Critico', variant: 'destructive' as const }
  if (severity === 'high') return { label: 'Alto', variant: 'warning' as const }
  return { label: 'Medio', variant: 'info' as const }
}

function milestoneMeta(status: ActionPlanMilestone['status']) {
  if (status === 'done') return { label: 'Concluido', variant: 'success' as const }
  if (status === 'in_progress') return { label: 'Em andamento', variant: 'warning' as const }
  return { label: 'Planejado', variant: 'secondary' as const }
}

export function AssessmentResultsPage() {
  const maxScore = 5

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-background via-background to-muted/45 p-6 shadow-xs shadow-black/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="warning" appearance="light" className="gap-1.5">
              <ShieldAlert className="size-3.5" />
              Resultado consolidado COPSOQ
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Campanha Mar/2026</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Diagnostico psicossocial consolidado da unidade com foco em priorizacao de riscos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">tenant_id ativo</Badge>
              <Badge variant="info" appearance="light">156 respostas validas</Badge>
              <Badge variant="success" appearance="light">82% participacao</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/assessments">
                <ArrowLeft className="size-3.5" />
                Voltar para campanhas
              </Link>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => toast.success('Relatorio COPSOQ exportado em PDF')}
            >
              <FileDown className="size-3.5" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Score geral de risco</p>
            <p className="mt-2 text-3xl font-semibold">7.2</p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-xs text-warning">
              <TrendingUp className="size-3.5" />
              +0.8 vs campanha anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Participacao</p>
            <p className="mt-2 text-3xl font-semibold">82%</p>
            <p className="mt-3 text-xs text-muted-foreground">Meta minima para auditoria interna: 75%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Dimensoes criticas</p>
            <p className="mt-2 text-3xl font-semibold">3</p>
            <p className="mt-3 text-xs text-muted-foreground">2 ja com plano definido e 1 em negociacao</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Setores respondentes</p>
            <p className="mt-2 text-3xl font-semibold">11</p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              Cobertura da unidade completa
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dimensoes prioritarias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalDimensions.map((dimension) => {
              const scorePercent = Math.min((dimension.score / maxScore) * 100, 100)
              const severity = severityMeta(dimension.severity)

              return (
                <div key={dimension.name} className="space-y-2 rounded-xl border border-border/80 bg-card/95 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{dimension.name}</p>
                    <Badge variant={severity.variant} appearance="light">
                      {dimension.score.toFixed(1)} / {maxScore} - {severity.label}
                    </Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{dimension.recommendation}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roadmap de mitigacao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {actionPlanMilestones.map((milestone) => {
              const status = milestoneMeta(milestone.status)

              return (
                <div key={milestone.id} className="rounded-xl border border-border/80 bg-card/95 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium">{milestone.title}</p>
                    <Badge variant={status.variant} appearance="light">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Responsavel: {milestone.owner}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Prazo: {milestone.due_date}</p>
                </div>
              )
            })}

            <Button
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => toast.success('Plano de acao sincronizado com Gestao de Riscos')}
            >
              <CheckCircle2 className="size-4" />
              Sincronizar com planos de acao
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

