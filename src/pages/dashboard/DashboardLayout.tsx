import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Factory,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import logoUrl from '@/assets/logo-v-moda-fb088.png'

export default function DashboardLayout() {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads / Clientes', path: '/customers', icon: Users },
    { name: 'Projetos', path: '/products', icon: Package },
    { name: 'Mensagens', path: '/messages', icon: MessageSquare },
    { name: 'Fabricantes', path: '/manufacturers', icon: Factory },
    { name: 'Configurações', path: '/settings', icon: SettingsIcon },
  ]

  const handleLogout = () => {
    signOut()
  }

  const NavLinks = () => (
    <div className="flex flex-col gap-2 p-4 h-full">
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path))
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        )
      })}

      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
        <div className="px-3 py-2 text-sm text-muted-foreground truncate mb-2">{user?.email}</div>
        <Button
          variant="ghost"
          className="justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-3 w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <div className="p-6 border-b flex justify-center">
          <img src={logoUrl} alt="V Moda" className="h-10 object-contain" />
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card sticky top-0 z-10">
          <img src={logoUrl} alt="V Moda" className="h-8 object-contain" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <SheetHeader className="p-6 border-b text-left">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <div className="flex justify-center">
                  <img src={logoUrl} alt="V Moda" className="h-8 object-contain" />
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
