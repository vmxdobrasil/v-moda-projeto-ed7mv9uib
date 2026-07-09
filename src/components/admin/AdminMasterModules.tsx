import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import {
  GitBranch,
  CreditCard,
  FileText,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  Users,
} from 'lucide-react'

const modules = [
  {
    title: 'CRM Pipeline',
    desc: 'Gestão de leads e clientes',
    href: '/crm',
    icon: GitBranch,
    color: 'text-primary',
  },
  {
    title: 'V Club Card',
    desc: 'Cartões e cashback',
    href: '/admin/v-club',
    icon: CreditCard,
    color: 'text-electric',
  },
  {
    title: 'Revista ModaAtual',
    desc: 'Conteúdo editorial',
    href: '/admin/midia',
    icon: FileText,
    color: 'text-emerald',
  },
  {
    title: 'Produtos',
    desc: 'Catálogo e estoque',
    href: '/admin/produtos',
    icon: Package,
    color: 'text-navy',
  },
  {
    title: 'Pedidos',
    desc: 'Vendas e entregas',
    href: '/admin/pedidos',
    icon: ShoppingCart,
    color: 'text-primary',
  },
  {
    title: 'Logística',
    desc: 'Excursões e cargas',
    href: '/admin/logistica',
    icon: Truck,
    color: 'text-electric',
  },
  {
    title: 'Financeiro',
    desc: 'Transações e contas',
    href: '/admin/financeiro',
    icon: Wallet,
    color: 'text-emerald',
  },
  {
    title: 'Clientes',
    desc: 'Base de clientes',
    href: '/admin/clientes',
    icon: Users,
    color: 'text-navy',
  },
]

export function AdminMasterModules() {
  return (
    <Card className="rounded-2xl shadow-soft border-primary/10">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold font-display mb-4">Módulos da Plataforma</h3>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link key={mod.title} to={mod.href}>
                <div className="rounded-xl border border-border/50 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group cursor-pointer">
                  <Icon
                    className={`w-6 h-6 ${mod.color} mb-2 group-hover:scale-110 transition-transform`}
                  />
                  <p className="text-sm font-semibold font-display">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
