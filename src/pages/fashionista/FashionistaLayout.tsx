import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Sparkles, ShoppingBag, Heart, User, LogOut, Home } from 'lucide-react'

export default function FashionistaLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full glass-nav border-b border-border/40 shadow-soft">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/fashionista" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-lg tracking-tight">
                V MODA <span className="text-primary">Fashionista</span>
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/fashionista">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Início</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/fashionista/catalog">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Comprar</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/fashionista/wishlist">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Favoritos</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link to="/fashionista/profile">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <p>V MODA BRASIL © 2026 — Experiência Fashionista</p>
      </footer>
    </div>
  )
}
