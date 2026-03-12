import { faker } from '@faker-js/faker/locale/pt_BR'

export const DEMO_PASSWORD = 'demo123'

export interface TenantProfile {
  seed: number
  school_name: string
  cnpj: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  responsible_name: string
  responsible_email: string
  plan_type: 'professional' | 'enterprise'
  employee_count: number
}

export const tenantProfiles: TenantProfile[] = [
  {
    seed: 42,
    school_name: 'Escola Estadual Prof. Maria Helena Souza',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Palmeiras, 456 - Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3456-7890',
    email: 'contato@mariahelena.demo.br',
    responsible_name: 'Ana Carolina Mendes',
    responsible_email: 'ana.mendes@mariahelena.demo.br',
    plan_type: 'professional',
    employee_count: 87,
  },
  {
    seed: 84,
    school_name: 'Colégio Municipal Parque das Araucárias',
    cnpj: '27.654.321/0001-44',
    address: 'Av. dos Pinhais, 890 - Boa Vista',
    city: 'Curitiba',
    state: 'PR',
    phone: '(41) 3344-8899',
    email: 'contato@araucarias.demo.br',
    responsible_name: 'Bruno Henrique Lima',
    responsible_email: 'bruno.lima@araucarias.demo.br',
    plan_type: 'enterprise',
    employee_count: 64,
  },
  {
    seed: 126,
    school_name: 'Centro Educacional Nova Horizonte',
    cnpj: '55.901.246/0001-12',
    address: 'Rua Serra da Mantiqueira, 210 - Savassi',
    city: 'Belo Horizonte',
    state: 'MG',
    phone: '(31) 3222-4455',
    email: 'contato@novahorizonte.demo.br',
    responsible_name: 'Carla Fernanda Rocha',
    responsible_email: 'carla.rocha@novahorizonte.demo.br',
    plan_type: 'professional',
    employee_count: 112,
  },
]

const baseEnvironments = [
  { name: 'Sala de Aula - Ensino Fundamental', type: 'educational', employee_ratio: 0.23 },
  { name: 'Sala de Aula - Ensino Médio', type: 'educational', employee_ratio: 0.18 },
  { name: 'Secretaria', type: 'administrative', employee_ratio: 0.07 },
  { name: 'Direção', type: 'administrative', employee_ratio: 0.04 },
  { name: 'Cozinha e Refeitório', type: 'food', employee_ratio: 0.09 },
  { name: 'Limpeza e Manutenção', type: 'maintenance', employee_ratio: 0.14 },
  { name: 'Quadra e Pátio', type: 'recreation', employee_ratio: 0.08 },
  { name: 'Portaria', type: 'security', employee_ratio: 0.05 },
  { name: 'Laboratório de Ciências', type: 'educational', employee_ratio: 0.05 },
  { name: 'Biblioteca', type: 'educational', employee_ratio: 0.07 },
] as const

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

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
type RiskStatus = 'identified' | 'treating' | 'controlled' | 'eliminated'

