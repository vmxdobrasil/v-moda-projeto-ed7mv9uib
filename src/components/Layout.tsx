import { Outlet, Link, useLocation } from 'react-router-dom'
import { Store, User, LogOut, Menu, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import useAuthStore from '@/stores/useAuthStore'
import { cn } from '@/lib/utils'

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const location = useLocation()

  const handleSignOut = () => {
    signOut()
  }

  const navigation = [
    { name: 'Coleções', href: '/colecoes' },
    { name: 'Marcas', href: '/marcas/todas' },
    { name: 'Benefícios', href: '/beneficios' },
    { name: 'Revista', href: '/revista' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <Store className="h-6 w-6 text-primary" />
              <span>V Moda</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 ml-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname.startsWith(item.href)
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/favoritos">Favoritos</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/dashboard">Painel B2B</Link>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <Link to="/perfil">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/cadastro">Cadastrar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b bg-background px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="h-px bg-border w-full my-4" />
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/dashboard">Acessar Painel B2B</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/perfil">Meu Perfil</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button className="w-full" asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/cadastro">Cadastrar</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-zinc-50 py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900"
            >
              <Store className="h-6 w-6 text-primary" />
              <span>V Moda</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              A plataforma que revoluciona o mercado atacadista de moda no Brasil, conectando quem
              produz com quem vende.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li>
                <Link to="/sobre-nos" className="hover:text-primary transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link to="/marcas/todas" className="hover:text-primary transition-colors">
                  Marcas Parceiras
                </Link>
              </li>
              <li>
                <Link to="/afiliados" className="hover:text-primary transition-colors">
                  Programa de Afiliados
                </Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-primary transition-colors">
                  Planos e Preços
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Ajuda</h4>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-primary transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-primary transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-zinc-600">
              <li>contato@vmoda.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Goiânia, GO - Brasil</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} V Moda. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
