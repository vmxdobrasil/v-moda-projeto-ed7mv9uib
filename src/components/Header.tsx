import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, User, Menu, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const transparentHeader = isHome && !isScrolled
  const headerClasses = cn(
    'fixed top-0 z-50 w-full transition-all duration-500',
    transparentHeader
      ? 'bg-transparent text-white py-6'
      : 'bg-white/95 text-black py-4 shadow-sm backdrop-blur-md',
  )

  const iconClasses = cn(
    'h-5 w-5 transition-colors hover:text-accent',
    transparentHeader ? 'text-white' : 'text-primary',
  )

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Coleções', path: '/colecoes' },
    { name: 'Produtos', path: '/colecoes' },
    { name: 'Sobre', path: '#' },
  ]

  return (
    <header className={headerClasses}>
      <div className="container flex items-center justify-between">
        {/* Mobile Menu Trigger */}
        <div className="flex flex-1 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 -ml-2">
                <Menu className={iconClasses} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-none">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <nav className="flex flex-col gap-8 mt-12">
                {navLinks.map((link, i) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex-1 md:flex-none flex justify-center md:justify-start">
          <Link to="/" className="font-serif text-2xl font-bold tracking-widest uppercase">
            V Moda
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'text-sm font-medium uppercase tracking-widest transition-colors hover:text-accent relative after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-0 after:bg-current after:transition-all hover:after:w-full',
                transparentHeader ? 'text-white/90' : 'text-primary/80',
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
          <button aria-label="Pesquisar" className="p-1 hidden sm:block">
            <Search className={iconClasses} />
          </button>
          <button aria-label="Favoritos" className="p-1 hidden sm:block">
            <Heart className={iconClasses} />
          </button>
          <button aria-label="Perfil" className="p-1 hidden md:block">
            <User className={iconClasses} />
          </button>

          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Carrinho" className="p-1 relative">
                <ShoppingCart className={iconClasses} />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl text-left">Seu Carrinho</SheetTitle>
              </SheetHeader>
              <div className="flex-1 py-8 flex flex-col items-center justify-center text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">Seu carrinho está vazio.</p>
              </div>
              <div className="border-t pt-6 mt-auto">
                <div className="flex justify-between font-serif text-lg mb-6">
                  <span>Total</span>
                  <span>R$ 0,00</span>
                </div>
                <Button className="w-full rounded-none h-14 uppercase tracking-widest">
                  Finalizar Compra
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
