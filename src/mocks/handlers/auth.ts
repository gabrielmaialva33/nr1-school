import { http, HttpResponse, delay } from 'msw'
import { mockApi } from '../api'
import { currentUser } from '../data/factory'

export const authHandlers = [
  http.post(mockApi('/api/auth/login'), async ({ request }) => {
    await delay(500)
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'demo@nr1.school' && body.password === 'demo123') {
      return HttpResponse.json({
        user: currentUser,
        token: 'mock-session-token',
      })
    }

    return HttpResponse.json(
      { message: 'Email ou senha incorretos' },
      { status: 401 }
    )
  }),

  http.post(mockApi('/api/auth/logout'), async () => {
    await delay(200)
    return HttpResponse.json({ message: 'Logout realizado' })
  }),

  http.get(mockApi('/api/auth/me'), async () => {
    await delay(200)
    return HttpResponse.json({ user: currentUser })
  }),
]
