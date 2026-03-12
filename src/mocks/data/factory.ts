import { faker } from '@faker-js/faker/locale/pt_BR'

faker.seed(42)

// School
export const school = {
  id: faker.string.uuid(),
  name: 'Escola Estadual Prof. Maria Helena Souza',
  cnpj: '12.345.678/0001-90',
  address: 'Rua das Palmeiras, 456 - Vila Mariana',
  city: 'São Paulo',
  state: 'SP',
  phone: '(11) 3456-7890',
  email: 'contato@escolamhelena.edu.br',
  responsibleName: 'Ana Carolina Mendes',
  employeeCount: 87,
  planType: 'professional' as const,
}

// Users
export const currentUser = {
  id: faker.string.uuid(),
  schoolId: school.id,
  name: 'Ana Carolina Mendes',
  email: 'ana.mendes@escolamhelena.edu.br',
  role: 'admin' as const,
  isActive: true,
  avatar: null,
  lastLogin: new Date().toISOString(),
}

// Environments (Setores)
const envTypes = ['educational', 'administrative', 'food', 'maintenance', 'recreation', 'security'] as const
export const environments = [
  { id: faker.string.uuid(), name: 'Sala de Aula - Ensino Fundamental', type: 'educational', employeeCount: 22 },
  { id: faker.string.uuid(), name: 'Sala de Aula - Ensino Médio', type: 'educational', employeeCount: 18 },
  { id: faker.string.uuid(), name: 'Secretaria', type: 'administrative', employeeCount: 6 },
  { id: faker.string.uuid(), name: 'Direção', type: 'administrative', employeeCount: 4 },
  { id: faker.string.uuid(), name: 'Cozinha e Refeitório', type: 'food', employeeCount: 8 },
  { id: faker.string.uuid(), name: 'Limpeza e Manutenção', type: 'maintenance', employeeCount: 12 },
  { id: faker.string.uuid(), name: 'Quadra e Pátio', type: 'recreation', employeeCount: 5 },
  { id: faker.string.uuid(), name: 'Portaria', type: 'security', employeeCount: 4 },
  { id: faker.string.uuid(), name: 'Laboratório de Ciências', type: 'educational', employeeCount: 3 },
  { id: faker.string.uuid(), name: 'Biblioteca', type: 'educational', employeeCount: 5 },
].map(env => ({
  ...env,
  schoolId: school.id,
  description: `Setor ${env.name} da escola`,
  createdAt: faker.date.past({ years: 1 }).toISOString(),
}))

// Risk categories (13 MTE)
const riskCategories = [
  { key: 'overwork', label: 'Sobrecarga de trabalho' },
  { key: 'moral_harassment', label: 'Assédio moral' },
  { key: 'poor_relationships', label: 'Relacionamentos prejudiciais' },
  { key: 'lack_of_support', label: 'Falta de suporte da gestão' },
  { key: 'low_autonomy', label: 'Baixo controle/autonomia' },
  { key: 'role_clarity', label: 'Baixa clareza de papéis' },
  { key: 'poor_communication', label: 'Comunicação deficiente' },
  { key: 'low_justice', label: 'Baixa justiça organizacional' },
  { key: 'change_management', label: 'Gestão de mudanças' },
  { key: 'violence_trauma', label: 'Eventos violentos/traumáticos' },
  { key: 'difficult_conditions', label: 'Condições de trabalho difíceis' },
  { key: 'sexual_harassment', label: 'Assédio sexual' },
  { key: 'underwork', label: 'Subutilização' },
] as const

const riskLevels = ['low', 'medium', 'high', 'critical'] as const
const riskStatuses = ['identified', 'treating', 'controlled', 'eliminated'] as const

