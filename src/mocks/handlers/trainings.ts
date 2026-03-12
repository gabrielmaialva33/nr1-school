import { addMonths } from 'date-fns'
import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { paginate, requireTenantSnapshot, sortByCreatedAtDesc } from './utils'

export const trainingsHandlers = [
  http.get(mockApi('/api/trainings'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const search = url.searchParams.get('search')?.toLowerCase()
    const status = url.searchParams.get('status')

    const normalizedTrainings = sortByCreatedAtDesc(snapshot.trainings).map(training => ({
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

    const { data, meta } = paginate(filtered, request, { perPage: 10 })

    return HttpResponse.json({
      data,
      meta,
    })
  }),
]
