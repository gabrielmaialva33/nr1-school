import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { updateMockDb } from '../data/database'
import { paginate, requireTenantSnapshot, resolveTenantId, sortByCreatedAtDesc } from './utils'

export const medicalCertificatesHandlers = [
  http.get(mockApi('/api/medical-certificates'), async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const { snapshot } = requireTenantSnapshot(request)
    if (!snapshot) {
      return HttpResponse.json({ errors: [{ message: 'Tenant não encontrado' }] }, { status: 404 })
    }

    const search = url.searchParams.get('search')?.toLowerCase()
    const nexusRisk = url.searchParams.get('nexus_risk')
    let filtered = sortByCreatedAtDesc(snapshot.medical_certificates)

    if (search) {
      filtered = filtered.filter(
        (mc) =>
          mc.employee_name.toLowerCase().includes(search) ||
          mc.icd_code.toLowerCase().includes(search) ||
          mc.doctor_name.toLowerCase().includes(search),
      )
    }
    if (nexusRisk) filtered = filtered.filter((mc) => mc.nexus_risk === nexusRisk)

    const { data, meta } = paginate(filtered, request, { perPage: 10 })

    return HttpResponse.json({
      data,
      meta,
    })
  }),

  http.post(mockApi('/api/medical-certificates'), async ({ request }) => {
    await delay(350)

    const tenantId = resolveTenantId(request)
    const payload = (await request.json()) as {
      employee_id?: string
      employee_name?: string
      issue_date?: string
      days_off?: number
      icd_code?: string
      is_mental_health?: boolean
      doctor_name?: string
      return_date?: string
      inss_referral?: boolean
      nexus_risk?: 'low' | 'medium' | 'high' | 'none'
      attachment?: {
        file_name: string
        mime_type: string
        file_size_bytes: number
      }
    }

    if (!payload.employee_id || !payload.issue_date || !payload.return_date || !payload.icd_code) {
      return HttpResponse.json(
        { errors: [{ message: 'Campos obrigatórios do atestado não foram informados' }] },
        { status: 422 },
      )
    }

    const createdCertificate = {
      id: crypto.randomUUID(),
      employee_id: payload.employee_id,
      employee_name: payload.employee_name ?? 'Colaborador não informado',
      school_id: tenantId,
      issue_date: payload.issue_date,
      days_off: payload.days_off ?? 0,
      icd_code: payload.icd_code,
      is_mental_health: payload.is_mental_health ?? false,
      doctor_name: payload.doctor_name ?? 'Profissional não informado',
      return_date: payload.return_date,
      inss_referral: payload.inss_referral ?? false,
      nexus_risk: payload.nexus_risk ?? 'none',
      created_at: new Date().toISOString(),
    }

    updateMockDb((current) => {
      current.medical_certificates.unshift(createdCertificate)
      return current
    })

    return HttpResponse.json(
      {
        message: 'Atestado registrado com sucesso',
        data: createdCertificate,
      },
      { status: 201 },
    )
  }),
]
