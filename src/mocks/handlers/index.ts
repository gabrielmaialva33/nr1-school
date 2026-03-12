import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { risksHandlers } from './risks'
import { employeesHandlers } from './employees'
import { environmentsHandlers } from './environments'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...risksHandlers,
  ...employeesHandlers,
  ...environmentsHandlers,
]
