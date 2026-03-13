import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  FileHeart,
  FileText,
  GraduationCap,
  ListChecks,
  MessageSquareWarning,
  Rocket,
  Users,
} from 'lucide-react'
import { useState, type ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

interface OnboardingModule {
  key: string
  title: string
  subtitle: string
  objective: string
  route: string
  icon: ElementType
  tone: string
  toneBg: string
  steps: string[]
}

const modules: OnboardingModule[] = [
  {
    key: 'employees',
    title: 'Funcionários',
    subtitle: 'Base de colaboradores',
    objective: 'Cadastre os colaboradores da unidade, vincule setores e funções, e mantenha o dossiê atualizado.',
    route: '/employees',
    icon: Users,
    tone: 'text-sky-700 dark:text-sky-300',
    toneBg: 'bg-sky-500/10',
    steps: ['Cadastrar colaborador', 'Vincular setor e função', 'Atualizar status e prontuário'],
  },
  {
    key: 'assessments',
    title: 'Campanhas COPSOQ',
    subtitle: 'Diagnóstico psicossocial',
    objective: 'Configure a campanha de avaliação, colete respostas dos colaboradores e consolide os resultados.',
    route: '/assessments',
    icon: ClipboardCheck,
    tone: 'text-indigo-700 dark:text-indigo-300',
    toneBg: 'bg-indigo-500/10',
    steps: ['Planejar período da campanha', 'Coletar respostas', 'Consolidar nível de risco'],
  },
  {
    key: 'risks',
    title: 'Inventário de Riscos',
    subtitle: 'Mapeamento e priorização',
    objective: 'Classifique cada risco por probabilidade e severidade, defina responsáveis e priorize o tratamento.',
    route: '/risks',
    icon: AlertTriangle,
    tone: 'text-orange-700 dark:text-orange-300',
    toneBg: 'bg-orange-500/10',
    steps: ['Classificar probabilidade e severidade', 'Definir responsável', 'Selecionar riscos para tratamento'],
  },
  {
    key: 'action-plans',
    title: 'Planos de Ação',
    subtitle: 'Execução e acompanhamento',
    objective: 'Crie ações corretivas com prazos, atribua responsáveis e acompanhe a evolução no kanban.',
    route: '/action-plans',
    icon: ListChecks,
    tone: 'text-cyan-700 dark:text-cyan-300',
    toneBg: 'bg-cyan-500/10',
    steps: ['Definir ação e prazo', 'Adicionar funcionários envolvidos', 'Mover no board até conclusão'],
  },
  {
    key: 'medical-certificates',
    title: 'Atestados Médicos',
    subtitle: 'Gestão de afastamentos',
    objective: 'Registre atestados, classifique por CID e acompanhe afastamentos e retornos ao trabalho.',
    route: '/medical-certificates',
    icon: FileHeart,
    tone: 'text-rose-700 dark:text-rose-300',
    toneBg: 'bg-rose-500/10',
    steps: ['Subir atestado', 'Classificar risco e INSS', 'Acompanhar retorno ao trabalho'],
  },
  {
    key: 'trainings',
    title: 'Treinamentos',
    subtitle: 'Capacitação obrigatória',
    objective: 'Publique treinamentos, controle presença e armazene certificados no dossiê do colaborador.',
    route: '/trainings',
    icon: GraduationCap,
    tone: 'text-emerald-700 dark:text-emerald-300',
    toneBg: 'bg-emerald-500/10',
    steps: ['Publicar treinamento', 'Controlar presença', 'Anexar certificado'],
  },
  {
    key: 'complaints',
    title: 'Denúncias',
    subtitle: 'Canal de ocorrências',
    objective: 'Receba e trate denúncias com sigilo, atribua responsáveis e registre a resolução.',
    route: '/complaints',
    icon: MessageSquareWarning,
    tone: 'text-fuchsia-700 dark:text-fuchsia-300',
    toneBg: 'bg-fuchsia-500/10',
    steps: ['Registrar denúncia', 'Atribuir responsável', 'Concluir e registrar evidências'],
  },
  {
    key: 'reports',
    title: 'Relatórios',
    subtitle: 'Evidências e indicadores',
    objective: 'Gere relatórios consolidados, exporte evidências e apresente indicadores para auditoria.',
    route: '/reports',
    icon: FileText,
    tone: 'text-amber-700 dark:text-amber-300',
    toneBg: 'bg-amber-500/10',
    steps: ['Consolidar KPIs', 'Exportar evidências', 'Apresentar plano contínuo'],
  },
]

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const current = modules[currentStep]
  const CurrentIcon = current.icon
  const isFirst = currentStep === 0
  const isLast = currentStep === modules.length - 1

  return (
    <div className="page-shell space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[var(--shadow-soft)] md:p-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_45%)]" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs tracking-wide uppercase">
              Configuração inicial
            </Badge>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Primeiros passos na plataforma
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Siga cada etapa para configurar sua unidade escolar. Você pode navegar livremente entre os módulos.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-border/70 bg-muted/30 px-4 py-2.5">
            <span className="text-2xl font-bold text-foreground">{currentStep + 1}</span>
            <span className="text-sm text-muted-foreground">de {modules.length}</span>
          </div>
        </div>
      </section>

      {/* Stepper bar */}
      <nav className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border/70 bg-card/90 p-2 shadow-[var(--shadow-soft)]">
        {modules.map((module, index) => {
          const Icon = module.icon
          const isActive = index === currentStep
          const isPast = index < currentStep

          return (
            <button
              key={module.key}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={cn(
                'group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20'
                  : isPast
                    ? 'text-muted-foreground hover:bg-muted/40'
                    : 'text-muted-foreground/60 hover:bg-muted/30 hover:text-muted-foreground',
              )}
            >
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? cn(module.toneBg, module.tone)
                    : isPast
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/50 text-muted-foreground/50',
                )}
              >
                {isPast ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
              </div>
              <span className="hidden truncate xl:inline">{module.title}</span>
            </button>
          )
        })}
      </nav>

      {/* Active step content */}
      <section className="rounded-2xl border border-border/70 bg-card/90 shadow-[var(--shadow-soft)]">
        {/* Step header */}
        <div className="flex flex-col gap-4 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-start gap-4">
            <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-2xl', current.toneBg, current.tone)}>
              <CurrentIcon className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{current.subtitle}</p>
              <h2 className="mt-0.5 text-xl font-semibold text-foreground">{current.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{current.objective}</p>
            </div>
          </div>
          <Button asChild variant="primary" size="lg" className="gap-2 self-start md:self-center">
            <Link to={current.route}>
              Ir para {current.title.toLowerCase()}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Step checklist */}
        <div className="p-5 md:p-6">
          <p className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            O que fazer neste módulo
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {current.steps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 transition hover:border-border hover:bg-muted/30"
              >
                <div className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                  current.toneBg, current.tone,
                )}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-border/60 px-5 py-4 md:px-6">
          <Button
            variant="outline"
            className="gap-2"
            disabled={isFirst}
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            <ArrowLeft className="size-4" />
            Anterior
          </Button>

          <div className="flex gap-1">
            {modules.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'size-2 rounded-full transition-all',
                  index === currentStep ? 'w-6 bg-primary' : 'bg-muted-foreground/20 hover:bg-muted-foreground/40',
                )}
              />
            ))}
          </div>

          {isLast ? (
            <Button asChild variant="primary" className="gap-2">
              <Link to="/dashboard">
                Concluir
                <Rocket className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Próximo
              <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
