import { Route, Routes, Navigate } from 'react-router'
import { AppLayout } from '@/layouts/app-layout'
import { LoginPage } from '@/pages/auth/login'
import { DashboardPage } from '@/pages/dashboard/page'
import { PlaceholderPage } from '@/pages/placeholder'

export function AppRoutingSetup() {
  return (
    <Routes>
      {/* Auth — sem layout */}
      <Route path="/login" element={<LoginPage />} />

      {/* App — com layout (sidebar + header) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/environments" element={<PlaceholderPage title="Setores" />} />
        <Route path="/employees" element={<PlaceholderPage title="Funcionários" />} />
        <Route path="/assessments" element={<PlaceholderPage title="Campanhas COPSOQ" />} />
        <Route path="/assessments/results" element={<PlaceholderPage title="Resultado COPSOQ" />} />
        <Route path="/risks" element={<PlaceholderPage title="Inventário de Riscos" />} />
        <Route path="/action-plans" element={<PlaceholderPage title="Planos de Ação" />} />
        <Route path="/medical-certificates" element={<PlaceholderPage title="Atestados Médicos" />} />
        <Route path="/trainings" element={<PlaceholderPage title="Treinamentos" />} />
        <Route path="/complaints" element={<PlaceholderPage title="Denúncias" />} />
        <Route path="/reports" element={<PlaceholderPage title="Relatórios" />} />
        <Route path="/users" element={<PlaceholderPage title="Gestão de Usuários" />} />
        <Route path="/settings" element={<PlaceholderPage title="Configurações" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
