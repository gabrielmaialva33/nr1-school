import { addMonths } from 'date-fns'
import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import {
  employeeComplianceDocuments,
  employeePpeDeliveries,
  employeeTrainingEnrollments,
  employees,
  school,
  trainings,
} from '../data/factory'

type ComplianceDocumentType = 'training_certificate' | 'ppe_delivery_receipt'

function resolveTenantId(request: Request) {
  return (
    request.headers.get('x-tenant-id') ||
    new URL(request.url).searchParams.get('tenant_id') ||
    school.id
  )
}

function computeOpenRequirements(documentCount: number) {
  return Math.max(0, 2 - Math.min(documentCount, 2))
}

function computeExpiringDocuments(documents: Array<{ status: string }>) {
  return documents.filter(document => document.status === 'expiring_soon').length
}

export const employeeComplianceHandlers = [
  http.get(mockApi('/api/employees/:id/compliance'), async ({ params, request }) => {
    await delay(300)

    const tenantId = resolveTenantId(request)
    const employee = employees.find(record => record.id === params.id)

    if (!employee || employee.school_id !== tenantId) {
      return HttpResponse.json(
        { errors: [{ message: 'Funcionário não encontrado para o tenant informado' }] },
        { status: 404 },
      )
    }

    const trainingEnrollments = employeeTrainingEnrollments.filter(
      record => record.employee_id === employee.id && record.tenant_id === tenantId,
    )
    const ppeDeliveries = employeePpeDeliveries.filter(
      record => record.employee_id === employee.id && record.tenant_id === tenantId,
    )
    const complianceDocuments = employeeComplianceDocuments.filter(
      record => record.employee_id === employee.id && record.tenant_id === tenantId,
    )

    const referencedTrainingIds = Array.from(
      new Set(trainingEnrollments.map(record => record.training_id)),
    )
    const trainingCatalog = trainings.filter(training =>
      referencedTrainingIds.includes(training.id),
    )

    return HttpResponse.json({
      meta: {
        tenant_id: tenantId,
        employee_id: employee.id,
        generated_at: new Date().toISOString(),
        open_requirements: computeOpenRequirements(complianceDocuments.length),
        expiring_documents: computeExpiringDocuments(complianceDocuments),
      },
      employee: {
        id: employee.id,
        tenant_id: tenantId,
        environment_id: employee.environment_id,
        environment_name: employee.environment_name,
        name: employee.name,
        cpf: employee.cpf,
        role: employee.role,
        admission_date: employee.admission_date,
        status: employee.status,
        email: employee.email,
      },
      training_catalog: trainingCatalog,
      training_enrollments: trainingEnrollments,
      ppe_deliveries: ppeDeliveries,
      compliance_documents: complianceDocuments,
    })
  }),

  http.post(mockApi('/api/employees/:id/compliance-documents'), async ({ params, request }) => {
    await delay(400)

    const tenantId = resolveTenantId(request)
    const employee = employees.find(record => record.id === params.id)

    if (!employee || employee.school_id !== tenantId) {
      return HttpResponse.json(
        { errors: [{ message: 'Funcionário não encontrado para o tenant informado' }] },
        { status: 404 },
      )
    }

    const payload = await request.json() as {
      tenant_id?: string
      document_type: ComplianceDocumentType
      training_id?: string | null
      equipment_name?: string | null
      ca_number?: string | null
      issued_at: string
      expires_at?: string | null
      notes?: string | null
      file_name: string
      mime_type: string
      file_size_bytes: number
    }

    if (!payload.document_type || !payload.issued_at || !payload.file_name) {
      return HttpResponse.json(
        { errors: [{ message: 'Payload inválido para cadastro do documento' }] },
        { status: 422 },
      )
    }

    let trainingEnrollmentId: string | null = null
    let ppeDeliveryId: string | null = null

    if (payload.document_type === 'training_certificate') {
      if (!payload.training_id) {
        return HttpResponse.json(
          { errors: [{ message: 'training_id é obrigatório para certificado de treinamento' }] },
          { status: 422 },
        )
      }

      const selectedTraining = trainings.find(training => training.id === payload.training_id)
      if (!selectedTraining) {
        return HttpResponse.json(
          { errors: [{ message: 'Treinamento informado não encontrado' }] },
          { status: 404 },
        )
      }

      const existingEnrollment = employeeTrainingEnrollments.find(
        record =>
          record.employee_id === employee.id &&
          record.tenant_id === tenantId &&
          record.training_id === payload.training_id,
      )

      if (existingEnrollment) {
        trainingEnrollmentId = existingEnrollment.id
      } else {
        const createdEnrollment = {
          id: crypto.randomUUID(),
          tenant_id: tenantId,
          employee_id: employee.id,
          training_id: selectedTraining.id,
          status: 'completed' as const,
          completed_at: payload.issued_at,
          valid_until: payload.expires_at ?? addMonths(new Date(`${payload.issued_at}T00:00:00`), selectedTraining.validity_months).toISOString().split('T')[0],
          instructor_name: selectedTraining.instructor,
          created_at: new Date().toISOString(),
        }

        employeeTrainingEnrollments.unshift(createdEnrollment)
        trainingEnrollmentId = createdEnrollment.id
      }
    }

    if (payload.document_type === 'ppe_delivery_receipt') {
      if (!payload.equipment_name) {
        return HttpResponse.json(
          { errors: [{ message: 'equipment_name é obrigatório para comprovante de EPI' }] },
          { status: 422 },
        )
      }

      const createdDelivery = {
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        employee_id: employee.id,
        item_name: payload.equipment_name,
        ca_number: payload.ca_number ?? 'CA não informado',
        delivered_at: payload.issued_at,
        next_replacement_at: payload.expires_at ?? null,
        signed_at: payload.issued_at,
        created_at: new Date().toISOString(),
      }

      employeePpeDeliveries.unshift(createdDelivery)
      ppeDeliveryId = createdDelivery.id
    }

    const createdDocument = {
      id: crypto.randomUUID(),
      tenant_id: payload.tenant_id ?? tenantId,
      employee_id: employee.id,
      training_enrollment_id: trainingEnrollmentId,
      ppe_delivery_id: ppeDeliveryId,
      document_type: payload.document_type,
      file_name: payload.file_name,
      mime_type: payload.mime_type,
      file_size_bytes: payload.file_size_bytes,
      issued_at: payload.issued_at,
      expires_at: payload.expires_at ?? null,
      status: payload.expires_at ? 'validated' : 'pending_validation',
      notes: payload.notes ?? null,
      uploaded_at: new Date().toISOString(),
    }

    employeeComplianceDocuments.unshift(createdDocument)

    return HttpResponse.json(
      {
        message: 'Documento registrado com sucesso',
        document: createdDocument,
      },
      { status: 201 },
    )
  }),
]
