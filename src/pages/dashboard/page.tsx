import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardData {
  school: { name: string; deadlineDays: number }
  kpis: Record<string, number>
  charts: {
    riskDistribution: Array<{ category: string; count: number; color: string }>
    scoreEvolution: Array<{ month: string; score: number }>
    certificateTrend: Array<{ month: string; total: number; mentalHealth: number }>
    risksByEnvironment: Array<{ name: string; count: number }>
  }
  alerts: Array<{ type: string; message: string; link: string }>
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
}: {
  title: string
  value: number | string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendLabel?: string
  color?: 'primary' | 'destructive' | 'success' | 'warning' | 'info'
}) {
  const colorMap = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
    destructive: { bg: 'bg-destructive/10', text: 'text-destructive', icon: 'text-destructive' },
    success: { bg: 'bg-success/10', text: 'text-success', icon: 'text-success' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', icon: 'text-warning' },
    info: { bg: 'bg-info/10', text: 'text-info', icon: 'text-info' },
  }
  const c = colorMap[color]

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn('mt-1 text-2xl font-bold', c.text)}>{value}</p>
        </div>
        <div className={cn('flex size-10 items-center justify-center rounded-lg', c.bg)}>
          <Icon className={cn('size-5', c.icon)} />
        </div>
      </div>
      {trendLabel && (
        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          {trend === 'up' && <TrendingUp className="size-3 text-destructive" />}
          {trend === 'down' && <TrendingDown className="size-3 text-success" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

function AlertBanner({ type, message }: { type: string; message: string }) {
  const styles = {
    critical: 'border-destructive/30 bg-destructive/5 text-destructive',
    warning: 'border-warning/30 bg-warning/5 text-warning',
    info: 'border-info/30 bg-info/5 text-info',
  }
  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', styles[type as keyof typeof styles] || styles.info)}>
      {message}
    </div>
  )
}

function DeadlineBanner({ days }: { days: number }) {
  const urgency = days <= 30 ? 'destructive' : days <= 60 ? 'warning' : 'info'
  const styles = {
    destructive: 'from-destructive/10 to-destructive/5 border-destructive/20',
    warning: 'from-warning/10 to-warning/5 border-warning/20',
    info: 'from-primary/10 to-primary/5 border-primary/20',
  }

  return (
    <div className={cn('flex items-center gap-4 rounded-xl border bg-gradient-to-r p-4', styles[urgency])}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-white shadow-sm">
        <Clock className="size-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">Deadline NR-1: Fiscalização punitiva</p>
        <p className="text-xs text-muted-foreground">26 de maio de 2026 — Portaria MTE nº 1.419/2024</p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-2xl font-bold text-primary">{days}</p>
        <p className="text-xs text-muted-foreground">dias restantes</p>
      </div>
    </div>
  )
}

function RiskDistributionChart({ data }: { data: DashboardData['charts']['riskDistribution'] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Distribuição de Riscos</h3>
      <div className="mt-4 space-y-3">
        {data.map(item => (
          <div key={item.category}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.category}</span>
              <span className="font-medium">{item.count}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(item.count / total) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RisksByEnvironment({ data }: { data: DashboardData['charts']['risksByEnvironment'] }) {
  const max = Math.max(...data.map(d => d.count))
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="text-sm font-semibold">Riscos por Setor</h3>
      <div className="mt-4 space-y-3">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-3">
            <span className="w-24 truncate text-xs text-muted-foreground">{item.name}</span>
            <div className="flex-1">
              <div className="h-6 rounded bg-muted">
                <div
                  className="flex h-6 items-center rounded bg-primary/80 px-2 text-xs font-medium text-white"
                  style={{ width: `${Math.max((item.count / max) * 100, 15)}%` }}
                >
                  {item.count}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const { kpis, charts, alerts } = data

  return (
    <div className="space-y-6">
      {/* Deadline banner */}
      <DeadlineBanner days={data.school.deadlineDays} />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <AlertBanner key={i} type={alert.type} message={alert.message} />
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total de Riscos" value={kpis.totalRisks} icon={AlertTriangle} color="primary" trendLabel={`${kpis.criticalRisks} críticos`} trend="up" />
        <StatCard title="Riscos Críticos" value={kpis.criticalRisks} icon={Shield} color="destructive" trendLabel="Ação imediata" trend="up" />
        <StatCard title="Em Tratamento" value={kpis.treatingRisks} icon={ListChecks} color="info" trendLabel={`${kpis.pendingActionPlans} planos pendentes`} />
        <StatCard title="Controlados" value={kpis.controlledRisks} icon={TrendingDown} color="success" trendLabel="Meta: 100%" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Funcionários" value={kpis.totalEmployees} icon={Users} color="primary" />
        <StatCard title="Atestados (mês)" value={kpis.monthCertificates} icon={FileHeart} color="warning" trendLabel={`${kpis.mentalHealthCertificates} saúde mental`} trend="up" />
        <StatCard title="Treinamentos Pendentes" value={kpis.pendingTrainings} icon={GraduationCap} color="info" />
        <StatCard title="Denúncias Abertas" value={kpis.openComplaints} icon={MessageSquareWarning} color="destructive" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RiskDistributionChart data={charts.riskDistribution} />
        <RisksByEnvironment data={charts.risksByEnvironment} />
      </div>
    </div>
  )
}
