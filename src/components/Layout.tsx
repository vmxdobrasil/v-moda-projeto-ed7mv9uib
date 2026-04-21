import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Shirt, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Layout() {
  const navigate = useNavigate()
  const [isAuth, setIsAuth] = useState(pb.authStore.isValid)

  useEffect(() => {
    return pb.authStore.onChange(() => {
      setIsAuth(pb.authStore.isValid)
    })
  }, [])

  const handleLogout = () => {
    pb.authStore.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <Shirt className="h-6 w-6" />
              <span className="font-bold text-xl hidden sm:inline-block text-foreground">
                V Moda
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/colecoes"
                className="transition-colors hover:text-primary text-foreground/70"
              >
                Coleções
              </Link>
              <Link
                to="/marcas"
                className="transition-colors hover:text-primary text-foreground/70"
              >
                Marcas
              </Link>
              <Link
                to="/sobre-nos"
                className="transition-colors hover:text-primary text-foreground/70"
              >
                Sobre
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {isAuth ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/dashboard">Painel</Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Entrar</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/cadastro">Criar Conta</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/colecoes">Coleções</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/marcas">Marcas</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/sobre-nos">Sobre</Link>
                  </DropdownMenuItem>
                  <div className="my-2 border-t" />
                  {isAuth ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">Painel</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleLogout}>Sair</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/login">Entrar</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/cadastro">Criar Conta</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t py-8 md:py-12 bg-muted/40">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <Shirt className="h-6 w-6" />
              <span className="font-bold text-xl text-foreground">V Moda</span>
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left max-w-xs">
              A plataforma definitiva para negócios no mercado de moda atacadista do Brasil.
            </p>
          </div>

          <div className="flex gap-8 text-sm sm:gap-12 md:gap-16 justify-center text-center md:text-left">
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-foreground">Plataforma</h4>
              <Link to="/colecoes" className="text-muted-foreground hover:text-primary">
                Coleções
              </Link>
              <Link to="/marcas" className="text-muted-foreground hover:text-primary">
                Marcas
              </Link>
              <Link to="/sobre-nos" className="text-muted-foreground hover:text-primary">
                Sobre Nós
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-foreground">Ajuda</h4>
              <Link to="/faq" className="text-muted-foreground hover:text-primary">
                FAQ
              </Link>
              <Link to="/contato" className="text-muted-foreground hover:text-primary">
                Contato
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-muted-foreground/10 pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} V Moda. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
