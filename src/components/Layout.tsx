import { Outlet, Link } from 'react-router-dom'
import { Shirt } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center space-x-2">
            <Shirt className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">V Moda</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link to="/colecoes" className="transition-colors hover:text-primary">
              Coleções
            </Link>
            <Link to="/sobre-nos" className="transition-colors hover:text-primary">
              Sobre
            </Link>
            <Link to="/contato" className="transition-colors hover:text-primary">
              Contato
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-medium transition-colors hover:text-primary hidden sm:inline-block"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t bg-muted/40 mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2 md:px-0">
            <Shirt className="h-5 w-5 text-muted-foreground" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} V Moda. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>
            <Link
              to="/contato"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Suporte
            </Link>
            <Link
              to="/sobre-nos"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sobre Nós
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
