import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { paginate, requireTenantSnapshot, sortByCreatedAtDesc } from './utils'

export const environmentsHandlers = [
  http.get(mockApi('/api/environments'), async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const search = url.searchParams.get('search')?.toLowerCase()
    let filtered = sortByCreatedAtDesc(snapshot.environments)

    if (search) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search),
      )
    }

    const { data, meta } = paginate(filtered, request, { perPage: 50 })

    return HttpResponse.json({
      meta,
      data,
    })
  }),

  http.get(mockApi('/api/environments/:id'), async ({ params, request }) => {
    await delay(200)
    const env = requireTenantSnapshot(request).snapshot?.environments.find(e => e.id === params.id)
    if (!env) return HttpResponse.json({ errors: [{ message: 'Setor não encontrado' }] }, { status: 404 })
    return HttpResponse.json(env)
  }),
]
