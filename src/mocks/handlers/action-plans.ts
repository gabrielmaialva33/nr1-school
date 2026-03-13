import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { paginate, requireTenantSnapshot, sortByCreatedAtDesc } from './utils'

export const actionPlansHandlers = [
  http.get(mockApi('/api/action-plans'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()
    let filtered = sortByCreatedAtDesc(snapshot.action_plans)

    if (status) filtered = filtered.filter(p => p.status === status)
    if (search) filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(search) ||
      p.responsible_name.toLowerCase().includes(search) ||
      p.involved_employees?.some((employee) =>
        employee.employee_name.toLowerCase().includes(search),
      ),
    )

    const { data, meta } = paginate(filtered, request, { perPage: 10 })

    return HttpResponse.json({
      meta,
      data,
    })
  }),

  http.get(mockApi('/api/action-plans/:id'), async ({ params, request }) => {
    await delay(200)
    const plan = requireTenantSnapshot(request).snapshot?.action_plans.find(p => p.id === params.id)
    if (!plan) return HttpResponse.json({ errors: [{ message: 'Plano não encontrado' }] }, { status: 404 })
    return HttpResponse.json(plan)
  }),
]
