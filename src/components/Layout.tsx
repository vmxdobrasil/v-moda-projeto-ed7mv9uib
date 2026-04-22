import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Package, Search, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import pb from '@/lib/pocketbase/client'

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const handleLogout = () => {
    pb.authStore.clear()
    navigate('/login')
  }

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Coleções', path: '/colecoes' },
    { name: 'Sobre Nós', path: '/sobre-nos' },
    { name: 'Contato', path: '/contato' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
                V Moda
              </span>
            </Link>

            <nav className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/favoritos">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Favoritos</span>
              </Link>
            </Button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">Painel</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sair
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            )}

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu principal</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${
                        location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}

                  <div className="h-px bg-border my-4" />

                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-primary"
                      >
                        Acessar Painel
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className="text-left text-lg font-medium text-muted-foreground hover:text-primary"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-primary"
                      >
                        Entrar
                      </Link>
                      <Link
                        to="/cadastro"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-primary"
                      >
                        Cadastrar
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/40 mt-auto">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl tracking-tight">V Moda</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma B2B para lojistas e fabricantes de moda. Encontre as melhores coleções e
                feche negócios.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/sobre-nos" className="hover:text-primary transition-colors">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link to="/colecoes" className="hover:text-primary transition-colors">
                    Coleções
                  </Link>
                </li>
                <li>
                  <Link to="/afiliados" className="hover:text-primary transition-colors">
                    Seja um Afiliado
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Ajuda</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/faq" className="hover:text-primary transition-colors">
                    Dúvidas Frequentes
                  </Link>
                </li>
                <li>
                  <Link to="/contato" className="hover:text-primary transition-colors">
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link to="/guia-de-moda" className="hover:text-primary transition-colors">
                    Guia de Moda
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} V Moda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
