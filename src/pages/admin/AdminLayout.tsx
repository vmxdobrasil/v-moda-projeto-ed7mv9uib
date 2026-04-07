import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  LogOut,
  Users,
  BarChart,
  Settings,
  Megaphone,
  Tags,
  Image as ImageIcon,
  Presentation,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/BrandLogo'
import pb from '@/lib/pocketbase/client'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isAdmin =
    pb.authStore.record?.email === 'valterpmendonca@gmail.com' ||
    pb.authStore.record?.role === 'manufacturer'
  const isAuthenticated =
    pb.authStore.isValid && (isAdmin || localStorage.getItem('admin_auth') === '1')
  const role = localStorage.getItem('admin_role') || 'administrador' // 'administrador' or 'gerente'

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      roles: ['administrador', 'gerente'],
    },
    {
      name: 'Pedidos',
      href: '/admin/pedidos',
      icon: ShoppingCart,
      roles: ['administrador', 'gerente'],
    },
    {
      name: 'Produtos',
      href: '/admin/produtos',
      icon: Package,
      roles: ['administrador', 'gerente'],
    },
    { name: 'Clientes', href: '/admin/clientes', icon: Users, roles: ['administrador', 'gerente'] },
    {
      name: 'Marketing',
      href: '/admin/marketing',
      icon: Megaphone,
      roles: ['administrador', 'gerente'],
    },
    {
      name: 'Categorias',
      href: '/admin/categorias',
      icon: Tags,
      roles: ['administrador', 'gerente'],
    },
    {
      name: 'Mídia',
      href: '/admin/midia',
      icon: ImageIcon,
      roles: ['administrador', 'gerente'],
    },
    { name: 'Relatórios', href: '/admin/relatorios', icon: BarChart, roles: ['administrador'] },
    {
      name: 'Configurações',
      href: '/admin/configuracoes',
      icon: Settings,
      roles: ['administrador'],
    },
    {
      name: 'Proposta Zoop',
      href: '/admin/proposta-zoop',
      icon: Presentation,
      roles: ['administrador'],
    },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(role))

  // Route guarding
  if (
    role === 'gerente' &&
    ['/admin/relatorios', '/admin/configuracoes'].includes(location.pathname)
  ) {
    return <Navigate to="/admin" replace />
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    localStorage.removeItem('admin_auth')
    pb.authStore.clear()
    navigate('/admin/login')
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex-col hidden md:flex print:hidden">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/" className="flex items-center">
            <BrandLogo className="h-8 w-auto" fallbackClassName="text-2xl" />
          </Link>
          <span className="ml-2 text-[10px] font-bold tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded uppercase">
            ADMIN
          </span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Ir para a Loja
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden print:overflow-visible">
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-8 print:hidden">
          <div className="flex items-center gap-4 md:hidden">
            <Link to="/" className="flex items-center">
              <BrandLogo className="h-6 w-auto" fallbackClassName="text-xl" />
            </Link>
          </div>
          <h1 className="text-xl font-semibold hidden md:block">Painel Administrativo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium capitalize">
              {role === 'gerente' ? 'Gerente' : 'Administrador'}
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 print:overflow-visible print:p-0">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden flex items-center justify-start gap-4 overflow-x-auto bg-background border-t p-2 px-4 no-scrollbar print:hidden">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-md text-[10px] font-medium transition-colors min-w-[64px]',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </main>
    </div>
  )
}
