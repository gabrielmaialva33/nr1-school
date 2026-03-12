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
  responsible_name: 'Ana Carolina Mendes',
  employee_count: 87,
  plan_type: 'professional' as const,
}

// Users
export const currentUser = {
  id: faker.string.uuid(),
  school_id: school.id,
  name: 'Ana Carolina Mendes',
  email: 'ana.mendes@escolamhelena.edu.br',
  role: 'admin' as const,
  is_active: true,
  avatar: null,
  last_login: new Date().toISOString(),
}

// Environments (Setores)
export const environments = [
  { id: faker.string.uuid(), name: 'Sala de Aula - Ensino Fundamental', type: 'educational', employee_count: 22 },
  { id: faker.string.uuid(), name: 'Sala de Aula - Ensino Médio', type: 'educational', employee_count: 18 },
  { id: faker.string.uuid(), name: 'Secretaria', type: 'administrative', employee_count: 6 },
  { id: faker.string.uuid(), name: 'Direção', type: 'administrative', employee_count: 4 },
  { id: faker.string.uuid(), name: 'Cozinha e Refeitório', type: 'food', employee_count: 8 },
  { id: faker.string.uuid(), name: 'Limpeza e Manutenção', type: 'maintenance', employee_count: 12 },
  { id: faker.string.uuid(), name: 'Quadra e Pátio', type: 'recreation', employee_count: 5 },
  { id: faker.string.uuid(), name: 'Portaria', type: 'security', employee_count: 4 },
  { id: faker.string.uuid(), name: 'Laboratório de Ciências', type: 'educational', employee_count: 3 },
  { id: faker.string.uuid(), name: 'Biblioteca', type: 'educational', employee_count: 5 },
].map(env => ({
  ...env,
  school_id: school.id,
  description: `Setor ${env.name} da escola`,
  created_at: faker.date.past({ years: 1 }).toISOString(),
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

// Realistic risk descriptions per category
const riskDescriptions: Record<string, string[]> = {
  overwork: [
    'Professores relatam carga horária excessiva com 40+ horas semanais, incluindo trabalho aos finais de semana para preparação de aulas.',
    'Acúmulo de funções pedagógicas e administrativas gerando esgotamento físico e mental nos docentes do turno integral.',
  ],
  moral_harassment: [
    'Relatos de intimidação e pressão excessiva por resultados em avaliações externas, com exposição pública de desempenho individual.',
    'Coordenação utiliza ameaças veladas de transferência como forma de controle, criando ambiente de medo e insegurança.',
  ],
  poor_relationships: [
    'Conflitos recorrentes entre equipes de diferentes turnos por uso de recursos compartilhados e espaços comuns.',
    'Falta de integração entre corpo docente e equipe de apoio, gerando isolamento e dificuldade de comunicação.',
  ],
  lack_of_support: [
    'Ausência de suporte psicológico para professores que lidam com alunos em situação de vulnerabilidade social.',
    'Gestão não oferece recursos adequados para capacitação continuada, limitando o desenvolvimento profissional.',
  ],
  low_autonomy: [
    'Professores sem autonomia para adaptar conteúdo programático às necessidades específicas de cada turma.',
    'Decisões pedagógicas centralizadas na direção sem participação do corpo docente nas escolhas metodológicas.',
  ],
  role_clarity: [
    'Funcionários de apoio assumem tarefas fora de suas atribuições sem orientação clara, gerando sobrecarga.',
    'Falta de descrição formal de cargos causa conflitos sobre responsabilidades entre coordenação e professores.',
  ],
  poor_communication: [
    'Mudanças de cronograma e diretrizes comunicadas de última hora, impedindo planejamento adequado das atividades.',
    'Canais de comunicação fragmentados entre WhatsApp, mural e e-mail, causando perda de informações importantes.',
  ],
  low_justice: [
    'Critérios de promoção e bonificação percebidos como desiguais, favorecendo funcionários com maior proximidade da gestão.',
    'Distribuição desigual de turmas e horários entre professores com mesmo nível de experiência.',
  ],
  change_management: [
    'Implementação abrupta de novo sistema pedagógico digital sem treinamento adequado para os docentes.',
    'Reestruturação de turnos sem consulta prévia aos funcionários afetados, gerando resistência e desmotivação.',
  ],
  violence_trauma: [
    'Episódios de agressão verbal de pais contra professores durante reuniões, sem protocolo de proteção.',
    'Funcionários da portaria expostos a situações de ameaça no entorno escolar, sem suporte psicológico.',
  ],
  difficult_conditions: [
    'Salas de aula com ventilação precária e temperatura elevada, afetando concentração e bem-estar dos profissionais.',
    'Equipamentos da cozinha em mau estado de conservação, gerando risco ergonômico e estresse operacional.',
  ],
  sexual_harassment: [
    'Relato de comportamento inadequado com conotação sexual durante confraternização escolar, envolvendo superior hierárquico.',
    'Comentários inapropriados recorrentes sobre aparência física direcionados a funcionárias do setor administrativo.',
  ],
  underwork: [
    'Monitores com tempo ocioso excessivo fora dos horários de intervalo, sem atribuições complementares definidas.',
    'Bibliotecária com subutilização de competências, limitada a tarefas repetitivas de organização de acervo.',
  ],
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
  const descriptions = riskDescriptions[cat.key] || ['Risco identificado durante avaliação do ambiente de trabalho.']

  return {
    id: faker.string.uuid(),
    school_id: school.id,
    environment_id: env.id,
    environment_name: env.name,
    assessment_id: null,
    name: `${cat.label} - ${env.name}`,
    description: descriptions[i % descriptions.length],
    category: cat.key,
    category_label: cat.label,
    probability: prob,
    severity: sev,
    risk_level: level,
    status: statusWeights[i % statusWeights.length] as typeof riskStatuses[number],
    identified_at: faker.date.past({ years: 0.5 }).toISOString().split('T')[0],
    responsible_name: faker.person.fullName(),
    created_at: faker.date.past({ years: 0.5 }).toISOString(),
  }
})

// Action Plans
const planStatuses = ['pending', 'in_progress', 'completed', 'verified', 'overdue'] as const
const planDescriptions = [
  'Implementar programa de rodízio de turmas para reduzir a carga sobre professores com maior volume de alunos.',
  'Criar canal de escuta ativa com psicólogo organizacional para atendimento quinzenal dos funcionários.',
  'Estabelecer comitê de mediação de conflitos com representantes de cada setor da escola.',
  'Revisar e documentar atribuições de cada cargo, distribuindo cópia para todos os funcionários.',
  'Organizar capacitação em comunicação não-violenta para lideranças e coordenadores.',
  'Instalar sistema de climatização nas salas de aula do bloco B conforme laudo técnico.',
  'Realizar pesquisa de clima organizacional trimestral com devolutiva transparente dos resultados.',
  'Implementar protocolo de acolhimento para funcionários vítimas de agressão verbal por parte de pais.',
  'Criar grupo de trabalho para revisão dos critérios de distribuição de turmas e horários.',
  'Estabelecer programa de mentoria entre professores experientes e recém-contratados.',
]
const planStatusWeights = ['in_progress', 'pending', 'completed', 'verified', 'overdue', 'in_progress', 'completed', 'pending', 'overdue', 'verified'] as const
export const actionPlans = risks
  .filter(r => r.status === 'treating' || r.status === 'controlled')
  .map((risk, i) => {
    const status = planStatusWeights[i % planStatusWeights.length]
    const deadline = status === 'overdue'
      ? faker.date.past({ years: 0.3 }).toISOString().split('T')[0]
      : faker.date.future({ years: 0.5 }).toISOString().split('T')[0]

    return {
      id: faker.string.uuid(),
      risk_id: risk.id,
      school_id: school.id,
      title: `Plano de ação: ${risk.category_label}`,
      description: planDescriptions[i % planDescriptions.length],
      action_type: faker.helpers.arrayElement(['preventive', 'corrective', 'monitoring']),
      responsible_name: faker.person.fullName(),
      deadline,
      status,
      created_at: faker.date.past({ years: 0.3 }).toISOString(),
    }
  })

// Employees
export const employees = Array.from({ length: 87 }, () => {
  const env = faker.helpers.arrayElement(environments)
  return {
    id: faker.string.uuid(),
    school_id: school.id,
    environment_id: env.id,
    environment_name: env.name,
    name: faker.person.fullName(),
    cpf: faker.string.numeric({ length: 11 }),
    role: faker.helpers.arrayElement(['Professor', 'Coordenador', 'Auxiliar de limpeza', 'Cozinheira', 'Secretária', 'Porteiro', 'Bibliotecária', 'Monitor']),
    admission_date: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    status: faker.helpers.weightedArrayElement([
      { value: 'active', weight: 85 },
      { value: 'on_leave', weight: 8 },
      { value: 'inactive', weight: 7 },
    ]),
    email: faker.internet.email(),
    created_at: faker.date.past({ years: 3 }).toISOString(),
  }
})

// Medical certificates — predefined ICD codes for controlled distribution
const medCertEntries: Array<{ icd_code: string; is_mental_health: boolean; days_off: number; inss_referral: boolean; nexus_risk: string }> = [
  // Mental health cases (14 entries — more weight)
  { icd_code: 'F41.1', is_mental_health: true, days_off: 15, inss_referral: false, nexus_risk: 'high' },
  { icd_code: 'F32.0', is_mental_health: true, days_off: 30, inss_referral: true, nexus_risk: 'high' },
  { icd_code: 'F43.1', is_mental_health: true, days_off: 20, inss_referral: false, nexus_risk: 'medium' },
  { icd_code: 'F41.0', is_mental_health: true, days_off: 7, inss_referral: false, nexus_risk: 'medium' },
  { icd_code: 'F32.1', is_mental_health: true, days_off: 30, inss_referral: true, nexus_risk: 'high' },
  { icd_code: 'F48.0', is_mental_health: true, days_off: 14, inss_referral: false, nexus_risk: 'high' },
  { icd_code: 'F41.1', is_mental_health: true, days_off: 10, inss_referral: false, nexus_risk: 'medium' },
  { icd_code: 'F32.0', is_mental_health: true, days_off: 5, inss_referral: false, nexus_risk: 'low' },
  { icd_code: 'F43.1', is_mental_health: true, days_off: 30, inss_referral: true, nexus_risk: 'high' },
  { icd_code: 'F48.0', is_mental_health: true, days_off: 21, inss_referral: true, nexus_risk: 'high' },
  { icd_code: 'F41.0', is_mental_health: true, days_off: 3, inss_referral: false, nexus_risk: 'low' },
  { icd_code: 'F32.1', is_mental_health: true, days_off: 15, inss_referral: false, nexus_risk: 'medium' },
  { icd_code: 'F41.1', is_mental_health: true, days_off: 7, inss_referral: false, nexus_risk: 'medium' },
  { icd_code: 'F48.0', is_mental_health: true, days_off: 30, inss_referral: true, nexus_risk: 'high' },
  // Non-mental-health cases (11 entries)
  { icd_code: 'J06.9', is_mental_health: false, days_off: 3, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'M54.5', is_mental_health: false, days_off: 5, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'K29.7', is_mental_health: false, days_off: 2, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'R51', is_mental_health: false, days_off: 1, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'S93.4', is_mental_health: false, days_off: 10, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'M75.1', is_mental_health: false, days_off: 14, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'J06.9', is_mental_health: false, days_off: 5, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'M54.5', is_mental_health: false, days_off: 7, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'R51', is_mental_health: false, days_off: 2, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'K29.7', is_mental_health: false, days_off: 3, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'S93.4', is_mental_health: false, days_off: 15, inss_referral: true, nexus_risk: 'none' },
]

export const medicalCertificates = medCertEntries.map(entry => {
  const emp = faker.helpers.arrayElement(employees.filter(e => e.status !== 'inactive'))
  const issueDate = faker.date.recent({ days: 120 })
  const issueDateStr = issueDate.toISOString().split('T')[0]
  const returnDate = new Date(issueDate.getTime() + entry.days_off * 86400000).toISOString().split('T')[0]
  return {
    id: faker.string.uuid(),
    employee_id: emp.id,
    employee_name: emp.name,
    school_id: school.id,
    issue_date: issueDateStr,
    days_off: entry.days_off,
    icd_code: entry.icd_code,
    is_mental_health: entry.is_mental_health,
    doctor_name: `Dr. ${faker.person.fullName()}`,
    return_date: returnDate,
    inss_referral: entry.inss_referral,
    nexus_risk: entry.nexus_risk,
    created_at: issueDate.toISOString(),
  }
})

// Trainings
export const trainings = [
  { title: 'Prevenção de Assédio Moral no Ambiente Escolar', type: 'mandatory', status: 'completed', attendees: 72, duration_hours: 8 },
  { title: 'Gestão de Estresse e Saúde Mental', type: 'mandatory', status: 'scheduled', attendees: 0, duration_hours: 4 },
  { title: 'Comunicação Não-Violenta', type: 'recommended', status: 'completed', attendees: 45, duration_hours: 4 },
  { title: 'Primeiros Socorros Psicológicos', type: 'mandatory', status: 'in_progress', attendees: 30, duration_hours: 8 },
  { title: 'NR-1 e Riscos Psicossociais - Obrigações Legais', type: 'mandatory', status: 'completed', attendees: 85, duration_hours: 16 },
  { title: 'Mediação de Conflitos', type: 'recommended', status: 'scheduled', attendees: 0, duration_hours: 4 },
  { title: 'Liderança Humanizada e Gestão de Pessoas', type: 'recommended', status: 'completed', attendees: 38, duration_hours: 8 },
  { title: 'Ergonomia Cognitiva e Carga Mental', type: 'mandatory', status: 'in_progress', attendees: 22, duration_hours: 4 },
  { title: 'Prevenção ao Burnout', type: 'mandatory', status: 'completed', attendees: 67, duration_hours: 8 },
  { title: 'Assédio Sexual - Identificação e Combate', type: 'mandatory', status: 'scheduled', attendees: 0, duration_hours: 4 },
  { title: 'Diversidade e Inclusão no Ambiente Escolar', type: 'recommended', status: 'completed', attendees: 53, duration_hours: 2 },
  { title: 'Gestão de Crises e Eventos Traumáticos', type: 'mandatory', status: 'in_progress', attendees: 15, duration_hours: 16 },
  { title: 'Saúde Mental do Educador', type: 'recommended', status: 'scheduled', attendees: 0, duration_hours: 8 },
  { title: 'Compliance Trabalhista e NR-1', type: 'mandatory', status: 'completed', attendees: 80, duration_hours: 16 },
].map(t => ({
  ...t,
  id: faker.string.uuid(),
  school_id: school.id,
  instructor: faker.person.fullName(),
  scheduled_date: faker.date.recent({ days: 60 }).toISOString().split('T')[0],
  validity_months: 12,
  created_at: faker.date.past({ years: 0.5 }).toISOString(),
}))

function toIsoDate(value: Date) {
  return value.toISOString().split('T')[0]
}

function addMonthsToIsoDate(baseDate: string, months: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setMonth(date.getMonth() + months)
  return toIsoDate(date)
}

function addDaysToIsoDate(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

function getSeedValue(input: string) {
  return input.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
}

const complianceReadyTrainings = trainings.filter(training => training.status !== 'scheduled')

const ppeCatalogByRole: Record<string, Array<{ item_name: string; ca_number: string; replacement_cycle_days: number }>> = {
  Professor: [
    { item_name: 'Protetor auricular de inserção', ca_number: 'CA 42111', replacement_cycle_days: 180 },
    { item_name: 'Luva para apoio em atividades laboratoriais', ca_number: 'CA 39871', replacement_cycle_days: 180 },
  ],
  Coordenador: [
    { item_name: 'Colete de brigada escolar', ca_number: 'CA 28741', replacement_cycle_days: 365 },
  ],
  'Auxiliar de limpeza': [
    { item_name: 'Luva nitrílica de proteção química', ca_number: 'CA 33458', replacement_cycle_days: 120 },
    { item_name: 'Bota impermeável PVC', ca_number: 'CA 40218', replacement_cycle_days: 180 },
  ],
  Cozinheira: [
    { item_name: 'Luva térmica para cozinha industrial', ca_number: 'CA 31109', replacement_cycle_days: 180 },
    { item_name: 'Avental térmico impermeável', ca_number: 'CA 28763', replacement_cycle_days: 240 },
  ],
  Secretária: [
    { item_name: 'Protetor auricular para eventos escolares', ca_number: 'CA 42111', replacement_cycle_days: 365 },
  ],
  Porteiro: [
    { item_name: 'Colete refletivo', ca_number: 'CA 29564', replacement_cycle_days: 365 },
    { item_name: 'Capa impermeável de segurança', ca_number: 'CA 34420', replacement_cycle_days: 240 },
  ],
  'Bibliotecária': [
    { item_name: 'Máscara PFF2 para higienização de acervo', ca_number: 'CA 38992', replacement_cycle_days: 120 },
  ],
  Monitor: [
    { item_name: 'Colete refletivo para pátio e embarque', ca_number: 'CA 29564', replacement_cycle_days: 240 },
  ],
}

export const employeeTrainingEnrollments = employees.flatMap((employee, index) => {
  const seed = getSeedValue(employee.id)
  const assignmentCount = employee.status === 'active' ? 2 : 1

  return Array.from({ length: assignmentCount }, (_, offset) => {
    const training = complianceReadyTrainings[(seed + offset + index) % complianceReadyTrainings.length]
    const completedAt = toIsoDate(faker.date.recent({ days: 180 }))
    const status = offset === assignmentCount - 1 && employee.status === 'on_leave' ? 'in_progress' : 'completed'

    return {
      id: faker.string.uuid(),
      tenant_id: school.id,
      employee_id: employee.id,
      training_id: training.id,
      status,
      completed_at: status === 'completed' ? completedAt : null,
      valid_until: status === 'completed' ? addMonthsToIsoDate(completedAt, training.validity_months) : null,
      instructor_name: training.instructor,
      created_at: faker.date.recent({ days: 240 }).toISOString(),
    }
  })
})

export const employeePpeDeliveries = employees.map((employee, index) => {
  const availableItems = ppeCatalogByRole[employee.role] ?? [
    { item_name: 'Kit básico de segurança ocupacional', ca_number: 'CA 10000', replacement_cycle_days: 180 },
  ]
  const seed = getSeedValue(employee.id)
  const selectedItem = availableItems[(seed + index) % availableItems.length]
  const deliveredAt = toIsoDate(faker.date.recent({ days: 210 }))

  return {
    id: faker.string.uuid(),
    tenant_id: school.id,
    employee_id: employee.id,
    item_name: selectedItem.item_name,
    ca_number: selectedItem.ca_number,
    delivered_at: deliveredAt,
    next_replacement_at: addDaysToIsoDate(deliveredAt, selectedItem.replacement_cycle_days),
    signed_at: deliveredAt,
    created_at: faker.date.recent({ days: 210 }).toISOString(),
  }
})

function getDocumentStatus(expiresAt: string | null) {
  if (!expiresAt) return 'pending_validation' as const

  const expirationDate = new Date(`${expiresAt}T00:00:00`)
  const now = new Date()
  const diffInDays = Math.ceil((expirationDate.getTime() - now.getTime()) / 86400000)

  if (diffInDays <= 45) return 'expiring_soon' as const
  return 'validated' as const
}

export const employeeComplianceDocuments = [
  ...employeeTrainingEnrollments
    .filter(enrollment => enrollment.status === 'completed')
    .map(enrollment => ({
      id: faker.string.uuid(),
      tenant_id: enrollment.tenant_id,
      employee_id: enrollment.employee_id,
      training_enrollment_id: enrollment.id,
      ppe_delivery_id: null,
      document_type: 'training_certificate' as const,
      file_name: `certificado-${enrollment.employee_id.slice(0, 6)}-${enrollment.training_id.slice(0, 6)}.pdf`,
      mime_type: 'application/pdf',
      file_size_bytes: faker.number.int({ min: 250_000, max: 1_900_000 }),
      issued_at: enrollment.completed_at ?? toIsoDate(new Date()),
      expires_at: enrollment.valid_until,
      status: getDocumentStatus(enrollment.valid_until),
      notes: 'Certificado anexado ao prontuário ocupacional do colaborador.',
      uploaded_at: faker.date.recent({ days: 120 }).toISOString(),
    })),
  ...employeePpeDeliveries.map(delivery => ({
    id: faker.string.uuid(),
    tenant_id: delivery.tenant_id,
    employee_id: delivery.employee_id,
    training_enrollment_id: null,
    ppe_delivery_id: delivery.id,
    document_type: 'ppe_delivery_receipt' as const,
    file_name: `entrega-epi-${delivery.employee_id.slice(0, 6)}-${delivery.id.slice(0, 6)}.pdf`,
    mime_type: 'application/pdf',
    file_size_bytes: faker.number.int({ min: 180_000, max: 980_000 }),
    issued_at: delivery.delivered_at,
    expires_at: delivery.next_replacement_at,
    status: getDocumentStatus(delivery.next_replacement_at),
    notes: 'Comprovante assinado pelo colaborador no ato da entrega.',
    uploaded_at: faker.date.recent({ days: 120 }).toISOString(),
  })),
]

// Complaints
const complaintCategoryLabels: Record<string, string> = {
  moral_harassment: 'Assédio Moral',
  sexual_harassment: 'Assédio Sexual',
  poor_relationships: 'Relacionamentos Prejudiciais',
  difficult_conditions: 'Condições Difíceis',
  violence_trauma: 'Violência/Trauma',
}

const complaintEntries: Array<{
  category: string
  description: string
  is_anonymous: boolean
  status: string
  resolution_description: string | null
}> = [
  {
    category: 'moral_harassment',
    description: 'Coordenadora faz comentários depreciativos sobre o trabalho dos professores na frente dos alunos e outros colegas, causando constrangimento.',
    is_anonymous: true,
    status: 'received',
    resolution_description: null,
  },
  {
    category: 'sexual_harassment',
    description: 'Superior hierárquico faz comentários inapropriados e convites insistentes fora do ambiente de trabalho para funcionária do setor administrativo.',
    is_anonymous: true,
    status: 'under_review',
    resolution_description: null,
  },
  {
    category: 'poor_relationships',
    description: 'Conflito recorrente entre equipes do turno matutino e vespertino pela utilização dos materiais didáticos e equipamentos compartilhados.',
    is_anonymous: false,
    status: 'investigating',
    resolution_description: null,
  },
  {
    category: 'difficult_conditions',
    description: 'Sala dos professores sem ventilação adequada, com mofo visível nas paredes e goteiras no período de chuvas, afetando a saúde dos ocupantes.',
    is_anonymous: false,
    status: 'resolved',
    resolution_description: 'Manutenção predial realizada com instalação de ventilação mecânica e reparo do telhado. Laudo sanitário emitido confirmando adequação do ambiente.',
  },
  {
    category: 'moral_harassment',
    description: 'Professora relata ser excluída sistematicamente de reuniões pedagógicas e ter informações sobre mudanças de cronograma retidas pela coordenação.',
    is_anonymous: true,
    status: 'dismissed',
    resolution_description: null,
  },
  {
    category: 'moral_harassment',
    description: 'Funcionários da limpeza relatam pressão excessiva por produtividade com ameaças veladas de demissão por parte do encarregado do setor.',
    is_anonymous: true,
    status: 'under_review',
    resolution_description: null,
  },
  {
    category: 'violence_trauma',
    description: 'Pai de aluno invadiu a secretaria e agrediu verbalmente a funcionária responsável pelo atendimento, proferindo ameaças de morte após discordância sobre matrícula.',
    is_anonymous: false,
    status: 'investigating',
    resolution_description: null,
  },
  {
    category: 'sexual_harassment',
    description: 'Funcionária do refeitório denuncia que colega de trabalho envia mensagens com conteúdo sexual pelo WhatsApp e faz gestos inapropriados durante o expediente.',
    is_anonymous: true,
    status: 'resolved',
    resolution_description: 'Investigação concluída com comprovação dos fatos. Aplicada advertência formal ao denunciado e realocação para turno diferente. Encaminhamento para treinamento obrigatório.',
  },
  {
    category: 'poor_relationships',
    description: 'Grupo de professores do Ensino Médio pratica exclusão social contra professor recém-contratado, recusando-se a compartilhar materiais e ignorando-o em atividades coletivas.',
    is_anonymous: false,
    status: 'received',
    resolution_description: null,
  },
  {
    category: 'difficult_conditions',
    description: 'Cozinheiras trabalham com forno industrial defeituoso que superaquece o ambiente, atingindo temperaturas acima de 40°C sem exaustor funcionando.',
    is_anonymous: false,
    status: 'resolved',
    resolution_description: 'Forno substituído por modelo novo com isolamento térmico. Instalado exaustor industrial e medição de temperatura semanal implementada.',
  },
  {
    category: 'moral_harassment',
    description: 'Diretor expõe publicamente em reunião geral os nomes dos professores cujas turmas tiveram pior desempenho no simulado, comparando-os de forma humilhante.',
    is_anonymous: true,
    status: 'investigating',
    resolution_description: null,
  },
  {
    category: 'violence_trauma',
    description: 'Porteiro foi ameaçado com arma branca por indivíduo que tentou invadir a escola no horário de saída dos alunos. Funcionário está em acompanhamento psicológico.',
    is_anonymous: false,
    status: 'resolved',
    resolution_description: 'Boletim de ocorrência registrado. Reforço na segurança com instalação de câmeras e contratação de vigilante no horário de pico. Funcionário em acompanhamento pelo SESMT.',
  },
  {
    category: 'moral_harassment',
    description: 'Coordenadora pedagógica exige que professora trabalhe durante o horário de almoço para "compensar" atrasos, mesmo apresentando atestado médico de acompanhamento.',
    is_anonymous: true,
    status: 'under_review',
    resolution_description: null,
  },
  {
    category: 'poor_relationships',
    description: 'Funcionários da manutenção e da limpeza relatam tratamento diferenciado pela gestão: enquanto administrativos ganham café e lanche, equipe operacional é ignorada nas confraternizações.',
    is_anonymous: false,
    status: 'dismissed',
    resolution_description: null,
  },
  {
    category: 'sexual_harassment',
    description: 'Professora relata que durante evento escolar noturno, superior hierárquico a encurralou em sala vazia e tentou contato físico não consentido.',
    is_anonymous: true,
    status: 'investigating',
    resolution_description: null,
  },
  {
    category: 'violence_trauma',
    description: 'Professora do fundamental sofreu crise de pânico após episódio de briga violenta entre alunos dentro da sala de aula, sem suporte imediato da coordenação.',
    is_anonymous: false,
    status: 'received',
    resolution_description: null,
  },
]

export const complaints = complaintEntries.map((entry, i) => ({
  id: faker.string.uuid(),
  school_id: school.id,
  protocol_number: `DEN-2026-${String(i + 1).padStart(4, '0')}`,
  category: entry.category,
  category_label: complaintCategoryLabels[entry.category],
  sector_reported: faker.helpers.arrayElement(environments).name,
  description: entry.description,
  is_anonymous: entry.is_anonymous,
  status: entry.status,
  resolution_description: entry.resolution_description,
  assigned_to: faker.person.fullName(),
  created_at: faker.date.recent({ days: 90 }).toISOString(),
}))

// Dashboard KPIs
const criticalRisks = risks.filter(r => r.risk_level === 'critical').length
const treatingRisks = risks.filter(r => r.status === 'treating').length
const pendingPlans = actionPlans.filter(p => p.status === 'pending' || p.status === 'overdue').length
const overduePlans = actionPlans.filter(p => p.status === 'overdue').length
const mentalCerts = medicalCertificates.filter(mc => mc.is_mental_health).length

export const dashboardData = {
  school: {
    name: school.name,
    deadline_days: Math.ceil((new Date('2026-05-26').getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  },
  kpis: {
    overall_risk_score: 62,
    critical_risks: criticalRisks,
    pending_action_plans: pendingPlans,
    pending_trainings: trainings.filter(t => t.status === 'scheduled').length,
    month_certificates: medicalCertificates.length,
    mental_health_certificates: mentalCerts,
    open_complaints: complaints.filter(c => c.status !== 'resolved' && c.status !== 'dismissed').length,
    questionnaire_adhesion: 78,
    total_risks: risks.length,
    treating_risks: treatingRisks,
    controlled_risks: risks.filter(r => r.status === 'controlled').length,
    total_employees: employees.length,
  },
  charts: {
    risks_by_environment: environments.slice(0, 6).map(env => ({
      name: env.name,
      count: risks.filter(r => r.environment_id === env.id).length,
    })),
    score_evolution: Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        score: 45 + Math.floor(Math.random() * 25),
      }
    }),
    risk_distribution: [
      { category: 'Baixo', count: risks.filter(r => r.risk_level === 'low').length, color: '#10b981' },
      { category: 'Médio', count: risks.filter(r => r.risk_level === 'medium').length, color: '#f59e0b' },
      { category: 'Alto', count: risks.filter(r => r.risk_level === 'high').length, color: '#f97316' },
      { category: 'Crítico', count: risks.filter(r => r.risk_level === 'critical').length, color: '#ef4444' },
    ],
    certificate_trend: Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return {
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        total: faker.number.int({ min: 2, max: 8 }),
        mental_health: faker.number.int({ min: 0, max: 3 }),
      }
    }),
  },
  alerts: [
    { type: 'critical' as const, message: `${criticalRisks} riscos críticos identificados precisam de ação imediata`, link: '/risks?level=critical' },
    { type: 'warning' as const, message: `${overduePlans} planos de ação com prazo vencido exigem atenção`, link: '/action-plans?status=overdue' },
    { type: 'info' as const, message: `Adesão ao questionário COPSOQ: 78% — meta: 80%`, link: '/assessments' },
  ],
}
