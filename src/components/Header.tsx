import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Heart, User, Menu, ShoppingCart, X, Instagram, Bell } from 'lucide-react'
import {
  getMyNotifications,
  markNotificationRead,
  type Notification,
} from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import useCartStore from '@/stores/useCartStore'
import useWishlistStore from '@/stores/useWishlistStore'
import useAuthStore from '@/stores/useAuthStore'
import { formatPrice } from '@/lib/data'
import { BrandLogo } from '@/components/BrandLogo'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  const { items: cartItems, removeFromCart, updateQuantity } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const { user, isAuthenticated, logout } = useAuthStore()

  const [notifications, setNotifications] = useState<Notification[]>([])

  const loadNotifications = async () => {
    if (!isAuthenticated) return
    try {
      const data = await getMyNotifications()
      setNotifications(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [isAuthenticated, user])

  useRealtime(
    'notifications',
    () => {
      loadNotifications()
    },
    isAuthenticated,
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (e) {
      console.error(e)
    }
  }

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = cartItems.reduce((acc, item) => {
    const price =
      user?.type === 'Atacado' && item.product.wholesalePrice
        ? item.product.wholesalePrice
        : item.product.price
    return acc + price * item.quantity
  }, 0)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

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
    { name: 'INÍCIO', path: '/' },
    { name: 'COLEÇÕES', path: '/colecoes' },
    { name: 'GUIA DE MODA', path: '/guia-de-moda' },
    { name: 'CONHECIMENTO', path: '/conhecimento' },
    { name: 'REVISTA DIGITAL', path: '/revista' },
    { name: 'SOBRE NÓS', path: '/sobre-nos' },
    { name: 'CONTATO', path: '/contato' },
    { name: 'SEJA UMA REVENDEDORA', path: '/revenda' },
  ]

  if (isAuthenticated && (user?.role === 'manufacturer' || user?.role === 'admin')) {
    navLinks.push({ name: 'PAINEL ADMIN', path: '/dashboard' })
  }

  const mobileNavLinks = [
    ...navLinks,
    { name: 'Lista de Desejos', path: '/favoritos' },
    { name: 'FAQ', path: '/faq' },
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
                {mobileNavLinks.map((link, i) => (
                  <SheetClose asChild key={link.name}>
                    <Link
                      to={link.path}
                      className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}

                {isAuthenticated ? (
                  <>
                    <SheetClose asChild>
                      <Link
                        to="/dashboard"
                        className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                      >
                        {user?.role === 'manufacturer' || user?.role === 'admin'
                          ? 'Painel Admin'
                          : 'Meu Painel'}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/perfil"
                        className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                      >
                        Meu Perfil
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/meus-pedidos"
                        className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                      >
                        Meus Pedidos
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <button
                        onClick={handleLogout}
                        className="text-2xl font-serif text-left text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Sair
                      </button>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/login"
                      className="text-2xl font-serif text-primary hover:text-accent transition-colors"
                    >
                      Entrar / Cadastrar
                    </Link>
                  </SheetClose>
                )}

                <div className="mt-8 pt-8 border-t flex justify-center">
                  <a
                    href="https://www.instagram.com/revistamodaatual"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-primary hover:text-accent transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex-1 md:flex-none flex justify-center md:justify-start">
          <Link to="/" className="flex items-center">
            <BrandLogo
              type="brand_logo"
              fallbackText="V MODA"
              className="h-8 md:h-10 w-auto object-contain"
              fallbackClassName="font-serif text-2xl font-bold tracking-widest uppercase"
            />
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
          <a
            href="https://www.instagram.com/revistamodaatual"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram @revistamodaatual"
            className="p-1 hidden lg:block"
          >
            <Instagram className={iconClasses} />
          </a>

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

          {isAuthenticated && (
            <Popover>
              <PopoverTrigger asChild>
                <button aria-label="Notificações" className="p-1 relative hidden md:block">
                  <Bell className={iconClasses} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" sideOffset={20}>
                <div className="p-4 border-b flex items-center justify-between">
                  <h4 className="font-medium text-sm">Notificações</h4>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadCount} não lidas</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Nenhuma notificação
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3',
                            !notification.read && 'bg-primary/5',
                          )}
                          onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                        >
                          <div className="flex-1 space-y-1">
                            <p
                              className={cn(
                                'text-sm',
                                !notification.read && 'font-medium text-primary',
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70">
                              {new Date(notification.created).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="shrink-0 flex items-center pt-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Minha Conta" className="p-1 hidden md:block">
                {isAuthenticated && user ? (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className={iconClasses} />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-none">
              {isAuthenticated ? (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium border-b mb-1 truncate">
                    Olá, {user?.name.split(' ')[0]}
                  </div>
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                    <Link to="/dashboard">
                      {user?.role === 'manufacturer' || user?.role === 'admin'
                        ? 'Painel Admin'
                        : 'Meu Painel'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                    <Link to="/perfil">Meu Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                    <Link to="/meus-pedidos">Meus Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-none cursor-pointer text-destructive focus:text-destructive"
                  >
                    Sair
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild className="rounded-none cursor-pointer">
                  <Link to="/login">Entrar / Cadastrar</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
                        {item.size && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Tamanho: {item.size}
                          </p>
                        )}
                        <div className="flex flex-col mt-1">
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(
                              user?.type === 'Atacado' && item.product.wholesalePrice
                                ? item.product.wholesalePrice
                                : item.product.price,
                            )}
                          </p>
                          {user?.type === 'Atacado' && item.product.wholesalePrice && (
                            <span className="text-[10px] text-accent font-medium uppercase tracking-wider">
                              Preço Atacado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center border border-border w-24 h-8 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1, item.size)
                            }
                            className="flex-1 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1, item.size)
                            }
                            className="flex-1 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors self-start"
                        aria-label="Remover item"
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
