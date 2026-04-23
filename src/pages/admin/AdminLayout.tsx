import { useState } from 'react'
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
  Award,
  FileJson,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/BrandLogo'
import pb from '@/lib/pocketbase/client'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isAdmin =
    pb.authStore.record?.email === 'valterpmendonca@gmail.com' ||
    pb.authStore.record?.role === 'manufacturer'

  // Rely exclusively on standard auth check to prevent loops and bypasses
  const isAuthenticated = pb.authStore.isValid && isAdmin

  // Determine internal admin role securely from record
  const role =
    pb.authStore.record?.email === 'valterpmendonca@gmail.com' ? 'administrador' : 'gerente'

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
      name: 'Coleções',
      href: '/admin/colecoes',
      icon: ImageIcon,
      roles: ['administrador', 'gerente'],
    },
    {
      name: 'Mídia',
      href: '/admin/midia',
      icon: ImageIcon,
      roles: ['administrador', 'gerente'],
    },
    { name: 'Gestão de Planos', href: '/admin/assinaturas', icon: Award, roles: ['administrador'] },
    {
      name: 'Logs de Importação',
      href: '/admin/logs-importacao',
      icon: FileJson,
      roles: ['administrador'],
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
    pb.authStore.clear()
    navigate('/admin/login')
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-background border-r flex-col hidden md:flex print:hidden transition-all duration-300 relative',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-background border rounded-full p-1 hover:bg-muted z-10"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <div
          className={cn(
            'h-16 flex items-center border-b overflow-hidden',
            isCollapsed ? 'justify-center px-0' : 'px-6',
          )}
        >
          <Link to="/" className="flex items-center shrink-0">
            {isCollapsed ? (
              <span className="font-bold text-xl text-primary">VM</span>
            ) : (
              <>
                <BrandLogo className="h-8 w-auto" fallbackClassName="text-2xl" />
                <span className="ml-2 text-[10px] font-bold tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded uppercase">
                  ADMIN
                </span>
              </>
            )}
          </Link>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed && 'justify-center px-0',
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        <div className={cn('p-4 border-t space-y-2', isCollapsed && 'px-2')}>
          <Link
            to="/"
            title={isCollapsed ? 'Ir para a Loja' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap',
              isCollapsed && 'justify-center px-0',
            )}
          >
            <ShoppingCart className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Ir para a Loja</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sair' : undefined}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap',
              isCollapsed && 'justify-center px-0',
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden print:overflow-visible w-full">
        <header className="h-16 bg-background border-b flex items-center justify-between px-4 md:px-8 print:hidden shrink-0">
          <div className="flex items-center gap-4 md:hidden">
            <Link to="/" className="flex items-center">
              <BrandLogo className="h-6 w-auto" fallbackClassName="text-xl" />
            </Link>
          </div>
          <div className="flex items-center gap-4 hidden md:flex">
            <button className="md:hidden" onClick={() => setIsCollapsed(!isCollapsed)}>
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium capitalize hidden md:inline-block">
              {role === 'gerente' ? 'Gerente' : 'Administrador'}
            </span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                {pb.authStore.record?.avatar ? (
                  <img
                    src={pb.files.getUrl(pb.authStore.record, pb.authStore.record.avatar, {
                      thumb: '100x100',
                    })}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold">
                    {pb.authStore.record?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">
                {pb.authStore.record?.name || pb.authStore.record?.email}
              </span>
            </div>
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
