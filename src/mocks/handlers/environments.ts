import { http, HttpResponse, delay } from 'msw'
import { environments } from '../data/factory'

export const environmentsHandlers = [
  http.get('/api/environments', async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '50')
    const search = url.searchParams.get('search')?.toLowerCase()

    let filtered = [...environments]

    if (search) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search),
      )
    }

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

  http.get('/api/environments/:id', async ({ params }) => {
    await delay(200)
    const env = environments.find(e => e.id === params.id)
    if (!env) return HttpResponse.json({ errors: [{ message: 'Setor não encontrado' }] }, { status: 404 })
    return HttpResponse.json(env)
  }),
]
