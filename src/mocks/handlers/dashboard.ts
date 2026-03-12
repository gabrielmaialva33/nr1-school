import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { requireTenantSnapshot } from './utils'

function getMonthKey(dateLike: string) {
  const date = new Date(dateLike)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonthLabel(dateLike: string) {
  return new Date(dateLike).toLocaleDateString('pt-BR', { month: 'short' })
}

export const dashboardHandlers = [
  http.get(mockApi('/api/dashboard'), async ({ request }) => {
    await delay(300)
    const { snapshot } = requireTenantSnapshot(request)

    if (!snapshot) {
      return HttpResponse.json({ message: 'Tenant não encontrado' }, { status: 404 })
    }

    const criticalRisks = snapshot.risks.filter((risk) => risk.risk_level === 'critical').length
    const treatingRisks = snapshot.risks.filter((risk) => risk.status === 'treating').length
    const controlledRisks = snapshot.risks.filter((risk) => risk.status === 'controlled').length
    const pendingPlans = snapshot.action_plans.filter(
      (plan) => plan.status === 'pending' || plan.status === 'overdue',
    ).length
    const overduePlans = snapshot.action_plans.filter((plan) => plan.status === 'overdue').length
    const openComplaints = snapshot.complaints.filter(
      (complaint) => complaint.status !== 'resolved' && complaint.status !== 'dismissed',
    ).length
    const certificateTrendMap = new Map<string, { total: number; mental_health: number }>()

    snapshot.medical_certificates.forEach((certificate) => {
      const monthKey = getMonthKey(certificate.created_at)
      const current = certificateTrendMap.get(monthKey) ?? { total: 0, mental_health: 0 }
      current.total += 1
      if (certificate.is_mental_health) current.mental_health += 1
      certificateTrendMap.set(monthKey, current)
    })

    const certificateTrend = [...certificateTrendMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-6)
      .map(([monthKey, values]) => ({
        month: formatMonthLabel(`${monthKey}-01`),
        total: values.total,
        mental_health: values.mental_health,
      }))

    const scoreEvolution = [...snapshot.assessments]
      .filter((assessment) => assessment.status !== 'draft')
      .sort((left, right) => left.period_start.localeCompare(right.period_start))
      .slice(-6)
      .map((assessment) => ({
        month: formatMonthLabel(assessment.period_start),
        score:
          assessment.risk_level === 'critical'
            ? 81
            : assessment.risk_level === 'high'
              ? 69
              : assessment.risk_level === 'medium'
                ? 56
                : 38,
      }))

    return HttpResponse.json({
      school: {
        name: snapshot.school.name,
        deadline_days: Math.ceil(
          (new Date('2026-05-26').getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      },
      kpis: {
        overall_risk_score: Math.round(
          snapshot.risks.reduce((sum, risk) => sum + risk.probability * risk.severity, 0) /
            Math.max(snapshot.risks.length, 1) *
            4,
        ),
        critical_risks: criticalRisks,
        pending_action_plans: pendingPlans,
        pending_trainings: snapshot.trainings.filter((training) => training.status === 'scheduled').length,
        month_certificates: snapshot.medical_certificates.length,
        mental_health_certificates: snapshot.medical_certificates.filter((certificate) => certificate.is_mental_health).length,
        open_complaints: openComplaints,
        questionnaire_adhesion: snapshot.assessments.find((assessment) => assessment.status === 'active')?.participation_rate ?? 0,
        total_risks: snapshot.risks.length,
        treating_risks: treatingRisks,
        controlled_risks: controlledRisks,
        total_employees: snapshot.employees.length,
      },
      charts: {
        risks_by_environment: snapshot.environments.slice(0, 6).map((environment) => ({
          name: environment.name,
          count: snapshot.risks.filter((risk) => risk.environment_id === environment.id).length,
        })),
        score_evolution: scoreEvolution,
        risk_distribution: [
          { category: 'Baixo', count: snapshot.risks.filter((risk) => risk.risk_level === 'low').length, color: '#10b981' },
          { category: 'Médio', count: snapshot.risks.filter((risk) => risk.risk_level === 'medium').length, color: '#f59e0b' },
          { category: 'Alto', count: snapshot.risks.filter((risk) => risk.risk_level === 'high').length, color: '#f97316' },
          { category: 'Crítico', count: criticalRisks, color: '#ef4444' },
        ],
        certificate_trend: certificateTrend,
      },
      alerts: [
        { type: 'critical', message: `${criticalRisks} riscos críticos identificados precisam de ação imediata`, link: '/risks?level=critical' },
        { type: 'warning', message: `${overduePlans} planos de ação com prazo vencido exigem atenção`, link: '/action-plans?status=overdue' },
        {
          type: 'info',
          message: `Adesão ao questionário COPSOQ: ${snapshot.assessments.find((assessment) => assessment.status === 'active')?.participation_rate ?? 0}%`,
          link: '/assessments',
        },
      ],
    })
  }),
]
