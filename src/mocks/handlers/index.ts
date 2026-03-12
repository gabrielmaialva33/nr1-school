import { actionPlansHandlers } from './action-plans'
import { assessmentsHandlers } from './assessments'
import { authHandlers } from './auth'
import { complaintsHandlers } from './complaints'
import { dashboardHandlers } from './dashboard'
import { employeeComplianceHandlers } from './employee-compliance'
import { employeesHandlers } from './employees'
import { environmentsHandlers } from './environments'
import { medicalCertificatesHandlers } from './medical-certificates'
import { risksHandlers } from './risks'
import { trainingsHandlers } from './trainings'

export const handlers = [
  ...authHandlers,
  ...dashboardHandlers,
  ...risksHandlers,
  ...employeesHandlers,
  ...employeeComplianceHandlers,
  ...environmentsHandlers,
  ...assessmentsHandlers,
  ...actionPlansHandlers,
  ...medicalCertificatesHandlers,
  ...trainingsHandlers,
  ...complaintsHandlers,
]
