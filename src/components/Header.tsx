import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, User, Menu, ShoppingCart, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import useCartStore from '@/stores/useCartStore'
import useWishlistStore from '@/stores/useWishlistStore'
import { formatPrice } from '@/lib/data'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  const { items: cartItems, cartTotal, removeFromCart } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q')
    if (q) {
      setSearchOpen(false)
      navigate(`/colecoes?q=${encodeURIComponent(q as string)}`)
    }
  }

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
    { name: 'Lista de Desejos', path: '/favoritos' },
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
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <button aria-label="Pesquisar" className="p-1 hidden sm:block">
                <Search className={iconClasses} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end" sideOffset={20}>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input name="q" placeholder="Buscar produtos..." className="h-9 rounded-none" />
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-none h-9 uppercase text-xs tracking-wider"
                >
                  Buscar
                </Button>
              </form>
            </PopoverContent>
          </Popover>

          <Link to="/favoritos" aria-label="Favoritos" className="p-1 hidden sm:block relative">
            <Heart className={iconClasses} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link to="/login" aria-label="Minha Conta" className="p-1 hidden md:block">
            <User className={iconClasses} />
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Carrinho" className="p-1 relative">
                <ShoppingCart className={iconClasses} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] flex flex-col border-l-0 shadow-2xl">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl text-left">Seu Carrinho</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 scrollbar-hide">
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">Seu carrinho está vazio.</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 items-center bg-secondary/30 p-2"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPrice(item.product.price)}{' '}
                          <span className="text-xs">x{item.quantity}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-6 mt-auto bg-background">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Quantidade</span>
                  <span>
                    {totalCartItems} {totalCartItems === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="flex justify-between font-serif text-lg mb-6 text-primary">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="space-y-3">
                  {cartItems.length === 0 ? (
                    <Button className="w-full rounded-none h-14 uppercase tracking-widest" disabled>
                      Finalizar Compra
                    </Button>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        asChild
                        className="w-full rounded-none h-14 uppercase tracking-widest"
                      >
                        <Link to="/finalizar-compra">Finalizar Compra</Link>
                      </Button>
                    </SheetClose>
                  )}
                  <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
                    Informações de Entrega e Método de Pagamento serão solicitados na próxima etapa.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
