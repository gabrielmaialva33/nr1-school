import { toast } from 'sonner'
import {
  Activity,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  MoreVertical,
  Share2,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface GeneratedReport {
  id: string
  name: string
  type: string
  created_at: string
  created_by: string
  status: 'completed' | 'generating'
}

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
    name: 'COPSOQ_Diagnóstico_Geral_Q1.xlsx',
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
    name: 'Relatório_Canal_Denúncias_2025.pdf',
    type: 'Denúncias',
    created_at: '2026-02-28T16:20:00Z',
    created_by: 'Ana Carolina Mendes',
    status: 'completed',
  },
  {
    id: '5',
    name: 'PGR_Escola_Municipal_Santos_Dumont_2026.pdf',
    type: 'PGR',
    created_at: '2026-02-15T10:00:00Z',
    created_by: 'Carlos Silva',
    status: 'completed',
  },
  {
    id: '6',
    name: 'COPSOQ_Diagnóstico_Setor_Administrativo.xlsx',
    type: 'COPSOQ',
    created_at: '2026-02-10T11:30:00Z',
    created_by: 'Maria Fernanda Costa',
    status: 'completed',
  },
  {
    id: '7',
    name: 'Indicadores_Atestados_Jan2026.pdf',
    type: 'Indicadores',
    created_at: '2026-02-05T09:00:00Z',
    created_by: 'Ana Carolina Mendes',
    status: 'completed',
  },
  {
    id: '8',
    name: 'Relatório_Treinamentos_Q4_2025.pdf',
    type: 'Treinamentos',
    created_at: '2026-01-20T14:00:00Z',
    created_by: 'Carlos Silva',
    status: 'completed',
  },
  {
    id: '9',
    name: 'PGR_Consolidado_Rede_Municipal_2025.pdf',
    type: 'PGR',
    created_at: '2026-01-10T08:30:00Z',
    created_by: 'Maria Fernanda Costa',
    status: 'completed',
  },
  {
    id: '10',
    name: 'Indicadores_Riscos_Psicossociais_Dez2025.pdf',
    type: 'Indicadores',
    created_at: '2025-12-20T16:45:00Z',
    created_by: 'Ana Carolina Mendes',
    status: 'completed',
  },
]

function handleDownload(reportName: string) {
  const loadingId = toast.loading(`Gerando ${reportName}...`)
  setTimeout(() => {
    toast.dismiss(loadingId)
    toast.success(`${reportName} gerado com sucesso! Download iniciado.`)
  }, 1500)
}

export function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gere e exporte relatórios consolidados sobre riscos, diagnósticos e
          indicadores de saúde.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FileText className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium tracking-tight">PGR</h3>
            <p className="mb-6 flex-1 text-sm text-muted-foreground">
              Gerar relatório completo do PGR para a escola selecionada.
            </p>
            <Button
              variant="solid"
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleDownload('Relatório PGR')}
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Activity className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium tracking-tight">
              Relatório COPSOQ
            </h3>
            <p className="mb-6 flex-1 text-sm text-muted-foreground">
              Exportar resultados do diagnóstico psicossocial.
            </p>
            <Button
              variant="solid"
              className="w-full bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => handleDownload('Relatório COPSOQ')}
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col p-6">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BarChart3 className="size-6" />
            </div>
            <h3 className="mb-2 text-lg font-medium tracking-tight">
              Indicadores de Saúde
            </h3>
            <p className="mb-6 flex-1 text-sm text-muted-foreground">
              Dashboard de atestados, afastamentos e tendências.
            </p>
            <Button
              variant="solid"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => handleDownload('Relatório de Indicadores')}
            >
              Gerar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell w-12 text-center">#</TableHead>
                <TableHead>Relatório</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Gerado em</TableHead>
                <TableHead className="hidden md:table-cell">Gerado por</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsData.map((report, index) => (
                <TableRow key={report.id}>
                  <TableCell className="hidden md:table-cell text-center font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">{report.name}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(report.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{report.created_by}</TableCell>
                  <TableCell>
                    {report.status === 'completed' ? (
                      <Badge className="border-0 bg-green-100 text-green-700">
                        Concluído
                      </Badge>
                    ) : (
                      <Badge className="border-0 bg-yellow-100 text-yellow-700">
                        Em Geração
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            disabled={report.status !== 'completed'}
                            onClick={() => toast.success('Download do relatório iniciado')}
                          >
                            <Download className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Baixar relatório</TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Mais opções</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success('Download do PDF iniciado')}>
                            <FileText className="size-4" />
                            Baixar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success('Download do Excel iniciado')}>
                            <FileSpreadsheet className="size-4" />
                            Baixar Excel
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
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
