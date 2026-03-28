import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, User, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

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
    { name: 'Tendências', path: '/colecoes?filter=tendencias' },
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
          <button aria-label="Pesquisar" className="p-1">
            <Search className={iconClasses} />
          </button>
          <button aria-label="Favoritos" className="p-1">
            <Heart className={iconClasses} />
          </button>
          <button aria-label="Perfil" className="hidden md:block p-1">
            <User className={iconClasses} />
          </button>
        </div>
      </div>
    </header>
  )
}
