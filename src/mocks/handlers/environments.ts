import { http, HttpResponse, delay } from 'msw'
import { environments } from '../data/factory'

export const environmentsHandlers = [
  http.get('/api/environments', async () => {
    await delay(200)
    return HttpResponse.json({ data: environments })
  }),

  http.get('/api/environments/:id', async ({ params }) => {
    await delay(200)
    const env = environments.find(e => e.id === params.id)
    if (!env) return HttpResponse.json({ message: 'Setor não encontrado' }, { status: 404 })
    return HttpResponse.json(env)
  }),
]
