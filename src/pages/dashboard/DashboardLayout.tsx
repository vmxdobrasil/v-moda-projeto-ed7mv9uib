import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { NotificationsBell } from '@/components/NotificationsBell'
import { LayoutDashboard, Users, Package, Truck, LogOut, Menu, X, Settings } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isAdmin = user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

  const navItems = [
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/' },
    { icon: Package, label: 'Catálogo', path: '/products' },
    { icon: Users, label: 'CRM', path: '/customers' },
    { icon: Truck, label: 'Logística', path: '/logistics' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ]

  if (isAdmin) {
    navItems.splice(2, 0, {
      icon: Package,
      label: 'Catálogo Admin',
      path: '/admin-products',
    })
    navItems.splice(3, 0, { icon: Users, label: 'Fabricantes', path: '/manufacturers' })
    navItems.splice(4, 0, { icon: Users, label: 'Afiliados', path: '/affiliates' })
  }

  useRealtime('notifications', (e) => {
    if (e.action === 'create') {
      const isForUser = e.record.user === user?.id || e.record.customer_email === user?.email
      if (isForUser) {
        toast.info(e.record.title, { description: e.record.message })
      }
    }
  })

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
          <span className="font-bold text-xl tracking-tight text-primary">V MODA</span>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase shrink-0">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name || 'Usuário'}</span>
              <span className="text-xs text-muted-foreground truncate capitalize">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 w-full min-w-0">
        <header className="h-16 bg-background/95 backdrop-blur border-b sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold md:hidden">V MODA</h2>
            <h2 className="text-lg font-semibold hidden md:block capitalize">
              {location.pathname === '/'
                ? 'Visão Geral'
                : location.pathname.split('/')[1].replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm font-medium hidden sm:block text-muted-foreground">
              Olá, {user?.name || user?.email || 'Usuário'}
            </span>
            <NotificationsBell />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
