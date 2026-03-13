import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Activity,
  BarChart3,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Funnel,
  MoreVertical,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card'
import { Input, InputGroup, InputWrapper } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTimePtBr } from '@/lib/formatters'

interface ReportTemplate {
  id: string
  title: string
  description: string
  icon: typeof FileText
  theme: string
  output: string
}

interface GeneratedReport {
  id: string
  name: string
  type: 'PGR' | 'COPSOQ' | 'Indicadores' | 'Denuncias' | 'Treinamentos'
  created_at: string
  created_by: string
  status: 'completed' | 'generating'
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'pgr',
    title: 'PGR consolidado',
    description: 'Resumo completo do Programa de Gerenciamento de Riscos da unidade.',
    icon: FileText,
    theme: 'from-primary/20 via-primary/5 to-transparent',
    output: 'PDF',
  },
  {
    id: 'copsoq',
    title: 'Diagnostico COPSOQ',
    description: 'Exporta score geral, dimensoes criticas e comparativo entre setores.',
    icon: Activity,
    theme: 'from-warning/20 via-warning/5 to-transparent',
    output: 'XLSX',
  },
  {
    id: 'indicators',
    title: 'Indicadores de saude',
    description: 'Atestados, afastamentos, reincidencias e tendencia mensal.',
    icon: BarChart3,
    theme: 'from-info/20 via-info/5 to-transparent',
    output: 'PDF',
  },
]

const reportsData: GeneratedReport[] = [
  {
    id: '1',
    name: 'PGR_Escola_Estadual_Prof_Maria_Helena_2026.pdf',
    type: 'PGR',
    created_at: '2026-03-10T14:30:00Z',
    created_by: 'Ana Carolina Mendes',
    status: 'completed',
  },
  {
    id: '2',
    name: 'COPSOQ_Diagnostico_Geral_Q1.xlsx',
    type: 'COPSOQ',
    created_at: '2026-03-11T09:15:00Z',
    created_by: 'Carlos Silva',
    status: 'completed',
  },
  {
    id: '3',
    name: 'Indicadores_Afastamentos_Fev2026.pdf',
    type: 'Indicadores',
    created_at: '2026-03-12T08:45:00Z',
    created_by: 'Ana Carolina Mendes',
    status: 'generating',
  },
  {
    id: '4',
    name: 'Relatorio_Canal_Denuncias_2025.pdf',
    type: 'Denuncias',
    created_at: '2026-02-28T16:20:00Z',
    created_by: 'Ana Carolina Mendes',
    status: 'completed',
  },
  {
    id: '5',
    name: 'Relatorio_Treinamentos_Q4_2025.pdf',
    type: 'Treinamentos',
    created_at: '2026-01-20T14:00:00Z',
    created_by: 'Carlos Silva',
    status: 'completed',
  },
]

function reportTypeBadgeVariant(type: GeneratedReport['type']) {
  if (type === 'PGR') return 'primary'
  if (type === 'COPSOQ') return 'warning'
  if (type === 'Indicadores') return 'info'
  return 'secondary'
}

export function ReportsPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | GeneratedReport['type']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | GeneratedReport['status']>('all')

  const filteredReports = useMemo(() => {
    return reportsData.filter((report) => {
      const normalizedQuery = query.trim().toLowerCase()
      const matchesQuery =
        normalizedQuery === '' ||
        report.name.toLowerCase().includes(normalizedQuery) ||
        report.created_by.toLowerCase().includes(normalizedQuery) ||
        report.type.toLowerCase().includes(normalizedQuery)
      const matchesType = typeFilter === 'all' || report.type === typeFilter
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter

      return matchesQuery && matchesType && matchesStatus
    })
  }, [query, statusFilter, typeFilter])

  const reportsThisMonth = useMemo(() => {
    const now = new Date()
    return reportsData.filter((report) => {
      const createdAt = new Date(report.created_at)
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length
  }, [])

  function handleGenerateReport(template: ReportTemplate) {
    const loadingId = toast.loading(`Gerando ${template.title.toLowerCase()}...`)
    setTimeout(() => {
      toast.dismiss(loadingId)
      toast.success(`${template.title} pronto para download (${template.output})`)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-background via-background to-muted/45 p-6 shadow-xs shadow-black/5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="primary" appearance="light" className="gap-1.5">
              <Sparkles className="size-3.5" />
              Centro de relatorios
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Relatorios de compliance</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gere evidencias auditaveis em PDF/XLSX por tenant, com foco em NR-1 e saude ocupacional.
              </p>
            </div>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
            <div className="rounded-xl border border-border/80 bg-card/95 p-4">
              <p className="text-xs text-muted-foreground">Total gerados</p>
              <p className="mt-1 text-2xl font-semibold">{reportsData.length}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card/95 p-4">
              <p className="text-xs text-muted-foreground">Este mes</p>
              <p className="mt-1 text-2xl font-semibold">{reportsThisMonth}</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-card/95 p-4">
              <p className="text-xs text-muted-foreground">Em geracao</p>
              <p className="mt-1 text-2xl font-semibold">
                {reportsData.filter((report) => report.status === 'generating').length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {reportTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${template.theme} p-5`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{template.title}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-background/80">
                    <template.icon className="size-5" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <Badge variant="outline">{template.output}</Badge>
                <Button variant="primary" size="sm" onClick={() => handleGenerateReport(template)}>
                  Gerar agora
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Historico de relatorios</CardTitle>
          <CardToolbar className="w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <InputGroup className="w-full lg:max-w-md">
              <InputWrapper variant="lg">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  variant="lg"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nome, tipo ou responsavel"
                />
              </InputWrapper>
            </InputGroup>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
                <SelectTrigger size="lg" className="min-w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="PGR">PGR</SelectItem>
                  <SelectItem value="COPSOQ">COPSOQ</SelectItem>
                  <SelectItem value="Indicadores">Indicadores</SelectItem>
                  <SelectItem value="Denuncias">Denuncias</SelectItem>
                  <SelectItem value="Treinamentos">Treinamentos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger size="lg" className="min-w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Concluido</SelectItem>
                  <SelectItem value="generating">Em geracao</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="lg" className="gap-1.5">
                <Funnel className="size-4" />
                Filtros
              </Button>
            </div>
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relatorio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Gerado em</TableHead>
                  <TableHead className="hidden md:table-cell">Responsavel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Nenhum relatorio encontrado para os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>
                        <Badge variant={reportTypeBadgeVariant(report.type)} appearance="light">
                          {report.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{formatDateTimePtBr(report.created_at)}</TableCell>
                      <TableCell className="hidden md:table-cell">{report.created_by}</TableCell>
                      <TableCell>
                        {report.status === 'completed' ? (
                          <Badge variant="success" appearance="light" className="gap-1.5">
                            <FileCheck2 className="size-3.5" />
                            Concluido
                          </Badge>
                        ) : (
                          <Badge variant="warning" appearance="light">
                            Em geracao
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={report.status !== 'completed'}
                                onClick={() => toast.success('Download iniciado')}
                              >
                                <Download className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download</TooltipContent>
                          </Tooltip>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.success('Download PDF iniciado')}>
                                <FileText className="size-4" />
                                Baixar PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('Download XLSX iniciado')}>
                                <FileSpreadsheet className="size-4" />
                                Baixar XLSX
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success('Link de compartilhamento copiado')}>
                                <Share2 className="size-4" />
                                Compartilhar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

