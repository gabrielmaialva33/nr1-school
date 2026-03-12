import { http, HttpResponse, delay } from 'msw'
import { risks } from '../data/factory'

export const risksHandlers = [
  http.get('/api/risks', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const level = url.searchParams.get('level')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')

    let filtered = [...risks]

    if (level) filtered = filtered.filter(r => r.risk_level === level)
    if (status) filtered = filtered.filter(r => r.status === status)
    if (search) filtered = filtered.filter(r =>
      r.name.toLowerCase().includes(search) ||
      r.category_label.toLowerCase().includes(search) ||
      r.environment_name.toLowerCase().includes(search)
    )

    const total = filtered.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(page, lastPage)
    const start = (safePage - 1) * perPage
    const data = filtered.slice(start, start + perPage)

    return HttpResponse.json({
      data,
      meta: { total, current_page: safePage, per_page: perPage, last_page: lastPage, first_page: 1 },
    })
  }),

  http.get('/api/risks/:id', async ({ params }) => {
    await delay(200)
    const risk = risks.find(r => r.id === params.id)
    if (!risk) return HttpResponse.json({ errors: [{ message: 'Risco não encontrado' }] }, { status: 404 })
    return HttpResponse.json(risk)
  }),

  http.post('/api/risks', async ({ request }) => {
    await delay(400)
    const body = await request.json()
    return HttpResponse.json({ ...body, id: crypto.randomUUID(), created_at: new Date().toISOString() }, { status: 201 })
  }),

  http.put('/api/risks/:id', async ({ params, request }) => {
    await delay(300)
    const body = await request.json()
    const risk = risks.find(r => r.id === params.id)
    if (!risk) return HttpResponse.json({ errors: [{ message: 'Risco não encontrado' }] }, { status: 404 })
    return HttpResponse.json({ ...risk, ...body })
  }),

  http.delete('/api/risks/:id', async ({ params }) => {
    await delay(200)
    return HttpResponse.json({ message: 'Risco removido', id: params.id })
  }),
]
