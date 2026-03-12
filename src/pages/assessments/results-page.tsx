import { FileText, AlertTriangle, TrendingUp, Shield, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const criticalDimensions = [
  { name: 'Exigências Emocionais', score: '3.2', tone: 'bg-red-100 text-red-700', label: 'Crítico' },
  { name: 'Ritmo de Trabalho', score: '4.1', tone: 'bg-orange-100 text-orange-700', label: 'Alto' },
  { name: 'Conflito Trabalho-Família', score: '4.8', tone: 'bg-yellow-100 text-yellow-700', label: 'Médio' },
]

const recommendations = [
  'Implementar programa de suporte emocional com acompanhamento psicológico periódico.',
  'Revisar distribuição de carga de trabalho nos setores com maior incidência de esgotamento.',
  'Promover ações de flexibilização de horários para mitigar conflito trabalho-família.',
]

export function AssessmentResultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Resultado COPSOQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumo consolidado da avaliação psicossocial com base nas respostas coletadas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/assessments">
              <ArrowLeft className="size-3.5" />
              Voltar para campanhas
            </Link>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success('Relatório exportado com sucesso!')}
          >
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 text-center">
            <TrendingUp className="mx-auto size-5 text-primary" />
            <p className="mt-2 text-2xl font-bold text-primary">7.2</p>
            <p className="text-xs text-muted-foreground">Score Geral</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <Shield className="mx-auto size-5 text-emerald-600" />
            <p className="mt-2 text-2xl font-bold text-emerald-600">82%</p>
            <p className="text-xs text-muted-foreground">Participação</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <AlertTriangle className="mx-auto size-5 text-yellow-600" />
            <p className="mt-2 text-2xl font-bold text-yellow-600">3</p>
            <p className="text-xs text-muted-foreground">Dimensões Críticas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <FileText className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-2xl font-bold">156</p>
            <p className="text-xs text-muted-foreground">Respostas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dimensões mais críticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalDimensions.map((dimension) => (
              <div
                key={dimension.name}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{dimension.name}</p>
                  <p className="text-xs text-muted-foreground">Necessita plano de mitigação prioritário</p>
                </div>
                <Badge className={dimension.tone}>
                  {dimension.score} - {dimension.label}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((recommendation) => (
              <div key={recommendation} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{recommendation}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
