import { delay, http, HttpResponse } from 'msw'
import { complaints } from '../data/factory'

export const complaintsHandlers = [
  http.get('/api/complaints', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')

    let filtered = [...complaints]

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

    const total = filtered.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(page, lastPage)
    const start = (safePage - 1) * perPage
    const data = filtered.slice(start, start + perPage)

    return HttpResponse.json({
      data,
      meta: {
        total,
        current_page: safePage,
        per_page: perPage,
        last_page: lastPage,
        first_page: 1,
      },
    })
  }),
]