const riskDescriptions: Record<string, string[]> = {
  overwork: [
    'Professores relatam carga horária excessiva com atividades extraclasse e correção de avaliações fora do expediente.',
    'Acúmulo de funções pedagógicas e administrativas gera esgotamento físico e mental em docentes do turno integral.',
  ],
  moral_harassment: [
    'Relatos de exposição pública de desempenho individual durante reuniões com equipe pedagógica.',
    'Pressão excessiva por metas e ameaças veladas de transferência criam ambiente de medo e insegurança.',
  ],
  poor_relationships: [
    'Conflitos recorrentes entre equipes de diferentes turnos por uso de recursos compartilhados.',
    'Falta de integração entre corpo docente e equipe de apoio, gerando isolamento e dificuldade de comunicação.',
  ],
  lack_of_support: [
    'Ausência de suporte psicológico para profissionais que lidam com alunos em situação de vulnerabilidade social.',
    'Gestão não oferece recursos adequados para capacitação continuada e acompanhamento pós-incidente.',
  ],
  low_autonomy: [
    'Professores sem autonomia para adaptar o conteúdo às necessidades específicas de cada turma.',
    'Decisões pedagógicas centralizadas na direção sem participação do corpo docente.',
  ],
  role_clarity: [
    'Funcionários de apoio assumem tarefas fora de suas atribuições sem orientação formal.',
    'Falta de descrição clara de cargos causa conflitos sobre responsabilidades e prioridades.',
  ],
  poor_communication: [
    'Mudanças de cronograma são comunicadas de última hora, impedindo planejamento adequado.',
    'Canais de comunicação fragmentados causam perda de informações importantes entre setores.',
  ],
  low_justice: [
    'Critérios de promoção e distribuição de turmas são percebidos como desiguais.',
    'Distribuição de horários e demandas não segue critérios transparentes.',
  ],
  change_management: [
    'Implantação de novos sistemas digitais sem treinamento prévio ou transição assistida.',
    'Reestruturação de turnos e rotinas sem consulta prévia aos profissionais afetados.',
  ],
  violence_trauma: [
    'Equipe de atendimento exposta a agressões verbais de responsáveis e alunos, sem protocolo de acolhimento.',
    'Funcionários da portaria relatam eventos de ameaça no entorno escolar e ausência de suporte pós-incidente.',
  ],
  difficult_conditions: [
    'Salas e áreas de apoio com ventilação precária e desconforto térmico recorrente.',
    'Equipamentos operacionais em mau estado de conservação geram estresse e improvisação.',
  ],
  sexual_harassment: [
    'Relatos de comportamento inadequado com conotação sexual envolvendo superior hierárquico.',
    'Comentários inapropriados e insistentes sobre aparência física direcionados a funcionárias administrativas.',
  ],
  underwork: [
    'Profissionais com tempo ocioso elevado fora de picos operacionais, sem atribuições complementares definidas.',
    'Competências de parte da equipe estão subutilizadas em tarefas excessivamente repetitivas.',
  ],
}

