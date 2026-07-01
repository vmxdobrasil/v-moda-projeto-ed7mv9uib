import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  Store,
  LogOut,
  ChevronLeft,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function AdminLayout() {
  const location = useLocation()
  const { signOut, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'CRM Global', href: '/admin/crm-global', icon: Users },
    { name: 'Guia CRM', href: '/admin/guia-crm', icon: Users },
    { name: 'V Club', href: '/admin/v-club', icon: ShoppingBag },
    { name: 'Financeiro', href: '/admin/financeiro', icon: CreditCard },
    { name: 'Parceiros', href: '/admin/parceiros', icon: Store },
    { name: 'Top Marcas', href: '/admin/fabricantes', icon: Store },
    { name: 'Guia de Marcas', href: '/admin/guia-marcas', icon: Users },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 bg-background border-r border-border flex flex-col gap-4 p-4 shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="font-bold text-lg tracking-tight text-primary">V MODA Admin</div>
          <Link to="/">
            <Button variant="ghost" size="icon" title="Voltar ao App">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/admin' && location.pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-4 border-t flex flex-col gap-4">
          <div className="px-2 text-sm text-muted-foreground truncate" title={user?.email}>
            {user?.email}
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Encerrar Sessão
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/10 relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
