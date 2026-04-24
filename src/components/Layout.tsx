import { Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, User, LayoutDashboard } from 'lucide-react'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'

export function Layout() {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-20 items-center justify-between mx-auto px-4 py-2">
          <div className="flex items-center gap-2 h-full">
            <img
              src={logoUrl}
              alt="V Moda Brasil"
              className="h-full max-h-[3rem] w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground hidden sm:flex bg-muted/50 px-3 py-1.5 rounded-full">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name || user?.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  )
}