const trainingTemplates = [
  { title: 'Prevenção de Assédio Moral no Ambiente Escolar', type: 'mandatory', status: 'completed', duration_hours: 8 },
  { title: 'Gestão de Estresse e Saúde Mental', type: 'mandatory', status: 'scheduled', duration_hours: 4 },
  { title: 'Comunicação Não-Violenta', type: 'recommended', status: 'completed', duration_hours: 4 },
  { title: 'Primeiros Socorros Psicológicos', type: 'mandatory', status: 'in_progress', duration_hours: 8 },
  { title: 'NR-1 e Riscos Psicossociais - Obrigações Legais', type: 'mandatory', status: 'completed', duration_hours: 16 },
  { title: 'Mediação de Conflitos', type: 'recommended', status: 'scheduled', duration_hours: 4 },
  { title: 'Liderança Humanizada e Gestão de Pessoas', type: 'recommended', status: 'completed', duration_hours: 8 },
  { title: 'Ergonomia Cognitiva e Carga Mental', type: 'mandatory', status: 'in_progress', duration_hours: 4 },
  { title: 'Prevenção ao Burnout', type: 'mandatory', status: 'completed', duration_hours: 8 },
  { title: 'Assédio Sexual - Identificação e Combate', type: 'mandatory', status: 'scheduled', duration_hours: 4 },
  { title: 'Diversidade e Inclusão no Ambiente Escolar', type: 'recommended', status: 'completed', duration_hours: 2 },
  { title: 'Gestão de Crises e Eventos Traumáticos', type: 'mandatory', status: 'in_progress', duration_hours: 16 },
  { title: 'Saúde Mental do Educador', type: 'recommended', status: 'scheduled', duration_hours: 8 },
  { title: 'Compliance Trabalhista e NR-1', type: 'mandatory', status: 'completed', duration_hours: 16 },
] as const

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
  status: 'received' | 'under_review' | 'investigating' | 'resolved' | 'dismissed'
  resolution_description: string | null
}> = [
  {
    category: 'moral_harassment',
    description: 'Coordenação expõe professores em reunião e utiliza comparações humilhantes com metas de desempenho.',
    is_anonymous: true,
    status: 'received',
    resolution_description: null,
  },
  {
    category: 'sexual_harassment',
    description: 'Gestor faz comentários inapropriados e convites insistentes fora do ambiente de trabalho.',
    is_anonymous: true,
    status: 'under_review',
    resolution_description: null,
  },
  {
    category: 'poor_relationships',
    description: 'Conflito recorrente entre equipes de turnos diferentes pela utilização de materiais e espaços.',
    is_anonymous: false,
    status: 'investigating',
    resolution_description: null,
  },
  {
    category: 'difficult_conditions',
    description: 'Sala dos professores com mofo, ventilação inadequada e infiltrações no período de chuvas.',
    is_anonymous: false,
    status: 'resolved',
    resolution_description: 'Manutenção predial executada com reparo do telhado, tratamento de mofo e ventilação assistida.',
  },
  {
    category: 'violence_trauma',
    description: 'Funcionário da portaria sofreu ameaça no horário de saída dos alunos e ficou sem acolhimento imediato.',
    is_anonymous: false,
    status: 'resolved',
    resolution_description: 'Boletim de ocorrência registrado e protocolo de acolhimento implantado com apoio da gestão.',
  },
  {
    category: 'moral_harassment',
    description: 'Equipe de limpeza relata pressão excessiva por produtividade com ameaças veladas de demissão.',
    is_anonymous: true,
    status: 'under_review',
    resolution_description: null,
  },
  {
    category: 'sexual_harassment',
    description: 'Colega envia mensagens de teor sexual e reproduz gestos inapropriados durante o expediente.',
    is_anonymous: true,
    status: 'resolved',
    resolution_description: 'Investigação concluída com comprovação dos fatos e aplicação de medida disciplinar.',
  },
  {
    category: 'poor_relationships',
    description: 'Professor recém-contratado é excluído de reuniões e trocas pedagógicas relevantes.',
    is_anonymous: false,
    status: 'received',
    resolution_description: null,
  },
]

const medicalCertificateEntries: Array<{
  icd_code: string
  is_mental_health: boolean
  days_off: number
  inss_referral: boolean
  nexus_risk: 'low' | 'medium' | 'high' | 'none'
}> = [
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
  { icd_code: 'J06.9', is_mental_health: false, days_off: 3, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'M54.5', is_mental_health: false, days_off: 5, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'K29.7', is_mental_health: false, days_off: 2, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'R51', is_mental_health: false, days_off: 1, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'S93.4', is_mental_health: false, days_off: 10, inss_referral: false, nexus_risk: 'none' },
  { icd_code: 'M75.1', is_mental_health: false, days_off: 14, inss_referral: false, nexus_risk: 'none' },
]

