import { addMonths } from 'date-fns'
import { http, HttpResponse, delay } from 'msw'
import { mockApi } from '../api'
import { trainings } from '../data/factory'

export const trainingsHandlers = [
  http.get(mockApi('/api/trainings'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')

    const normalizedTrainings = trainings.map(training => ({
      ...training,
      validity_date: addMonths(new Date(training.scheduled_date), training.validity_months).toISOString().split('T')[0],
    }))

    let filtered = [...normalizedTrainings]

    if (search) {
      filtered = filtered.filter(training =>
        training.title.toLowerCase().includes(search) ||
        training.instructor.toLowerCase().includes(search),
      )
    }
    if (status) filtered = filtered.filter(training => training.status === status)

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
