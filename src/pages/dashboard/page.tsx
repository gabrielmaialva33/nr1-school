import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Users,
  ListChecks,
  FileHeart,
  GraduationCap,
  MessageSquareWarning,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  ArrowRight,
  ClipboardCheck,
  FileText,
  AlertCircle,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CountingNumber } from '@/components/ui/counting-number'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DashboardPageSkeleton } from '@/components/loading/page-skeletons'
import { fetchDashboardData, type DashboardData } from '@/services/dashboard'

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
  link,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendLabel?: string
  color?: 'primary' | 'destructive' | 'success' | 'warning' | 'info'
  link?: string
}) {
  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
    destructive: { bg: 'bg-destructive/10', text: 'text-destructive', icon: 'text-destructive' },
    success: { bg: 'bg-success/10', text: 'text-success', icon: 'text-success' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', icon: 'text-warning' },
    info: { bg: 'bg-info/10', text: 'text-info', icon: 'text-info' },
  }
  const c = colorMap[color]

  const content = (
    <div
      className={cn(
        'surface-card flex h-full flex-col justify-between rounded-xl border border-border/80 bg-card/95 p-5 backdrop-blur-sm',
        link && 'surface-interactive cursor-pointer',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('mt-1 text-2xl font-bold', c.text)}>
            {typeof value === 'number' ? <CountingNumber to={value} duration={1.5} /> : value}
          </p>
        </div>
        <div className={cn('flex size-10 items-center justify-center rounded-lg', c.bg)}>
          <Icon className={cn('size-5', c.icon)} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        {trendLabel ? (
          <>
            {trend === 'up' && <TrendingUp className="size-3 text-destructive" />}
            {trend === 'down' && <TrendingDown className="size-3 text-success" />}
            <span>{trendLabel}</span>
          </>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>
    </div>
  )

  if (!link) return content

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={link}>{content}</Link>
      </TooltipTrigger>
      <TooltipContent>Clique para ver detalhes</TooltipContent>
    </Tooltip>
  )
}

function AlertBanner({ type, message, link }: { type: string; message: string; link: string }) {
  const styles = {
    critical: { border: 'border-destructive/30 bg-destructive/5 text-destructive', icon: AlertCircle },
    warning: { border: 'border-warning/30 bg-warning/5 text-warning', icon: AlertTriangle },
    info: { border: 'border-info/30 bg-info/5 text-info', icon: ClipboardCheck },
  }
  const s = styles[type as keyof typeof styles] || styles.info
  const Icon = s.icon

  return (
    <Link
      to={link}
      className={cn(
        'surface-card surface-interactive flex items-center gap-3 rounded-lg border px-4 py-3 text-sm',
        s.border,
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <ArrowRight className="size-4 shrink-0 opacity-50" />
    </Link>
  )
}

function DeadlineBanner({ days }: { days: number }) {
  const urgency = days <= 30 ? 'destructive' : days <= 60 ? 'warning' : 'info'
  const styles = {
    destructive: 'from-destructive/10 to-destructive/5 border-destructive/20',
    warning: 'from-warning/10 to-warning/5 border-warning/20',
    info: 'from-primary/10 to-primary/5 border-primary/20',
  }
  const progress = Math.max(0, Math.min(100, ((365 - days) / 365) * 100))

  return (
    <div className={cn('surface-card rounded-xl border bg-gradient-to-r p-4 ring-1 ring-inset ring-primary/10', styles[urgency])}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm">
          <Clock className="size-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Deadline NR-1: Fiscalização punitiva</p>
          <p className="text-xs text-muted-foreground">26 de maio de 2026 — Portaria MTE nº 1.419/2024</p>
          <div className="mt-2">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-2xl font-bold text-primary">
            <CountingNumber to={days} duration={2} />
          </p>
          <p className="text-xs text-muted-foreground">dias restantes</p>
        </div>
      </div>
    </div>
  )
}

function RiskDonutChart({ data }: { data: DashboardData['charts']['risk_distribution'] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Distribuição de Riscos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative size-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  dataKey="count"
                  strokeWidth={2}
                  stroke="var(--color-background)"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold"><CountingNumber to={total} duration={1.5} /></span>
              <span className="text-[10px] text-muted-foreground">riscos</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.map(item => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                </div>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreEvolutionChart({ data }: { data: DashboardData['charts']['score_evolution'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Evolução do Score de Risco</CardTitle>
        <Badge variant="outline" className="text-xs">Últimos 6 meses</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" domain={[0, 100]} />
              <RechartsTooltip
                contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }}
                formatter={(value: number) => [`${value} pts`, 'Score']}
              />
              <Area type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2} fill="url(#scoreGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function RisksByEnvironmentChart({ data }: { data: DashboardData['charts']['risks_by_environment'] }) {
  const chartData = data.map(d => {
    const [primary, secondary] = d.name.split(' - ')
    const shortName =
      primary === 'Sala de Aula' && secondary
        ? secondary.includes('Fundamental')
          ? 'Fund.'
          : secondary.includes('Médio')
            ? 'Médio'
            : 'Aula'
        : primary === 'Cozinha e Refeitório'
          ? 'Cozinha'
          : primary === 'Limpeza e Manutenção'
            ? 'Limpeza'
            : d.name.length > 16
              ? `${d.name.slice(0, 16)}…`
              : d.name

    return { ...d, name: shortName }
  })
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Riscos por Setor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} className="text-muted-foreground" />
              <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }} />
              <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function CertificateTrendChart({ data }: { data: DashboardData['charts']['certificate_trend'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Tendência de Atestados</CardTitle>
        <Badge variant="outline" className="text-xs">Últimos 6 meses</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#totalGradient)" name="Total" />
              <Area type="monotone" dataKey="mental_health" stroke="#ef4444" strokeWidth={2} fill="url(#mentalGradient)" name="Saúde Mental" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

const recentActivity = [
  { icon: AlertTriangle, text: 'Novo risco identificado: Sobrecarga - Sala de Aula', time: '2h atrás', color: 'text-destructive', bg: 'bg-destructive/10', link: '/risks' },
  { icon: ClipboardCheck, text: 'Campanha COPSOQ Mar/2026 atingiu 35% de adesão', time: '4h atrás', color: 'text-primary', bg: 'bg-primary/10', link: '/assessments' },
  { icon: FileText, text: 'Atestado registrado: F32.0 - Ricardo Batista Neto', time: '6h atrás', color: 'text-warning', bg: 'bg-warning/10', link: '/medical-certificates' },
  { icon: MessageSquareWarning, text: 'Nova denúncia anônima: DEN-2026-0006', time: '1d atrás', color: 'text-info', bg: 'bg-info/10', link: '/complaints' },
  { icon: GraduationCap, text: 'Treinamento "Primeiros Socorros Psicológicos" em andamento', time: '2d atrás', color: 'text-success', bg: 'bg-success/10', link: '/trainings' },
]

function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Atividade Recente</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
          Ver tudo
          <ArrowRight className="size-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {recentActivity.map((item, i) => (
          <Link key={i} to={item.link} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
            <Avatar className={cn('mt-0.5 size-8', item.bg)}>
              <AvatarFallback className={cn('border-0', item.bg)}>
                <item.icon className={cn('size-4', item.color)} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug">{item.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function ConformityCard({ kpis }: { kpis: Record<string, number> }) {
  const score = kpis.overall_risk_score
  const color = score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Conformidade NR-1</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative size-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { value: score },
                    { value: 100 - score },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  <Cell fill={score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'} />
                  <Cell fill="var(--color-muted)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-xl font-bold', color)}>
                <CountingNumber to={score} duration={1.5} format={(v) => `${Math.round(v)}%`} />
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Riscos controlados</span>
                <span className="font-medium">{kpis.controlled_risks}/{kpis.total_risks}</span>
              </div>
              <Progress value={(kpis.controlled_risks / kpis.total_risks) * 100} className="mt-1 h-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Adesão COPSOQ</span>
                <span className="font-medium">{kpis.questionnaire_adhesion}%</span>
              </div>
              <Progress value={kpis.questionnaire_adhesion} className="mt-1 h-1.5" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Planos pendentes</span>
                <span className="font-medium text-destructive">{kpis.pending_action_plans}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar dados'))
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!data) {
    return <DashboardPageSkeleton />
  }

  const { kpis, charts, alerts } = data

  return (
    <div className="page-stagger space-y-6">
      {/* Deadline banner */}
      <DeadlineBanner days={data.school.deadline_days} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <AlertBanner key={i} type={alert.type} message={alert.message} link={alert.link} />
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total de Riscos" value={kpis.total_risks} icon={AlertTriangle} color="primary" trendLabel={`${kpis.critical_risks} críticos`} trend="up" link="/risks" />
        <StatCard title="Riscos Críticos" value={kpis.critical_risks} icon={Shield} color="destructive" trendLabel="Ação imediata" trend="up" link="/risks?level=critical" />
        <StatCard title="Em Tratamento" value={kpis.treating_risks} icon={ListChecks} color="info" trendLabel={`${kpis.pending_action_plans} planos pendentes`} link="/action-plans" />
        <StatCard title="Controlados" value={kpis.controlled_risks} icon={TrendingDown} color="success" trendLabel="Meta: 100%" link="/risks?status=controlled" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Funcionários" value={kpis.total_employees} icon={Users} color="primary" link="/employees" />
        <StatCard title="Atestados (mês)" value={kpis.month_certificates} icon={FileHeart} color="warning" trendLabel={`${kpis.mental_health_certificates} saúde mental`} trend="up" link="/medical-certificates" />
        <StatCard title="Treinamentos Pendentes" value={kpis.pending_trainings} icon={GraduationCap} color="info" link="/trainings" />
        <StatCard title="Denúncias Abertas" value={kpis.open_complaints} icon={MessageSquareWarning} color="destructive" link="/complaints" />
      </div>

      {/* Charts + Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RiskDonutChart data={charts.risk_distribution} />
        <ConformityCard kpis={kpis} />
        <ActivityFeed />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreEvolutionChart data={charts.score_evolution} />
        <CertificateTrendChart data={charts.certificate_trend} />
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <RisksByEnvironmentChart data={charts.risks_by_environment} />
      </div>
    </div>
  )
}