const ppeCatalogByRole: Record<string, Array<{ item_name: string; ca_number: string; replacement_cycle_days: number }>> = {
  Professor: [
    { item_name: 'Protetor auricular de inserção', ca_number: 'CA 42111', replacement_cycle_days: 180 },
    { item_name: 'Luva para apoio em atividades laboratoriais', ca_number: 'CA 39871', replacement_cycle_days: 180 },
  ],
  Coordenador: [{ item_name: 'Colete de brigada escolar', ca_number: 'CA 28741', replacement_cycle_days: 365 }],
  'Auxiliar de limpeza': [
    { item_name: 'Luva nitrílica de proteção química', ca_number: 'CA 33458', replacement_cycle_days: 120 },
    { item_name: 'Bota impermeável PVC', ca_number: 'CA 40218', replacement_cycle_days: 180 },
  ],
  Cozinheira: [
    { item_name: 'Luva térmica para cozinha industrial', ca_number: 'CA 31109', replacement_cycle_days: 180 },
    { item_name: 'Avental térmico impermeável', ca_number: 'CA 28763', replacement_cycle_days: 240 },
  ],
  Secretária: [{ item_name: 'Protetor auricular para eventos escolares', ca_number: 'CA 42111', replacement_cycle_days: 365 }],
  Porteiro: [
    { item_name: 'Colete refletivo', ca_number: 'CA 29564', replacement_cycle_days: 365 },
    { item_name: 'Capa impermeável de segurança', ca_number: 'CA 34420', replacement_cycle_days: 240 },
  ],
  Bibliotecária: [{ item_name: 'Máscara PFF2 para higienização de acervo', ca_number: 'CA 38992', replacement_cycle_days: 120 }],
  Monitor: [{ item_name: 'Colete refletivo para pátio e embarque', ca_number: 'CA 29564', replacement_cycle_days: 240 }],
}

function formatDateOnly(value: Date) {
  return value.toISOString().split('T')[0]
}

function addDays(baseDate: string, days: number) {
  const nextDate = new Date(`${baseDate}T00:00:00`)
  nextDate.setDate(nextDate.getDate() + days)
  return formatDateOnly(nextDate)
}

function addMonths(baseDate: string, months: number) {
  const nextDate = new Date(`${baseDate}T00:00:00`)
  nextDate.setMonth(nextDate.getMonth() + months)
  return formatDateOnly(nextDate)
}

function calcRiskLevel(probability: number, severity: number): RiskLevel {
  const score = probability * severity
  if (score >= 16) return 'critical'
  if (score >= 9) return 'high'
  if (score >= 4) return 'medium'
  return 'low'
}

function getSeedValue(input: string) {
  return input.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
}

function getDocumentStatus(expiresAt: string | null) {
  if (!expiresAt) return 'pending_validation' as const

  const expirationDate = new Date(`${expiresAt}T00:00:00`)
  const now = new Date()
  const diffInDays = Math.ceil((expirationDate.getTime() - now.getTime()) / 86400000)

  if (diffInDays <= 45) return 'expiring_soon' as const
  return 'validated' as const
}

function buildAssessments(schoolId: string, expectedResponses: number) {
  const baseAssessments = [
    { name: 'Campanha Mar/2026', period_start: '2026-03-01', period_end: '2026-03-31', participation_rate: 38, risk_level: 'medium', status: 'active' },
    { name: 'Campanha Fev/2026', period_start: '2026-02-01', period_end: '2026-02-28', participation_rate: 92, risk_level: 'high', status: 'completed' },
    { name: 'Campanha Jan/2026', period_start: '2026-01-06', period_end: '2026-01-31', participation_rate: 88, risk_level: 'medium', status: 'completed' },
    { name: 'Campanha Dez/2025', period_start: '2025-12-01', period_end: '2025-12-31', participation_rate: 95, risk_level: 'low', status: 'completed' },
    { name: 'Campanha Nov/2025', period_start: '2025-11-01', period_end: '2025-11-30', participation_rate: 90, risk_level: 'high', status: 'completed' },
    { name: 'Campanha Out/2025', period_start: '2025-10-01', period_end: '2025-10-31', participation_rate: 72, risk_level: 'critical', status: 'completed' },
    { name: 'Campanha Abr/2026 (Rascunho)', period_start: '2026-04-01', period_end: '2026-04-30', participation_rate: 0, risk_level: 'low', status: 'draft' },
  ] as const

  return baseAssessments.map((assessment) => {
    const responses =
      assessment.status === 'draft'
        ? 0
        : Math.round(expectedResponses * (assessment.participation_rate / 100))

    return {
      id: faker.string.uuid(),
      school_id: schoolId,
      name: assessment.name,
      period_start: assessment.period_start,
      period_end: assessment.period_end,
      sectors_count: faker.number.int({ min: 3, max: 6 }),
      responses_count: responses,
      expected_responses: assessment.status === 'draft' ? 0 : expectedResponses,
      participation_rate: assessment.participation_rate,
      risk_level: assessment.risk_level,
      status: assessment.status,
      created_at: new Date(`${assessment.period_start}T00:00:00.000Z`).toISOString(),
    }
  })
}

