import {
  AlertTriangle,
  ArrowRight,
  BookCheck,
  ClipboardCheck,
  FileHeart,
  FileText,
  GraduationCap,
  ListChecks,
  MessageSquareWarning,
  Target,
  Users,
} from 'lucide-react'
import type { ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface OnboardingModule {
  key: string
  title: string
  objective: string
  route: string
  icon: ElementType
  tone: string
  steps: string[]
}

const modules: OnboardingModule[] = [
  {
    key: 'employees',
    title: 'Funcionários',
    objective: 'Construir o dossiê individual e base para compliance ocupacional.',
    route: '/employees',
    icon: Users,
    tone: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    steps: ['Cadastrar colaborador', 'Vincular setor e função', 'Atualizar status e prontuário'],
  },
  {
    key: 'assessments',
    title: 'Campanhas COPSOQ',
    objective: 'Medir riscos psicossociais com participação e periodicidade.',
    route: '/assessments',
    icon: ClipboardCheck,
    tone: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    steps: ['Planejar período da campanha', 'Coletar respostas', 'Consolidar nível de risco'],
  },
  {
    key: 'risks',
    title: 'Inventário de Riscos',
    objective: 'Transformar resultados em riscos priorizados por ambiente.',
    route: '/risks',
    icon: AlertTriangle,
    tone: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    steps: ['Classificar probabilidade e severidade', 'Definir responsável', 'Selecionar riscos para tratamento'],
  },
  {
    key: 'action-plans',
    title: 'Planos de Ação',
    objective: 'Executar e acompanhar medidas com responsáveis e envolvidos.',
    route: '/action-plans',
    icon: ListChecks,
    tone: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
    steps: ['Definir ação e prazo', 'Adicionar funcionários envolvidos', 'Mover no board até conclusão'],
  },
  {
    key: 'medical-certificates',
    title: 'Atestados Médicos',
    objective: 'Gerenciar afastamentos, CID e nexo com trilha auditável.',
    route: '/medical-certificates',
    icon: FileHeart,
    tone: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    steps: ['Subir atestado', 'Classificar risco e INSS', 'Acompanhar retorno ao trabalho'],
  },
  {
    key: 'trainings',
    title: 'Treinamentos',
    objective: 'Garantir capacitação e certificações obrigatórias por função.',
    route: '/trainings',
    icon: GraduationCap,
    tone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    steps: ['Publicar treinamento', 'Controlar presença', 'Anexar certificado'],
  },
  {
    key: 'complaints',
    title: 'Denúncias',
    objective: 'Tratar ocorrências com rastreabilidade e tempo de resposta.',
    route: '/complaints',
    icon: MessageSquareWarning,
    tone: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    steps: ['Registrar denúncia', 'Atribuir responsável', 'Concluir e registrar evidências'],
  },
  {
    key: 'reports',
    title: 'Relatórios',
    objective: 'Fechar ciclo com indicadores executivos e evidências para auditoria.',
    route: '/reports',
    icon: FileText,
    tone: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    steps: ['Consolidar KPIs', 'Exportar evidências', 'Apresentar plano contínuo'],
  },
]

const orbitAngles = [-90, -45, 0, 45, 90, 135, 180, 225]

function getOrbitPosition(index: number) {
  const angleInRadians = (orbitAngles[index] * Math.PI) / 180
  const radius = 42
  const left = 50 + radius * Math.cos(angleInRadians)
  const top = 50 + radius * Math.sin(angleInRadians)

  return { left: `${left}%`, top: `${top}%` }
}

export function OnboardingPage() {
  return (
    <div className="page-shell space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-border/70 bg-card/90 p-6 shadow-[var(--shadow-soft)] md:p-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(249,115,22,0.14),transparent_35%)]" />
        <div className="relative space-y-4">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-wide uppercase">
            Onboarding operacional NR-1
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Roda de fluxo por objetivo de módulo
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Use este painel para apresentar o caminho lógico da plataforma: iniciar com base de
            colaboradores, diagnosticar riscos, executar ações e fechar o ciclo com evidências.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <section className="surface-card rounded-[28px] border bg-card/90 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Mapa visual dos módulos
            </p>
            <Badge variant="outline" className="rounded-full text-[11px]">
              8 áreas conectadas
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2.5 md:hidden">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <Link
                  key={module.key}
                  to={module.route}
                  className="group flex items-center gap-2 rounded-xl border border-border/70 bg-background/95 px-3 py-2 shadow-[var(--shadow-soft)] transition hover:border-primary/35 hover:bg-primary/5"
                >
                  <div className={cn('inline-flex size-7 items-center justify-center rounded-full', module.tone)}>
                    <Icon className="size-3.5" />
                  </div>
                  <p className="text-xs font-semibold leading-tight text-foreground">{module.title}</p>
                </Link>
              )
            })}
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-[430px] rounded-full border border-dashed border-border/70 bg-muted/10 p-8 md:block">
            <div className="pointer-events-none absolute inset-7 rounded-full border border-border/35" />
            <div className="pointer-events-none absolute inset-[23%] rounded-full border border-border/45 bg-background/65 backdrop-blur-sm" />
            <div className="absolute inset-[31%] flex flex-col items-center justify-center rounded-full border border-border/70 bg-background/95 text-center shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Núcleo
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">NR1 School</p>
              <p className="mt-1 max-w-32 text-xs leading-5 text-muted-foreground">
                Ciclo contínuo de prevenção
              </p>
            </div>

            {modules.map((module, index) => {
              const Icon = module.icon
              const position = getOrbitPosition(index)

              return (
                <Link
                  key={module.key}
                  to={module.route}
                  style={position}
                  className="absolute flex w-[118px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-2xl border border-border/70 bg-background/95 px-2 py-2 text-center shadow-[var(--shadow-soft)] transition hover:-translate-y-[52%] hover:border-primary/35 hover:bg-primary/5 hover:shadow-[var(--shadow-hover)]"
                >
                  <div className={cn('inline-flex size-8 items-center justify-center rounded-full', module.tone)}>
                    <Icon className="size-4" />
                  </div>
                  <p className="text-[11px] font-semibold leading-tight text-foreground">{module.title}</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <div key={module.key} className="surface-card rounded-2xl border bg-card/90 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={cn('inline-flex size-8 items-center justify-center rounded-xl', module.tone)}>
                        <Icon className="size-4" />
                      </div>
                      <h2 className="text-sm font-semibold text-foreground">{module.title}</h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{module.objective}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-2 self-start md:self-center">
                    <Link to={module.route}>
                      Abrir módulo
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {module.steps.map((step, index) => (
                    <div key={step} className="rounded-xl border border-border/70 bg-muted/25 px-3 py-2">
                      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                        Etapa {index + 1}
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <section className="surface-card rounded-2xl border bg-card/90 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Objetivo macro
            </p>
            <p className="mt-1 text-sm text-foreground">
              Diagnosticar → priorizar → agir → evidenciar com rastreabilidade ponta a ponta.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
            <Target className="size-3.5" />
            <BookCheck className="size-3.5" />
            Integração do colaborador
          </div>
        </div>
      </section>
    </div>
  )
}
