import { delay, http, HttpResponse } from 'msw'
import { mockApi } from '../api'
import { createMockSession, getCurrentMockUser, getMockDb, switchMockTenant, clearMockSession } from '../data/database'
import { DEMO_PASSWORD } from '../data/factory'

export const authHandlers = [
  http.post(mockApi('/api/auth/login'), async ({ request }) => {
    await delay(500)
    const body = await request.json() as { email: string; password: string }
    const database = getMockDb()
    const user = database.users.find((record) => record.email.toLowerCase() === body.email.toLowerCase())

    if (user && body.password === DEMO_PASSWORD) {
      const session = createMockSession(user.school_id, user.id)
      return HttpResponse.json({
        user: {
          ...user,
          password: undefined,
        },
        school: database.schools.find((school) => school.id === user.school_id) ?? null,
        token: session?.token ?? 'mock-session-token',
      })
    }

    return HttpResponse.json(
      { message: 'Email ou senha incorretos' },
      { status: 401 }
    )
  }),

  http.post(mockApi('/api/auth/logout'), async () => {
    await delay(200)
    clearMockSession()
    return HttpResponse.json({ message: 'Logout realizado' })
  }),

  http.get(mockApi('/api/auth/me'), async () => {
    await delay(200)
    const database = getMockDb()
    const user = getCurrentMockUser()

    if (!user) {
      return HttpResponse.json({ message: 'Sessão não encontrada' }, { status: 401 })
    }

    return HttpResponse.json({
      user: {
        ...user,
        password: undefined,
      },
      school: database.schools.find((school) => school.id === user.school_id) ?? null,
    })
  }),

  http.post(mockApi('/api/auth/switch-tenant'), async ({ request }) => {
    await delay(250)
    const body = await request.json() as { tenant_id?: string }

    if (!body.tenant_id) {
      return HttpResponse.json({ message: 'tenant_id é obrigatório' }, { status: 422 })
    }

    const database = getMockDb()
    const school = database.schools.find((tenant) => tenant.id === body.tenant_id)

    if (!school) {
      return HttpResponse.json({ message: 'Tenant não encontrado' }, { status: 404 })
    }

    const session = switchMockTenant(body.tenant_id)
    const user = getCurrentMockUser()

    return HttpResponse.json({
      user: user
        ? {
            ...user,
            password: undefined,
          }
        : null,
      school,
      token: session?.token ?? null,
    })
  }),

  http.get(mockApi('/api/tenants'), async () => {
    await delay(180)
    const database = getMockDb()

    return HttpResponse.json({
      data: database.schools,
    })
  }),
]
