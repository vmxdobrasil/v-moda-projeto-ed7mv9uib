import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Settings, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouteLabels } from '@/hooks/use-route-labels'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'

const HEADER_NAV = [
  { label: 'Resumo', path: '/crm' },
  { label: 'Fundadores', path: '/crm/fundadores' },
  { label: 'Finanças', path: '/financeiro' },
  { label: 'Contatos', path: '/crm/leads' },
  { label: 'Crescimento', path: '/crm/pipeline' },
  { label: 'Projetos', path: '/admin/produtos' },
]

const ROLE_LABELS: Record<string, string> = {
  admin: 'CEO',
  manufacturer: 'Fabricante',
  retailer: 'Varejista',
  agent: 'Agente',
  fashionista: 'Fashionista',
  affiliate: 'Afiliado',
}

export function GlassHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { currentLabel } = useRouteLabels()

  const safeLabel =
    currentLabel === 'Login' || currentLabel === 'Entrar' || currentLabel === 'Início'
      ? 'Painel CRM'
      : currentLabel

  const userName = user?.name || 'Valter Mendonça'
  const roleLabel = ROLE_LABELS[user?.role || 'admin'] || 'CEO'
  const initials =
    userName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'VM'

  const handleSignOut = () => {
    signOut()
    toast.success('Sessão encerrada com sucesso.')
    navigate('/login')
  }

  return (
    <header className="crm-header rounded-[28px] px-5 py-3 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-5">
        <img src={logoUrl} alt="V MODA BRASIL" className="h-9 w-auto object-contain" />
        <div className="hidden xl:block h-6 w-px bg-white/10" />
        <span className="hidden xl:block text-sm font-display text-white/40 transition-all duration-300">
          {safeLabel}
        </span>
        <div className="hidden lg:flex items-center gap-1">
          {HEADER_NAV.map((link) => {
            const isActive =
              link.path === '/crm'
                ? location.pathname === '/crm'
                : location.pathname.startsWith(link.path)
            return (
              <Link
                key={link.label}
                to={link.path}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium font-display transition-all duration-300 hover:-translate-y-0.5 hover:scale-105',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-1.5 border border-white/10 transition-all duration-300 hover:border-primary/20 hover:scale-105">
          <Search className="w-4 h-4 text-white/40 mr-2 shrink-0" />
          <Input
            placeholder="Buscar..."
            className="border-0 bg-transparent p-0 h-auto text-sm text-white placeholder:text-white/40 focus-visible:ring-0 w-40"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white/60 hover:text-primary hover:bg-white/5 relative h-9 w-9 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-3 border-l border-white/10 outline-none cursor-pointer transition-all duration-300 hover:scale-105">
              <Avatar className="w-9 h-9 border-2 border-primary/30 transition-all duration-300 hover:scale-105">
                <AvatarFallback className="bg-gradient-to-br from-primary to-electric text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight font-display">
                  {userName}
                </p>
                <p className="text-[10px] text-primary leading-tight uppercase tracking-wider">
                  {roleLabel}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel className="font-display">
              <p className="text-sm font-semibold">{userName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/configuracoes" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
