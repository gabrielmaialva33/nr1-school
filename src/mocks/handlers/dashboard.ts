import { http, HttpResponse, delay } from 'msw'
import { dashboardData } from '../data/factory'

export const dashboardHandlers = [
  http.get('/api/dashboard', async () => {
    await delay(300)
    return HttpResponse.json(dashboardData)
  }),
]
