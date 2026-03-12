import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { requireTenantSnapshot, paginate, sortByCreatedAtDesc } from './utils'

export const employeesHandlers = [
  http.get(mockApi('/api/employees'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const status = url.searchParams.get('status')
    const envId = url.searchParams.get('environment_id')
    const search = url.searchParams.get('search')?.toLowerCase()
    let filtered = sortByCreatedAtDesc(snapshot.employees)

    if (status) filtered = filtered.filter(e => e.status === status)
    if (envId) filtered = filtered.filter(e => e.environment_id === envId)
    if (search) filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(search) ||
      e.role.toLowerCase().includes(search)
    )

    const { data, meta } = paginate(filtered, request, { perPage: 10 })

    return HttpResponse.json({
      data,
      meta,
    })
  }),

  http.get(mockApi('/api/employees/:id'), async ({ params, request }) => {
    await delay(200)
    const { snapshot } = requireTenantSnapshot(request)
    const emp = snapshot?.employees.find(e => e.id === params.id)
    if (!emp) return HttpResponse.json({ errors: [{ message: 'Funcionário não encontrado' }] }, { status: 404 })
    return HttpResponse.json(emp)
  }),
]
