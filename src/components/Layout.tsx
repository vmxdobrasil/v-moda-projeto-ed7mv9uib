import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, ShoppingBag, Heart } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  // PocketBase auth store state
  const isAuth = pb.authStore.isValid

  useEffect(() => {
    // Close mobile menu whenever the route changes
    setIsMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <ShoppingBag className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl tracking-tight">V MODA</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                to="/colecoes"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Coleções
              </Link>
              <Link
                to="/guia-de-moda"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Guia de Moda
              </Link>
              <Link
                to="/beneficios"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Benefícios
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuth ? (
              <>
                <Link
                  to="/favoritos"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Favoritos"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Button asChild variant="default" className="rounded-full px-6">
                  <Link to="/dashboard">Meu Painel</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="font-medium">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="rounded-full px-6">
                  <Link to="/cadastro">Criar Conta</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background border-b animate-fade-in-down overflow-y-auto">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            <Link to="/colecoes" className="text-lg font-medium py-2 border-b border-border/50">
              Coleções
            </Link>
            <Link to="/guia-de-moda" className="text-lg font-medium py-2 border-b border-border/50">
              Guia de Moda
            </Link>
            <Link to="/beneficios" className="text-lg font-medium py-2 border-b border-border/50">
              Benefícios
            </Link>

            <div className="mt-4 flex flex-col gap-3">
              {isAuth ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-start h-12">
                    <Link to="/favoritos">
                      <Heart className="mr-2 h-4 w-4" /> Meus Favoritos
                    </Link>
                  </Button>
                  <Button asChild className="w-full h-12">
                    <Link to="/dashboard">Acessar Painel</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full h-12">
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild className="w-full h-12">
                    <Link to="/cadastro">Criar Conta</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/30 pt-16 pb-8 text-center md:text-left">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link to="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">V MODA</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              O maior polo de moda do Brasil, conectando fabricantes, revendedores e afiliados em
              uma plataforma única.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground mb-1">Links Rápidos</h4>
            <Link
              to="/sobre-nos"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Sobre Nós
            </Link>
            <Link
              to="/contato"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contato
            </Link>
            <Link
              to="/faq"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Perguntas Frequentes
            </Link>
            <Link
              to="/revista"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Revista V Moda
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground mb-1">Para Negócios</h4>
            <Link
              to="/revenda"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Seja um Revendedor
            </Link>
            <Link
              to="/parceiro"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Seja um Fabricante
            </Link>
            <Link
              to="/afiliados"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Programa de Afiliados
            </Link>
            <Link
              to="/conhecimento"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Academy
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-foreground mb-1">Legal</h4>
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors">
              Termos de Serviço
            </span>
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors">
              Política de Privacidade
            </span>
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors">
              Trocas e Devoluções
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-border/50 text-sm text-muted-foreground/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} V Moda. Todos os direitos reservados.</p>
          <p className="text-xs">Feito com tecnologia para impulsionar o mercado de moda.</p>
        </div>
      </footer>
    </div>
  )
}
