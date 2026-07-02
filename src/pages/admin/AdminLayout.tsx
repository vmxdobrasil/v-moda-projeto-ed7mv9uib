import { Outlet, NavLink, Link } from 'react-router-dom'
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
  UserCheck,
  MapPin,
  TrendingUp,
  Bell,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useState } from 'react'

export default function AdminLayout() {
  const { signOut, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'CRM Global', href: '/admin/crm-global', icon: Users },
    { name: 'Guia CRM', href: '/admin/guia-crm', icon: Users },
    { name: 'Agentes', href: '/admin/agentes', icon: UserCheck },
    { name: 'V Club', href: '/admin/v-club', icon: ShoppingBag },
    { name: 'Financeiro', href: '/admin/financeiro', icon: CreditCard },
    { name: 'Parceiros', href: '/admin/parceiros', icon: Store },
    { name: 'Top Marcas', href: '/admin/top-marcas', icon: Store },
    { name: 'Guia de Marcas', href: '/admin/guia-de-marcas', icon: Users },
    { name: 'Revendedoras', href: '/admin/revendedoras', icon: ShoppingBag },
    { name: 'Geográfico', href: '/admin/geografico', icon: MapPin },
    { name: 'Zonas', href: '/admin/zonas', icon: MapPin },
    { name: 'Insights', href: '/admin/insights', icon: TrendingUp },
    { name: 'Notificações', href: '/admin/notificacoes', icon: Bell },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ]

  const NavItems = () => (
    <>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2">
        {navigation.map((item) => {
          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 font-sans',
                  isActive
                    ? 'bg-primary text-white shadow-soft cta-glow'
                    : 'text-navy/70 hover:bg-navy/5 hover:text-navy dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
                )
              }
            >
              {({ isActive }) => {
                const Icon = item.icon
                return (
                  <>
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isActive ? 'text-white' : 'text-navy dark:text-slate-400 opacity-70',
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.name}
                  </>
                )
              }}
            </NavLink>
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
    </>
  )

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="font-bold text-lg tracking-tight text-primary font-display">
          V MODA Command
        </div>
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon" title="Voltar ao App">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4 flex flex-col gap-4">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <SheetDescription className="sr-only">
                Acesse as áreas administrativas da plataforma
              </SheetDescription>
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="font-bold text-lg tracking-tight text-primary font-display">
                  V MODA Command
                </div>
              </div>
              <NavItems />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-background/80 backdrop-blur-xl border-r border-border flex-col gap-4 p-4 shrink-0 shadow-soft z-10 relative h-screen sticky top-0">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="font-bold text-lg tracking-tight text-primary font-display">
            V MODA Command
          </div>
          <Link to="/">
            <Button variant="ghost" size="icon" title="Voltar ao App">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <NavItems />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/10 relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
