import { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router'
import { AppLayout } from '@/layouts/app-layout'
import { LoginPage } from '@/pages/auth/login'

const DashboardPage = lazy(() => import('@/pages/dashboard/page').then(m => ({ default: m.DashboardPage })))
const EnvironmentsPage = lazy(() => import('@/pages/environments/page').then(m => ({ default: m.EnvironmentsPage })))
const EmployeesPage = lazy(() => import('@/pages/employees/page').then(m => ({ default: m.EmployeesPage })))
const EmployeeProfilePage = lazy(() => import('@/pages/employees/profile-page').then(m => ({ default: m.EmployeeProfilePage })))
const AssessmentsPage = lazy(() => import('@/pages/assessments/page').then(m => ({ default: m.AssessmentsPage })))
const AssessmentResultsPage = lazy(() => import('@/pages/assessments/results-page').then(m => ({ default: m.AssessmentResultsPage })))
const RisksPage = lazy(() => import('@/pages/risks/page').then(m => ({ default: m.RisksPage })))
const ActionPlansPage = lazy(() => import('@/pages/action-plans/page').then(m => ({ default: m.ActionPlansPage })))
const MedicalCertificatesPage = lazy(() => import('@/pages/medical-certificates/page').then(m => ({ default: m.MedicalCertificatesPage })))
const TrainingsPage = lazy(() => import('@/pages/trainings/page').then(m => ({ default: m.TrainingsPage })))
const ComplaintsPage = lazy(() => import('@/pages/complaints/page').then(m => ({ default: m.ComplaintsPage })))
const ReportsPage = lazy(() => import('@/pages/reports/page').then(m => ({ default: m.ReportsPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function AppRoutingSetup() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth — sem layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* App — com layout (sidebar + header) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/environments" element={<EnvironmentsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:employeeId" element={<EmployeeProfilePage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/assessments/results" element={<AssessmentResultsPage />} />
          <Route path="/risks" element={<RisksPage />} />
          <Route path="/action-plans" element={<ActionPlansPage />} />
          <Route path="/medical-certificates" element={<MedicalCertificatesPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<Navigate to="/employees" replace />} />
          <Route path="/settings" element={<Navigate to="/reports" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
