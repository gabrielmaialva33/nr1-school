import { http, HttpResponse, delay } from 'msw'
import { employees } from '../data/factory'

export const employeesHandlers = [
  http.get('/api/employees', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const envId = url.searchParams.get('environment_id')
    const search = url.searchParams.get('search')?.toLowerCase()
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')

    let filtered = [...employees]

    if (status) filtered = filtered.filter(e => e.status === status)
    if (envId) filtered = filtered.filter(e => e.environmentId === envId)
    if (search) filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(search) ||
      e.role.toLowerCase().includes(search)
    )

    const total = filtered.length
    const start = (page - 1) * perPage
    const data = filtered.slice(start, start + perPage)

    return HttpResponse.json({
      data,
      meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
    })
  }),

  http.get('/api/employees/:id', async ({ params }) => {
    await delay(200)
    const emp = employees.find(e => e.id === params.id)
    if (!emp) return HttpResponse.json({ message: 'Funcionário não encontrado' }, { status: 404 })
    return HttpResponse.json(emp)
  }),
]
