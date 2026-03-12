import { http, HttpResponse, delay } from 'msw'
import { actionPlans } from '../data/factory'

export const actionPlansHandlers = [
  http.get('/api/action-plans', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()

    let filtered = [...actionPlans]

    if (status) filtered = filtered.filter(p => p.status === status)
    if (search) filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(search) ||
      p.responsible_name.toLowerCase().includes(search),
    )

    const total = filtered.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(page, lastPage)
    const start = (safePage - 1) * perPage
    const data = filtered.slice(start, start + perPage)

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

  http.get('/api/action-plans/:id', async ({ params }) => {
    await delay(200)
    const plan = actionPlans.find(p => p.id === params.id)
    if (!plan) return HttpResponse.json({ errors: [{ message: 'Plano não encontrado' }] }, { status: 404 })
    return HttpResponse.json(plan)
  }),
]
