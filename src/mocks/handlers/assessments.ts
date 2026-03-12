import { http, HttpResponse, delay } from 'msw'
import { mockApi } from '../api'

const assessments = [
  {
    id: '1',
    name: 'Campanha Mar/2026',
    period_start: '2026-03-01',
    period_end: '2026-03-31',
    sectors_count: 3,
    responses_count: 45,
    expected_responses: 128,
    participation_rate: 35,
    risk_level: 'medium',
    status: 'active',
    created_at: '2026-03-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Campanha Fev/2026',
    period_start: '2026-02-01',
    period_end: '2026-02-28',
    sectors_count: 5,
    responses_count: 198,
    expected_responses: 198,
    participation_rate: 100,
    risk_level: 'high',
    status: 'completed',
    created_at: '2026-02-01T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Campanha Dez/2025',
    period_start: '2025-12-01',
    period_end: '2025-12-31',
    sectors_count: 4,
    responses_count: 156,
    expected_responses: 160,
    participation_rate: 97,
    risk_level: 'low',
    status: 'completed',
    created_at: '2025-12-01T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Campanha Jan/2026',
    period_start: '2026-01-06',
    period_end: '2026-01-31',
    sectors_count: 6,
    responses_count: 174,
    expected_responses: 190,
    participation_rate: 91,
    risk_level: 'medium',
    status: 'completed',
    created_at: '2026-01-06T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Campanha Nov/2025',
    period_start: '2025-11-01',
    period_end: '2025-11-30',
    sectors_count: 4,
    responses_count: 142,
    expected_responses: 155,
    participation_rate: 91,
    risk_level: 'high',
    status: 'completed',
    created_at: '2025-11-01T00:00:00.000Z',
  },
  {
    id: '6',
    name: 'Campanha Out/2025',
    period_start: '2025-10-01',
    period_end: '2025-10-31',
    sectors_count: 3,
    responses_count: 88,
    expected_responses: 120,
    participation_rate: 73,
    risk_level: 'critical',
    status: 'completed',
    created_at: '2025-10-01T00:00:00.000Z',
  },
  {
    id: '7',
    name: 'Campanha Abr/2026 (Rascunho)',
    period_start: '2026-04-01',
    period_end: '2026-04-30',
    sectors_count: 0,
    responses_count: 0,
    expected_responses: 0,
    participation_rate: 0,
    risk_level: 'low',
    status: 'draft',
    created_at: '2026-03-10T00:00:00.000Z',
  },
  {
    id: '8',
    name: 'Campanha Mai/2026 (Rascunho)',
    period_start: '2026-05-01',
    period_end: '2026-05-31',
    sectors_count: 0,
    responses_count: 0,
    expected_responses: 0,
    participation_rate: 0,
    risk_level: 'low',
    status: 'draft',
    created_at: '2026-03-11T00:00:00.000Z',
  },
]

export const assessmentsHandlers = [
  http.get(mockApi('/api/assessments'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')

    const total = assessments.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(page, lastPage)
    const start = (safePage - 1) * perPage
    const data = assessments.slice(start, start + perPage)

    return HttpResponse.json({
      meta: {
        total,
        current_page: safePage,
        per_page: perPage,
        last_page: lastPage,
        first_page: 1,
      },
      data,
    })
  }),

  http.get(mockApi('/api/assessments/:id'), async ({ params }) => {
    await delay(200)
    const assessment = assessments.find(a => a.id === params.id)
    if (!assessment) return HttpResponse.json({ errors: [{ message: 'Campanha não encontrada' }] }, { status: 404 })
    return HttpResponse.json(assessment)
  }),
]
