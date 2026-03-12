import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { paginate, requireTenantSnapshot, sortByCreatedAtDesc } from './utils'

export const assessmentsHandlers = [
  http.get(mockApi('/api/assessments'), async ({ request }) => {
    await delay(300)
    const { snapshot } = requireTenantSnapshot(request)

    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const { data, meta } = paginate(sortByCreatedAtDesc(snapshot.assessments), request, {
      perPage: 10,
    })

    return HttpResponse.json({
      meta,
      data,
    })
  }),

  http.get(mockApi('/api/assessments/:id'), async ({ params, request }) => {
    await delay(200)
    const assessment = requireTenantSnapshot(request).snapshot?.assessments.find(
      (record) => record.id === params.id,
    )
    if (!assessment) {
      return HttpResponse.json({ errors: [{ message: 'Campanha não encontrada' }] }, { status: 404 })
    }
    return HttpResponse.json(assessment)
  }),
]
