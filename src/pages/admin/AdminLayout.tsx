import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  FolderTree,
  FileImage,
  PieChart,
  Settings,
  Link2,
  DollarSign,
  Bell,
  Store,
  Package,
  BookOpen,
  Menu,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/clientes', icon: Users },
  { name: 'Fabricantes', href: '/admin/fabricantes', icon: Store },
  { name: 'Produtos', href: '/admin/produtos', icon: Package },
  { name: 'Catálogo', href: '/admin/catalogo', icon: BookOpen },
  { name: 'Categorias', href: '/admin/categorias', icon: FolderTree },
  { name: 'Coleções', href: '/admin/colecoes', icon: FileImage },
  { name: 'Logística', href: '/admin/logistica', icon: ShoppingBag },
  { name: 'Marketing', href: '/admin/marketing', icon: PieChart },
  { name: 'Comissões', href: '/admin/comissoes', icon: DollarSign },
  { name: 'Agentes', href: '/admin/agentes', icon: Users },
  { name: 'Afiliados', href: '/admin/afiliados', icon: Users },
  { name: 'Parceiros', href: '/admin/parceiros', icon: Link2 },
  { name: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
  { name: 'V-Club', href: '/admin/v-club', icon: ShoppingBag },
  { name: 'Notificações', href: '/admin/notificacoes', icon: Bell },
  { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
]

export default function AdminLayout() {
  const location = useLocation()
  const { signOut, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const NavLinks = () => (
    <nav className="grid gap-1 px-2">
      {adminNav.map((item) => {
        // Handle root admin route specifically to prevent it from always matching true
        const isActive =
          location.pathname === item.href ||
          (location.pathname.startsWith(`${item.href}/`) && item.href !== '/admin')

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden w-full absolute inset-0 z-0">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-background flex-shrink-0 hidden md:flex flex-col h-full z-10 shadow-sm relative">
        <div className="p-4 border-b h-16 flex items-center shrink-0">
          <Link
            to="/admin"
            className="text-lg font-bold tracking-tight text-primary flex items-center gap-2"
          >
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded flex items-center justify-center">
              V
            </span>
            MODA BRASIL
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <NavLinks />
        </div>
        <div className="p-4 border-t bg-muted/30 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-full shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair do Admin
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-background flex items-center px-4 md:hidden shrink-0 z-10 shadow-sm relative">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2 mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b text-left">
                <SheetTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center text-xs">
                    V
                  </span>
                  Admin Dashboard
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <NavLinks />
              </div>
              <div className="p-4 border-t mt-auto">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut()
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold tracking-tight">Painel Administrativo</span>
        </header>

        {/* Page Content area via Outlet */}
        <main className="flex-1 overflow-y-auto bg-background/50 relative">
          <div className="container mx-auto p-4 md:p-8 pb-20 animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
