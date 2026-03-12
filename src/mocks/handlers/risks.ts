import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { updateMockDb } from '../data/database'
import { paginate, requireTenantSnapshot, resolveTenantId, sortByCreatedAtDesc } from './utils'

export const risksHandlers = [
  http.get(mockApi('/api/risks'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const level = url.searchParams.get('level')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase()

    let filtered = sortByCreatedAtDesc(snapshot.risks)

    if (level) filtered = filtered.filter((risk) => risk.risk_level === level)
    if (status) filtered = filtered.filter((risk) => risk.status === status)
    if (search) {
      filtered = filtered.filter((risk) =>
        risk.name.toLowerCase().includes(search) ||
        risk.category_label.toLowerCase().includes(search) ||
        risk.environment_name.toLowerCase().includes(search),
      )
    }

    const { data, meta } = paginate(filtered, request, { perPage: 10 })

    return HttpResponse.json({
      data,
      meta,
    })
  }),

  http.get(mockApi('/api/risks/:id'), async ({ params, request }) => {
    await delay(200)
    const risk = requireTenantSnapshot(request).snapshot?.risks.find((record) => record.id === params.id)
    if (!risk) return HttpResponse.json({ errors: [{ message: 'Risco não encontrado' }] }, { status: 404 })
    return HttpResponse.json(risk)
  }),

  http.post(mockApi('/api/risks'), async ({ request }) => {
    await delay(400)

    const tenantId = resolveTenantId(request)
    const payload = await request.json() as Record<string, unknown>

    const createdRisk = {
      ...payload,
      id: crypto.randomUUID(),
      school_id: tenantId,
      created_at: new Date().toISOString(),
    }

    updateMockDb((current) => {
      current.risks.unshift(createdRisk as typeof current.risks[number])
      return current
    })

    return HttpResponse.json(createdRisk, { status: 201 })
  }),

  http.put(mockApi('/api/risks/:id'), async ({ params, request }) => {
    await delay(300)

    const tenantId = resolveTenantId(request)
    const payload = await request.json() as Record<string, unknown>
    let updatedRisk: typeof payload | null = null

    updateMockDb((current) => {
      current.risks = current.risks.map((risk) => {
        if (risk.id !== params.id || risk.school_id !== tenantId) {
          return risk
        }

        updatedRisk = { ...risk, ...payload }
        return updatedRisk as typeof risk
      })

      return current
    })

    if (!updatedRisk) {
      return HttpResponse.json({ errors: [{ message: 'Risco não encontrado' }] }, { status: 404 })
    }

    return HttpResponse.json(updatedRisk)
  }),

  http.delete(mockApi('/api/risks/:id'), async ({ params, request }) => {
    await delay(200)

    const tenantId = resolveTenantId(request)
    let deleted = false

    updateMockDb((current) => {
      const previousLength = current.risks.length
      current.risks = current.risks.filter(
        (risk) => !(risk.id === params.id && risk.school_id === tenantId),
      )
      deleted = current.risks.length !== previousLength
      return current
    })

    if (!deleted) {
      return HttpResponse.json({ errors: [{ message: 'Risco não encontrado' }] }, { status: 404 })
    }

    return HttpResponse.json({ message: 'Risco removido', id: params.id })
  }),
]
