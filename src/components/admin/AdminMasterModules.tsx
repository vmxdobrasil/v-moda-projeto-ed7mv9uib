import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  GitBranch,
  Package,
  ShoppingBag,
  Wallet,
  Truck,
  Users,
  Award,
  BookOpen,
  Settings,
  BarChart,
  Star,
} from 'lucide-react'

const MODULES = [
  {
    to: '/crm/pipeline',
    icon: GitBranch,
    label: 'CRM Pipeline',
    desc: 'Fluxo de conversão de leads',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/pedidos',
    icon: Package,
    label: 'Pedidos & Itens',
    desc: 'Gestão de pedidos e rastreio',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/produtos',
    icon: ShoppingBag,
    label: 'Produtos & Estoque',
    desc: 'Catálogo e movimentações',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/financeiro',
    icon: Wallet,
    label: 'Financeiro',
    desc: 'Contas a pagar e receber',
    bg: 'bg-emerald/10',
    text: 'text-emerald',
  },
  {
    to: '/admin/logistica',
    icon: Truck,
    label: 'Logística',
    desc: 'Excursões e cargas',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/clientes',
    icon: Users,
    label: 'CRM / Clientes',
    desc: 'Leads, status e ranking',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/v-club',
    icon: Award,
    label: 'V Club Card',
    desc: 'Cartões e cashback',
    bg: 'bg-emerald/10',
    text: 'text-emerald',
  },
  {
    to: '/resources',
    icon: BookOpen,
    label: 'Revista ModaAtual',
    desc: 'Conteúdo digital',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/top-marcas',
    icon: Star,
    label: 'Top Marcas',
    desc: 'Ranking de fabricantes',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/geografico',
    icon: BarChart,
    label: 'Distribuição Geográfica',
    desc: 'Análise por região',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
  {
    to: '/admin/usuarios',
    icon: Settings,
    label: 'Usuários',
    desc: 'Gestão de usuários',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
  {
    to: '/admin/relatorios',
    icon: BarChart,
    label: 'Relatórios',
    desc: 'Relatórios e análises',
    bg: 'bg-navy/10',
    text: 'text-navy',
  },
]

export function AdminMasterModules() {
  return (
    <div>
      <h3 className="text-lg font-display font-semibold mb-4">Módulos de Gestão</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.to} to={mod.to}>
              <Card className="rounded-2xl shadow-soft hover-depth border-primary/10 cursor-pointer h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${mod.bg}`}
                  >
                    <Icon className={`w-6 h-6 ${mod.text}`} />
                  </div>
                  <div>
                    <p className="font-display font-semibold">{mod.label}</p>
                    <p className="text-sm text-muted-foreground">{mod.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
