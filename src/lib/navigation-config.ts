import {
  Activity,
  Award,
  BarChart,
  Calendar,
  CreditCard,
  DollarSign,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageCircle,
  Package,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    label: 'ADMINISTRAÇÃO',
    items: [
      { name: 'Painel de Gestão', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Assinaturas', href: '/admin/assinaturas', icon: Wallet },
      { name: 'Insights', href: '/admin/insights', icon: TrendingUp },
    ],
  },
  {
    label: 'GESTÃO DE CONTEÚDO',
    items: [
      { name: 'Top 60 Marcas', href: '/admin/top-marcas', icon: Star },
      { name: 'Top 100 Marcas', href: '/top-marcas', icon: Star },
      { name: 'Fabricantes do Guia', href: '/admin/guia-de-marcas', icon: Store },
      { name: 'Guia de Compras', href: '/guia-compras', icon: Store },
      { name: 'Produtos', href: '/admin/produtos', icon: ShoppingBag },
    ],
  },
  {
    label: 'RELACIONAMENTO',
    items: [
      { name: 'Clientes', href: '/admin/clientes', icon: Users },
      { name: 'CRM Global', href: '/admin/crm-global', icon: Activity },
      { name: 'CRM Hub', href: '/crm', icon: GitBranch },
      { name: 'Revendedoras', href: '/admin/revendedoras', icon: ShoppingBag },
      { name: 'Agentes & Parceiros', href: '/admin/agentes', icon: MapPin },
      { name: 'Influenciadores', href: '/admin/influencers', icon: Megaphone },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { name: 'Comissões', href: '/admin/comissoes', icon: CreditCard },
      { name: 'Financeiro', href: '/financeiro', icon: Wallet },
      { name: 'V Club (Admin)', href: '/admin/v-club', icon: Award },
    ],
  },
  {
    label: 'OPERAÇÕES',
    items: [
      { name: 'Distribuição Geográfica', href: '/admin/geografico', icon: BarChart },
      { name: 'Logística & Transporte', href: '/logistica-transportadoras', icon: Truck },
    ],
  },
]

export const AGENT_NAV_SECTIONS: NavSection[] = [
  {
    label: 'MINHAS ATIVIDADES',
    items: [
      { name: 'Painel do Agente', href: '/Agente Credenciado', icon: LayoutDashboard },
      { name: 'Minhas Excursões', href: '/Agente Credenciado?tab=excursions', icon: Calendar },
      { name: 'Meus Clientes', href: '/Agente Credenciado?tab=clients', icon: Users },
      { name: 'Minhas Comissões', href: '/Agente Credenciado?tab=finances', icon: DollarSign },
      { name: 'Logística de Cargas', href: '/Agente Credenciado?tab=cargo', icon: Package },
      { name: 'Financeiro', href: '/financeiro', icon: Wallet },
    ],
  },
  {
    label: 'SUPORTE',
    items: [
      { name: 'Central de Ajuda', href: '/faq', icon: HelpCircle },
      { name: 'Falar com Admin', href: '/contato', icon: MessageCircle },
    ],
  },
]
