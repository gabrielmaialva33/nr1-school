import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { medicalCertificates } from '../data/factory'

export const medicalCertificatesHandlers = [
  http.get(mockApi('/api/medical-certificates'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const nexusRisk = url.searchParams.get('nexus_risk')
    const page = Number(url.searchParams.get('page') || '1')
    const perPage = Number(url.searchParams.get('per_page') || '10')

    let filtered = [...medicalCertificates]

    if (search) {
      filtered = filtered.filter(
        (mc) =>
          mc.employee_name.toLowerCase().includes(search) ||
          mc.icd_code.toLowerCase().includes(search) ||
          mc.doctor_name.toLowerCase().includes(search),
      )
    }
    if (nexusRisk) filtered = filtered.filter((mc) => mc.nexus_risk === nexusRisk)

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