function buildTenantFixture(profile: TenantProfile) {
  faker.seed(profile.seed)

  const school = {
    id: faker.string.uuid(),
    name: profile.school_name,
    cnpj: profile.cnpj,
    address: profile.address,
    city: profile.city,
    state: profile.state,
    phone: profile.phone,
    email: profile.email,
    responsible_name: profile.responsible_name,
    employee_count: profile.employee_count,
    plan_type: profile.plan_type,
  }

  const current_user = {
    id: faker.string.uuid(),
    school_id: school.id,
    name: profile.responsible_name,
    email: profile.responsible_email,
    role: 'admin' as const,
    is_active: true,
    avatar: null,
    last_login: new Date().toISOString(),
    password: DEMO_PASSWORD,
  }

  const environments = baseEnvironments.map((environment) => ({
    id: faker.string.uuid(),
    school_id: school.id,
    name: environment.name,
    type: environment.type,
    employee_count: Math.max(3, Math.round(profile.employee_count * environment.employee_ratio)),
    description: `Setor ${environment.name} da unidade ${school.name}`,
    created_at: faker.date.past({ years: 1 }).toISOString(),
  }))

  const employees = Array.from({ length: profile.employee_count }, (_, index) => {
    const environment = environments[index % environments.length]
    const role = faker.helpers.arrayElement([
      'Professor',
      'Coordenador',
      'Auxiliar de limpeza',
      'Cozinheira',
      'Secretária',
      'Porteiro',
      'Bibliotecária',
      'Monitor',
    ])

    return {
      id: faker.string.uuid(),
      school_id: school.id,
      environment_id: environment.id,
      environment_name: environment.name,
      name: faker.person.fullName(),
      cpf: faker.string.numeric({ length: 11 }),
      role,
      admission_date: faker.date.past({ years: 5 }).toISOString().split('T')[0],
      status: faker.helpers.weightedArrayElement([
        { value: 'active', weight: 84 },
        { value: 'on_leave', weight: 9 },
        { value: 'inactive', weight: 7 },
      ]),
      email: faker.internet.email({ firstName: role.replace(/\s+/g, '').slice(0, 6), provider: `${school.city.toLowerCase().replace(/\s+/g, '')}.edu.br` }),
      created_at: faker.date.past({ years: 3 }).toISOString(),
    }
  })

  const risks = Array.from({ length: 24 }, (_, index) => {
    const category = riskCategories[index % riskCategories.length]
    const environment = environments[index % environments.length]
    const probability = faker.number.int({ min: 1, max: 5 })
    const severity = faker.number.int({ min: 1, max: 5 })
    const risk_level = calcRiskLevel(probability, severity)
    const statusWeights = risk_level === 'critical'
      ? ['identified', 'treating', 'identified', 'treating']
      : ['identified', 'treating', 'controlled', 'eliminated']
    const descriptions = riskDescriptions[category.key] ?? ['Risco identificado durante avaliação do ambiente de trabalho.']

    return {
      id: faker.string.uuid(),
      school_id: school.id,
      environment_id: environment.id,
      environment_name: environment.name,
      assessment_id: null,
      name: `${category.label} - ${environment.name}`,
      description: descriptions[index % descriptions.length],
      category: category.key,
      category_label: category.label,
      probability,
      severity,
      risk_level,
      status: statusWeights[index % statusWeights.length] as RiskStatus,
      identified_at: faker.date.past({ years: 0.5 }).toISOString().split('T')[0],
      responsible_name: faker.person.fullName(),
      created_at: faker.date.past({ years: 0.5 }).toISOString(),
    }
  })

  const actionPlans = risks
    .filter((risk) => risk.status === 'treating' || risk.status === 'controlled')
    .map((risk, index) => {
      const status = faker.helpers.arrayElement(['pending', 'in_progress', 'completed', 'verified', 'overdue'])
      const deadline =
        status === 'overdue'
          ? faker.date.past({ years: 0.2 }).toISOString().split('T')[0]
          : faker.date.future({ years: 0.5 }).toISOString().split('T')[0]

      return {
        id: faker.string.uuid(),
        risk_id: risk.id,
        school_id: school.id,
        title: `Plano de ação: ${risk.category_label}`,
        description: faker.helpers.arrayElement([
          'Implantar rotina de acompanhamento mensal com responsáveis e indicadores de risco.',
          'Revisar jornada e redistribuição de demandas para reduzir exposição continuada.',
          'Executar capacitação dirigida e plano de acolhimento para equipes com maior criticidade.',
          'Formalizar procedimento, responsável e prazo com evidências de verificação.',
        ]),
        action_type: faker.helpers.arrayElement(['preventive', 'corrective', 'monitoring']),
        responsible_name: faker.person.fullName(),
        deadline,
        status,
        created_at: faker.date.past({ years: 0.3 }).toISOString(),
        priority_order: index + 1,
      }
    })

  const trainings = trainingTemplates.map((training, index) => ({
    id: faker.string.uuid(),
    school_id: school.id,
    title: training.title,
    type: training.type,
    status: training.status,
    attendees:
      training.status === 'scheduled'
        ? 0
        : Math.max(8, Math.round(profile.employee_count * (0.18 + (index % 4) * 0.1))),
    duration_hours: training.duration_hours,
    instructor: faker.person.fullName(),
    scheduled_date: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
    validity_months: 12,
    created_at: faker.date.past({ years: 0.5 }).toISOString(),
  }))

  const assessments = buildAssessments(school.id, Math.max(40, Math.round(profile.employee_count * 0.9)))

  const medical_certificates = medicalCertificateEntries.map((entry) => {
    const employee = faker.helpers.arrayElement(employees.filter((record) => record.status !== 'inactive'))
    const issueDate = faker.date.recent({ days: 120 })
    const issueDateStr = formatDateOnly(issueDate)

    return {
      id: faker.string.uuid(),
      employee_id: employee.id,
      employee_name: employee.name,
      school_id: school.id,
      issue_date: issueDateStr,
      days_off: entry.days_off,
      icd_code: entry.icd_code,
      is_mental_health: entry.is_mental_health,
      doctor_name: `Dr. ${faker.person.fullName()}`,
      return_date: addDays(issueDateStr, entry.days_off),
      inss_referral: entry.inss_referral,
      nexus_risk: entry.nexus_risk,
      created_at: issueDate.toISOString(),
    }
  })

  const complaints = complaintEntries.map((entry, index) => ({
    id: faker.string.uuid(),
    school_id: school.id,
    protocol_number: `${school.state}-DEN-2026-${String(index + 1).padStart(4, '0')}`,
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

  const complianceReadyTrainings = trainings.filter((training) => training.status !== 'scheduled')

  const employee_training_enrollments = employees.flatMap((employee, index) => {
    const seedValue = getSeedValue(employee.id)
    const assignmentCount = employee.status === 'active' ? 2 : 1

    return Array.from({ length: assignmentCount }, (_, offset) => {
      const training = complianceReadyTrainings[(seedValue + offset + index) % complianceReadyTrainings.length]
      const completedAt = formatDateOnly(faker.date.recent({ days: 180 }))
      const status = offset === assignmentCount - 1 && employee.status === 'on_leave' ? 'in_progress' : 'completed'

      return {
        id: faker.string.uuid(),
        tenant_id: school.id,
        employee_id: employee.id,
        training_id: training.id,
        status,
        completed_at: status === 'completed' ? completedAt : null,
        valid_until: status === 'completed' ? addMonths(completedAt, training.validity_months) : null,
        instructor_name: training.instructor,
        created_at: faker.date.recent({ days: 240 }).toISOString(),
      }
    })
  })

  const employee_ppe_deliveries = employees.map((employee, index) => {
    const availableItems = ppeCatalogByRole[employee.role] ?? [
      { item_name: 'Kit básico de segurança ocupacional', ca_number: 'CA 10000', replacement_cycle_days: 180 },
    ]
    const seedValue = getSeedValue(employee.id)
    const selectedItem = availableItems[(seedValue + index) % availableItems.length]
    const deliveredAt = formatDateOnly(faker.date.recent({ days: 210 }))

    return {
      id: faker.string.uuid(),
      tenant_id: school.id,
      employee_id: employee.id,
      item_name: selectedItem.item_name,
      ca_number: selectedItem.ca_number,
      delivered_at: deliveredAt,
      next_replacement_at: addDays(deliveredAt, selectedItem.replacement_cycle_days),
      signed_at: deliveredAt,
      created_at: faker.date.recent({ days: 210 }).toISOString(),
    }
  })

  const employee_compliance_documents = [
    ...employee_training_enrollments
      .filter((enrollment) => enrollment.status === 'completed')
      .map((enrollment) => ({
        id: faker.string.uuid(),
        tenant_id: enrollment.tenant_id,
        employee_id: enrollment.employee_id,
        training_enrollment_id: enrollment.id,
        ppe_delivery_id: null,
        document_type: 'training_certificate' as const,
        file_name: `certificado-${enrollment.employee_id.slice(0, 6)}-${enrollment.training_id.slice(0, 6)}.pdf`,
        mime_type: 'application/pdf',
        file_size_bytes: faker.number.int({ min: 250_000, max: 1_900_000 }),
        issued_at: enrollment.completed_at ?? formatDateOnly(new Date()),
        expires_at: enrollment.valid_until,
        status: getDocumentStatus(enrollment.valid_until),
        notes: 'Certificado anexado ao prontuário ocupacional do colaborador.',
        uploaded_at: faker.date.recent({ days: 120 }).toISOString(),
      })),
    ...employee_ppe_deliveries.map((delivery) => ({
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

  return {
    school,
    current_user,
    environments,
    risks,
    action_plans: actionPlans,
    employees,
    medical_certificates,
    trainings,
    complaints,
    assessments,
    employee_training_enrollments,
    employee_ppe_deliveries,
    employee_compliance_documents,
  }
}

export function createSeededMockDatabase() {
  const fixtures = tenantProfiles.map(buildTenantFixture)

  return {
    schools: fixtures.map((fixture) => fixture.school),
    users: fixtures.map((fixture) => fixture.current_user),
    environments: fixtures.flatMap((fixture) => fixture.environments),
    risks: fixtures.flatMap((fixture) => fixture.risks),
    action_plans: fixtures.flatMap((fixture) => fixture.action_plans),
    employees: fixtures.flatMap((fixture) => fixture.employees),
    medical_certificates: fixtures.flatMap((fixture) => fixture.medical_certificates),
    trainings: fixtures.flatMap((fixture) => fixture.trainings),
    complaints: fixtures.flatMap((fixture) => fixture.complaints),
    assessments: fixtures.flatMap((fixture) => fixture.assessments),
    employee_training_enrollments: fixtures.flatMap((fixture) => fixture.employee_training_enrollments),
    employee_ppe_deliveries: fixtures.flatMap((fixture) => fixture.employee_ppe_deliveries),
    employee_compliance_documents: fixtures.flatMap((fixture) => fixture.employee_compliance_documents),
  }
}

export type MockDatabase = ReturnType<typeof createSeededMockDatabase>
