import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  ListChecks,
  FileHeart,
  GraduationCap,
  MessageSquareWarning,
  FileText,
  Orbit,
  LucideIcon
} from 'lucide-react';

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  path: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const menuConfig: MenuGroup[] = [
  {
    title: 'Principal',
    items: [
      { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { title: 'Onboarding', icon: Orbit, path: '/onboarding' },
      { title: 'Setores', icon: Building2, path: '/environments' },
      { title: 'Funcionários', icon: Users, path: '/employees' },
    ],
  },
  {
    title: 'Diagnóstico',
    items: [
      { title: 'Campanhas COPSOQ', icon: ClipboardCheck, path: '/assessments' },
      { title: 'Resultado COPSOQ', icon: BarChart3, path: '/assessments/results' },
    ],
  },
  {
    title: 'Gestão de Riscos',
    items: [
      { title: 'Inventário de Riscos', icon: AlertTriangle, path: '/risks' },
      { title: 'Planos de Ação', icon: ListChecks, path: '/action-plans' },
    ],
  },
  {
    title: 'Saúde e Compliance',
    items: [
      { title: 'Atestados Médicos', icon: FileHeart, path: '/medical-certificates' },
      { title: 'Treinamentos', icon: GraduationCap, path: '/trainings' },
      { title: 'Denúncias', icon: MessageSquareWarning, path: '/complaints' },
      { title: 'Relatórios', icon: FileText, path: '/reports' },
    ],
  },
];

export const systemMenuConfig: MenuItem[] = [];
