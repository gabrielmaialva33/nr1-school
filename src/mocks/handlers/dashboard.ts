import { http, HttpResponse, delay } from 'msw'
import { mockApi } from '../api'
import { dashboardData } from '../data/factory'

export const dashboardHandlers = [
  http.get(mockApi('/api/dashboard'), async () => {
    await delay(300)
    return HttpResponse.json(dashboardData)
  }),
]
