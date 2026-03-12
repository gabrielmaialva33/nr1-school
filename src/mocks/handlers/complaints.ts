import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { paginate, requireTenantSnapshot, sortByCreatedAtDesc } from './utils'

export const complaintsHandlers = [
  http.get(mockApi('/api/complaints'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')
    let filtered = sortByCreatedAtDesc(snapshot.complaints)

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.protocol_number.toLowerCase().includes(search) ||
          c.category.toLowerCase().includes(search) ||
          c.category_label.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.sector_reported.toLowerCase().includes(search),
      )
    }
    if (status) filtered = filtered.filter((c) => c.status === status)

    const { data, meta } = paginate(filtered, request, { perPage: 10 })

    return HttpResponse.json({
      data,
      meta,
    })
  }),
]
