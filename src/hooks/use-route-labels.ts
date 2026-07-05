import { useLocation } from 'react-router-dom'

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'Administração',
  '/admin/dashboard': 'Painel de Gestão',
  '/admin/master': 'Admin Master',
  '/admin/top-marcas': 'Top 60 Marcas',
  '/admin/guia-de-marcas': 'Fabricantes do Guia',
  '/admin/clientes': 'Clientes',
  '/admin/crm-global': 'CRM Global',
  '/admin/assinaturas': 'Assinaturas',
  '/admin/comissoes': 'Comissões',
  '/admin/insights': 'Insights',
  '/admin/v-club': 'V Club',
  '/admin/agentes': 'Agentes & Parceiros',
  '/admin/influencers': 'Influenciadores',
  '/admin/produtos': 'Produtos',
  '/admin/geografico': 'Distribuição Geográfica',
  '/admin/revendedoras': 'Revendedoras',
  '/admin/zonas': 'Zonas',
  '/admin/financeiro': 'Financeiro Admin',
  '/admin/marketing': 'Marketing',
  '/admin/precificacao': 'Precificação',
  '/admin/categorias': 'Categorias',
  '/admin/catalogo': 'Catálogo',
  '/admin/logs-importacao': 'Logs de Importação',
  '/admin/notificacoes': 'Notificações',
  '/admin/inventory': 'Estoque',
  '/admin/retail-crm': 'CRM Varejo',
  '/admin/consultant-crm': 'CRM Consultor',
  '/financeiro': 'Financeiro',
  '/dashboard': 'Dashboard',
  '/manufacturer': 'Portal do Fabricante',
  '/manufacturer/catalog': 'Catálogo',
  '/manufacturer/leads': 'CRM & Leads',
  '/manufacturer/logistics': 'Logística',
  '/manufacturer/v-club': 'V Club',
  '/manufacturer/settings': 'Configurações',
  '/manufacturer/crm': 'CRM',
  '/manufacturer/inventory': 'Estoque',
  '/manufacturer/stores': 'Lojas',
  '/manufacturer/messages': 'Mensagens',
  '/manufacturer/team': 'Equipe',
  '/customers': 'Clientes',
  '/products': 'Produtos',
  '/analytics': 'Analytics',
  '/v-club': 'V Club Wallet',
  '/revenda': 'Central de Pedidos',
  '/revendedora-dashboard': 'Minha Revenda',
  '/agente': 'Minhas Regiões',
  '/affiliates': 'Afiliados',
  '/perfil': 'Meu Perfil',
  '/vallen-ia': 'Vallen IA',
  '/maquina-vendas': 'Máquina de Vendas',
  '/logistica-transportadoras': 'Logística & Transporte',
  '/retail-crm': 'CRM Varejo',
  '/consultant-crm': 'CRM Consultor',
  '/inventory': 'Estoque',
  '/seller-orders': 'Meus Pedidos',
  '/academy': 'Academia',
  '/vallen-consultora': 'Vallen Consultora',
  '/pickup-validation': 'Validação de Retirada',
  '/resources': 'Recursos',
  '/manufacturers': 'Fabricantes',
  '/media-kit': 'Media Kit',
  '/crm': 'Painel CRM',
  '/crm/leads': 'Leads',
  '/crm/pipeline': 'Pipeline',
  '/crm/atividades': 'Atividades',
  '/crm/tarefas': 'Tarefas',
  '/crm/propostas': 'Propostas',
  '/crm/relatorios': 'Relatórios',
  '/crm/fundadores': 'Fundadores',
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export interface BreadcrumbItem {
  label: string
  path: string
}

export function useRouteLabels() {
  const location = useLocation()
  const pathname = location.pathname

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = ''
  for (const segment of segments) {
    currentPath += '/' + segment
    const label = ROUTE_LABELS[currentPath] || capitalize(segment)
    breadcrumbs.push({ label, path: currentPath })
  }

  const currentLabel = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Início'

  return { breadcrumbs, currentLabel, pathname }
}