function calcRiskLevel(prob: number, sev: number): typeof riskLevels[number] {
  const score = prob * sev
  if (score >= 16) return 'critical'
  if (score >= 9) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

// Risks
export const risks = Array.from({ length: 24 }, (_, i) => {
  const cat = riskCategories[i % riskCategories.length]
  const env = environments[i % environments.length]
  const prob = faker.number.int({ min: 1, max: 5 })
  const sev = faker.number.int({ min: 1, max: 5 })
  const level = calcRiskLevel(prob, sev)
  const statusWeights = level === 'critical'
    ? ['identified', 'treating', 'identified', 'treating']
    : ['identified', 'treating', 'controlled', 'eliminated']

  return {
    id: faker.string.uuid(),
    schoolId: school.id,
    environmentId: env.id,
    environmentName: env.name,
    assessmentId: null,
    name: `${cat.label} - ${env.name}`,
    description: faker.lorem.sentence(),
    category: cat.key,
    categoryLabel: cat.label,
    probability: prob,
    severity: sev,
    riskLevel: level,
    status: statusWeights[i % statusWeights.length] as typeof riskStatuses[number],
    identifiedAt: faker.date.past({ years: 0.5 }).toISOString().split('T')[0],
    responsibleName: faker.person.fullName(),
    createdAt: faker.date.past({ years: 0.5 }).toISOString(),
  }
})

// Action Plans
const planStatuses = ['pending', 'in_progress', 'completed', 'verified', 'overdue'] as const
export const actionPlans = risks
  .filter(r => r.status === 'treating' || r.status === 'controlled')
  .map(risk => ({
    id: faker.string.uuid(),
    riskId: risk.id,
    schoolId: school.id,
    title: `Plano de ação: ${risk.categoryLabel}`,
    description: faker.lorem.paragraph(),
    actionType: faker.helpers.arrayElement(['preventive', 'corrective', 'monitoring']),
    responsibleName: faker.person.fullName(),
    deadline: faker.date.future({ years: 0.5 }).toISOString().split('T')[0],
    status: faker.helpers.arrayElement(planStatuses),
    createdAt: faker.date.past({ years: 0.3 }).toISOString(),
  }))

// Employees
export const employees = Array.from({ length: 87 }, () => {
  const env = faker.helpers.arrayElement(environments)
  return {
    id: faker.string.uuid(),
    schoolId: school.id,
    environmentId: env.id,
    environmentName: env.name,
    name: faker.person.fullName(),
    cpf: faker.string.numeric({ length: 11 }),
    role: faker.helpers.arrayElement(['Professor', 'Coordenador', 'Auxiliar de limpeza', 'Cozinheira', 'Secretária', 'Porteiro', 'Bibliotecária', 'Monitor']),
    admissionDate: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    status: faker.helpers.weightedArrayElement([
      { value: 'active', weight: 85 },
      { value: 'on_leave', weight: 8 },
      { value: 'inactive', weight: 7 },
    ]),
    email: faker.internet.email(),
    createdAt: faker.date.past({ years: 3 }).toISOString(),
  }
})

// Medical certificates
export const medicalCertificates = Array.from({ length: 15 }, () => {
  const emp = faker.helpers.arrayElement(employees.filter(e => e.status !== 'inactive'))
  const isMentalHealth = faker.datatype.boolean({ probability: 0.4 })
  return {
    id: faker.string.uuid(),
    employeeId: emp.id,
    employeeName: emp.name,
    schoolId: school.id,
    issueDate: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
    daysOff: faker.number.int({ min: 1, max: 30 }),
    icdCode: isMentalHealth
      ? faker.helpers.arrayElement(['F41.1', 'F32.0', 'F43.1', 'F41.0', 'F32.1'])
      : faker.helpers.arrayElement(['J06.9', 'M54.5', 'K29.7', 'R51']),
    isMentalHealth,
    doctorName: `Dr. ${faker.person.fullName()}`,
    returnDate: faker.date.future({ years: 0.1 }).toISOString().split('T')[0],
    inssReferral: faker.datatype.boolean({ probability: 0.15 }),
    nexusRisk: isMentalHealth
      ? faker.helpers.arrayElement(['low', 'medium', 'high'])
      : 'none',
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
  }
})

// Trainings
export const trainings = [
  { title: 'Prevenção de Assédio Moral no Ambiente Escolar', type: 'mandatory', status: 'completed', attendees: 72 },
  { title: 'Gestão de Estresse e Saúde Mental', type: 'mandatory', status: 'scheduled', attendees: 0 },
  { title: 'Comunicação Não-Violenta', type: 'recommended', status: 'completed', attendees: 45 },
  { title: 'Primeiros Socorros Psicológicos', type: 'mandatory', status: 'in_progress', attendees: 30 },
  { title: 'NR-1 e Riscos Psicossociais - Obrigações Legais', type: 'mandatory', status: 'completed', attendees: 85 },
  { title: 'Mediação de Conflitos', type: 'recommended', status: 'scheduled', attendees: 0 },
].map(t => ({
  ...t,
  id: faker.string.uuid(),
  schoolId: school.id,
  instructor: faker.person.fullName(),
  scheduledDate: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  durationHours: faker.helpers.arrayElement([2, 4, 8]),
  validityMonths: 12,
  createdAt: faker.date.past({ years: 0.5 }).toISOString(),
}))

// Complaints
export const complaints = Array.from({ length: 6 }, (_, i) => ({
  id: faker.string.uuid(),
  schoolId: school.id,
  protocolNumber: `DEN-2026-${String(i + 1).padStart(4, '0')}`,
  category: faker.helpers.arrayElement(['moral_harassment', 'sexual_harassment', 'poor_relationships', 'difficult_conditions']),
  sectorReported: faker.helpers.arrayElement(environments).name,
  description: faker.lorem.paragraph(),
  isAnonymous: true,
  status: faker.helpers.arrayElement(['received', 'under_review', 'investigating', 'resolved', 'dismissed']),
  resolutionDescription: null,
  assignedTo: faker.person.fullName(),
  createdAt: faker.date.recent({ days: 60 }).toISOString(),
}))

// Dashboard KPIs
const criticalRisks = risks.filter(r => r.riskLevel === 'critical').length
const treatingRisks = risks.filter(r => r.status === 'treating').length
const pendingPlans = actionPlans.filter(p => p.status === 'pending' || p.status === 'overdue').length
const mentalCerts = medicalCertificates.filter(mc => mc.isMentalHealth).length

export const dashboardData = {
  school: {
    name: school.name,
    deadlineDays: Math.ceil((new Date('2026-05-26').getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  },
  kpis: {
    overallRiskScore: 62,
    criticalRisks,
    pendingActionPlans: pendingPlans,
    pendingTrainings: trainings.filter(t => t.status === 'scheduled').length,
    monthCertificates: medicalCertificates.length,
    mentalHealthCertificates: mentalCerts,
    openComplaints: complaints.filter(c => c.status !== 'resolved' && c.status !== 'dismissed').length,
    questionnaireAdhesion: 78,
    totalRisks: risks.length,
    treatingRisks,
    controlledRisks: risks.filter(r => r.status === 'controlled').length,
    totalEmployees: employees.length,
  },
  charts: {
    risksByEnvironment: environments.slice(0, 6).map(env => ({
      name: env.name.split(' - ')[0].split(' e ')[0],
      count: risks.filter(r => r.environmentId === env.id).length,
    })),
    scoreEvolution: Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        score: 45 + Math.floor(Math.random() * 25),
      }
    }),
    riskDistribution: [
      { category: 'Baixo', count: risks.filter(r => r.riskLevel === 'low').length, color: '#10b981' },
      { category: 'Médio', count: risks.filter(r => r.riskLevel === 'medium').length, color: '#f59e0b' },
      { category: 'Alto', count: risks.filter(r => r.riskLevel === 'high').length, color: '#f97316' },
      { category: 'Crítico', count: risks.filter(r => r.riskLevel === 'critical').length, color: '#ef4444' },
    ],
    certificateTrend: Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        total: faker.number.int({ min: 2, max: 8 }),
        mentalHealth: faker.number.int({ min: 0, max: 3 }),
      }
    }),
  },
  alerts: [
    { type: 'critical' as const, message: `${criticalRisks} riscos críticos identificados precisam de ação imediata`, link: '/risks?level=critical' },
    { type: 'warning' as const, message: `${pendingPlans} planos de ação pendentes ou com prazo vencido`, link: '/action-plans?status=overdue' },
    { type: 'info' as const, message: `Adesão ao questionário COPSOQ: 78% — meta: 80%`, link: '/assessments' },
  ],
}
