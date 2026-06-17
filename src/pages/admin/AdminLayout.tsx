import { Outlet, Link, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  PieChart,
  Megaphone,
  CreditCard,
  MessageSquare,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Insights / Hub', href: '/admin/insights', icon: PieChart },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Produtos', href: '/admin/produtos', icon: Package },
  { name: 'Comissões', href: '/admin/comissoes', icon: CreditCard },
  { name: 'Marketing', href: '/admin/marketing', icon: Megaphone },
  { name: 'Notificações', href: '/admin/notificacoes', icon: MessageSquare },
  { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row container mx-auto px-4 py-6 gap-6 overflow-hidden">
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
          <div className="bg-background rounded-lg border shadow-sm p-4 flex flex-col gap-1 overflow-y-auto">
            <h2 className="font-semibold px-2 mb-2 text-sm text-muted-foreground uppercase tracking-wider">
              Administração
            </h2>
            <nav className="flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive =
                  location.pathname.startsWith(item.href) &&
                  (item.href !== '/admin' || location.pathname === '/admin')
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto rounded-lg border bg-background shadow-sm p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
