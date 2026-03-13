import { createSeededMockDatabase, type MockDatabase } from './factory'

const MOCK_DB_STORAGE_KEY = 'nr1-school.mock-db'
const MOCK_DB_BUSTER_KEY = 'nr1-school.mock-db.buster'
const MOCK_DB_BUSTER = '2026-03-13.avatars-color.v4'
const MOCK_SESSION_STORAGE_KEY = 'nr1-school.mock-session'

export interface MockSession {
  token: string
  user_id: string
  tenant_id: string
  issued_at: string
}

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildInitialState() {
  return createSeededMockDatabase()
}

function parseStoredValue<T>(value: string | null): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function persistMockDb(state: MockDatabase) {
  if (!canUseBrowserStorage()) return
  window.localStorage.setItem(MOCK_DB_STORAGE_KEY, JSON.stringify(state))
  window.localStorage.setItem(MOCK_DB_BUSTER_KEY, MOCK_DB_BUSTER)
}

function ensureMockDb() {
  if (!canUseBrowserStorage()) return

  const storedBuster = window.localStorage.getItem(MOCK_DB_BUSTER_KEY)
  const storedDb = parseStoredValue<MockDatabase>(window.localStorage.getItem(MOCK_DB_STORAGE_KEY))

  if (!storedDb || storedBuster !== MOCK_DB_BUSTER) {
    persistMockDb(buildInitialState())
  }
}

export function getMockDb(): MockDatabase {
  if (!canUseBrowserStorage()) {
    return buildInitialState()
  }

  ensureMockDb()

  const storedDb = parseStoredValue<MockDatabase>(window.localStorage.getItem(MOCK_DB_STORAGE_KEY))
  return storedDb ?? buildInitialState()
}

export function updateMockDb(updater: (current: MockDatabase) => MockDatabase) {
  const current = getMockDb()
  const next = updater(cloneState(current))
  persistMockDb(next)
  return next
}

export function resetMockDb() {
  const next = buildInitialState()
  persistMockDb(next)
  clearMockSession()
  return next
}

export function getDefaultTenantId(database = getMockDb()) {
  return database.schools[0]?.id ?? null
}

export function getMockSession() {
  if (!canUseBrowserStorage()) return null

  ensureMockDb()

  const storedSession = parseStoredValue<MockSession>(
    window.localStorage.getItem(MOCK_SESSION_STORAGE_KEY),
  )

  if (storedSession) {
    return storedSession
  }

  const database = getMockDb()
  const defaultUser = database.users[0]

  if (!defaultUser) return null

  const session = createMockSession(defaultUser.school_id, defaultUser.id)
  return session
}

export function createMockSession(tenantId: string, userId?: string) {
  const database = getMockDb()
  const tenantUser =
    (userId ? database.users.find((user) => user.id === userId) : null) ??
    database.users.find((user) => user.school_id === tenantId) ??
    database.users[0]

  if (!tenantUser) {
    return null
  }

  const session: MockSession = {
    token: `mock-session-${crypto.randomUUID()}`,
    user_id: tenantUser.id,
    tenant_id: tenantUser.school_id,
    issued_at: new Date().toISOString(),
  }

  if (canUseBrowserStorage()) {
    window.localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(session))
  }

  return session
}

export function clearMockSession() {
  if (!canUseBrowserStorage()) return
  window.localStorage.removeItem(MOCK_SESSION_STORAGE_KEY)
}

export function switchMockTenant(tenantId: string) {
  return createMockSession(tenantId)
}

export function getCurrentMockUser() {
  const database = getMockDb()
  const session = getMockSession()

  return (
    (session ? database.users.find((user) => user.id === session.user_id) : null) ??
    database.users[0] ??
    null
  )
}

export function getTenantSnapshot(tenantId: string) {
  const database = getMockDb()
  const school = database.schools.find((tenant) => tenant.id === tenantId) ?? null

  if (!school) {
    return null
  }

  return {
    school,
    users: database.users.filter((user) => user.school_id === tenantId),
    environments: database.environments.filter((environment) => environment.school_id === tenantId),
    risks: database.risks.filter((risk) => risk.school_id === tenantId),
    action_plans: database.action_plans.filter((plan) => plan.school_id === tenantId),
    employees: database.employees.filter((employee) => employee.school_id === tenantId),
    medical_certificates: database.medical_certificates.filter((certificate) => certificate.school_id === tenantId),
    trainings: database.trainings.filter((training) => training.school_id === tenantId),
    complaints: database.complaints.filter((complaint) => complaint.school_id === tenantId),
    assessments: database.assessments.filter((assessment) => assessment.school_id === tenantId),
    employee_training_enrollments: database.employee_training_enrollments.filter(
      (enrollment) => enrollment.tenant_id === tenantId,
    ),
    employee_ppe_deliveries: database.employee_ppe_deliveries.filter(
      (delivery) => delivery.tenant_id === tenantId,
    ),
    employee_compliance_documents: database.employee_compliance_documents.filter(
      (document) => document.tenant_id === tenantId,
    ),
  }
}
