import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Home,
  Users,
  Package,
  MessageSquare,
  Settings,
  Truck,
  TrendingUp,
  BookOpen,
  UserPlus,
  Factory,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Globe,
  CheckCircle2,
  Clock,
  X,
  Play,
  ExternalLink,
} from 'lucide-react'
import { Suspense } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/v_moda_brasil_horizontal_fiel-afff8.png'
import { ExternalLink as CustomExternalLink } from '@/components/ExternalLink'
import { WhatsappStatusWidget } from '@/components/WhatsappStatusWidget'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { toast } from 'sonner'

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Leads / Clientes', path: '/customers' },
  { icon: GraduationCap, label: 'Academy', path: '/resources' },
  { icon: Package, label: 'Projetos', path: '/products' },
  { icon: MessageSquare, label: 'Mensagens', path: '/messages' },
  { icon: Truck, label: 'Logística', path: '/logistics' },
  { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
  {
    icon: BookOpen,
    label: 'Site Oficial',
    path: 'https://revistamodaatual.com.br',
    external: true,
  },
  {
    icon: Play,
    label: 'Play Store',
    path: 'https://play.google.com/store/apps/details?id=com.revista-moda-atual/id6475497663',
    external: true,
  },
  { icon: UserPlus, label: 'Afiliados', path: '/affiliates' },
  { icon: Factory, label: 'Fabricantes', path: '/manufacturers' },
  { icon: ShieldCheck, label: 'Agentes Credenciados', path: '/admin/agentes', adminOnly: true },
  { icon: Settings, label: 'Configurações', path: '/settings' },
]

export default function DashboardLayout() {
  const { signOut, user } = useAuth()
  const location = useLocation()

  const isAdmin = user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false
    return true
  })

  const [isNormalizing, setIsNormalizing] = useState(false)

  const navigate = useNavigate()

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Olá! Teste de conexão V MODA BRASIL.')
  const [testInstance, setTestInstance] = useState('')
  const [instanceStatus, setInstanceStatus] = useState<'checking' | 'connected' | 'disconnected'>(
    'checking',
  )
  const [instanceError, setInstanceError] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)

  const checkInstanceHealth = async () => {
    setInstanceStatus('checking')
    setInstanceError('')
    try {
      const configs = await pb
        .collection('whatsapp_configs')
        .getFullList({ filter: `user = "${user?.id}"` })
      if (!configs || configs.length === 0) {
        setInstanceStatus('disconnected')
        setInstanceError('Nenhuma configuração de WhatsApp encontrada.')
        return
      }
      const config = configs[0]
      const instanceStr = config.instance_id || ''
      const firstInstance = instanceStr.split(',')[0].trim()

      if (!firstInstance) {
        setInstanceStatus('disconnected')
        setInstanceError('Nenhuma instância configurada.')
        return
      }
      setTestInstance(firstInstance)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      let res
      try {
        res = await pb.send(`/backend/v1/whatsapp/status?instance=${firstInstance}`, {
          method: 'GET',
          signal: controller.signal,
        })
      } catch (e: any) {
        if (e.name === 'AbortError' || e.isAbort) {
          throw new Error('Serviço Indisponível (Timeout)')
        }
        throw e
      } finally {
        clearTimeout(timeoutId)
      }

      if (res?.instance?.state === 'open' || res?.state === 'open') {
        setInstanceStatus('connected')
      } else {
        setInstanceStatus('disconnected')
        setInstanceError(res?.error || res?.instance?.state || res?.state || 'Desconectado')
      }
    } catch (err: any) {
      setInstanceStatus('disconnected')
      const statusStr = err.status ? ` (${err.status})` : ''
      const msg = err.response?.error || err.message || 'Erro ao verificar status da instância.'
      setInstanceError(`Serviço Indisponível${statusStr}: ${msg}`)
    }
  }

  useEffect(() => {
    if (isTestDialogOpen && user) {
      checkInstanceHealth()
    }
  }, [isTestDialogOpen, user])

  const normalizePhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '')
    if (digits.startsWith('55') && digits.length >= 12 && digits.length <= 13) {
      return digits
    }
    if (digits.length === 10 || digits.length === 11) {
      return '55' + digits
    }
    return digits
  }

  const handleSendTest = async () => {
    if (!pb.authStore.isValid) {
      toast.error('Sessão expirada. Por favor, faça login novamente.')
      navigate('/admin/login')
      return
    }

    if (instanceStatus !== 'connected') {
      toast.error('A instância não está conectada. Verifique as configurações.')
      return
    }

    const normalizedPhone = normalizePhone(testPhone)
    if (!normalizedPhone || normalizedPhone.length < 12) {
      toast.error('Número de telefone inválido. O formato esperado é 55 + DDD + 9 dígitos.')
      return
    }

    try {
      setIsSendingTest(true)
      const toastId = toast.loading('Enviando mensagem de teste...')

      await pb.send('/backend/v1/whatsapp/test-message', {
        method: 'POST',
        body: JSON.stringify({
          instance: testInstance,
          phone: normalizedPhone,
          text: testMessage,
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      toast.dismiss(toastId)
      toast.success(`Mensagem enviada com sucesso para ${normalizedPhone}`)
      setIsTestDialogOpen(false)
      setTestPhone('')
    } catch (err: any) {
      toast.dismiss()
      const errorMsg = getErrorMessage(err)
      toast.error(errorMsg || 'Erro ao enviar mensagem de teste')
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleNormalizePhones = async () => {
    try {
      setIsNormalizing(true)
      toast.loading('Normalizando números de telefone...')
      const res = await pb.send('/backend/v1/customers/normalize', { method: 'POST' })
      toast.dismiss()
      toast.success(`${res.count} números foram normalizados com sucesso.`)
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Erro ao normalizar números')
    } finally {
      setIsNormalizing(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-full bg-background">
        <Sidebar>
          <SidebarHeader className="h-auto min-h-[6rem] flex items-center justify-center border-b px-6 py-6 shrink-0">
            <img
              src={logoUrl}
              alt="V Moda Brasil"
              className="w-full max-w-[240px] h-auto object-contain transition-all duration-300"
            />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => {
                    const isActive =
                      !item.external &&
                      (location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path)))
                    return (
                      <SidebarMenuItem key={item.path}>
                        {item.external ? (
                          <CustomExternalLink
                            href={item.path}
                            className="group flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm font-medium text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2"
                            title={item.label}
                            forceTopBreakout={item.path.includes('play.google.com')}
                          >
                            <div className="flex flex-1 items-center gap-2 overflow-hidden">
                              <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
                          </CustomExternalLink>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                            className={isActive ? 'text-primary hover:text-primary' : ''}
                          >
                            <Link to={item.path}>
                              <item.icon
                                className={cn('h-4 w-4', isActive && 'text-primary')}
                                strokeWidth={isActive ? 2.5 : 2}
                              />
                              <span className={cn(isActive && 'font-semibold')}>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && (
              <SidebarGroup className="mt-auto">
                <SidebarGroupLabel>Gerenciamento de Contatos</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={handleNormalizePhones}
                        disabled={isNormalizing}
                        tooltip="Normalizar Números"
                      >
                        <CheckCircle2
                          className={cn('h-4 w-4 shrink-0', isNormalizing && 'animate-pulse')}
                          strokeWidth={2}
                        />
                        <span className="truncate">
                          {isNormalizing ? 'Normalizando...' : 'Normalizar Números'}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => setIsTestDialogOpen(true)}
                        tooltip="Enviar Teste WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" strokeWidth={2} />
                        <span className="truncate">Enviar Teste</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t p-4 shrink-0">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  'U'}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate text-foreground">
                  {user?.name || 'Administrador'}
                </span>
                <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Disparo de Teste WhatsApp</DialogTitle>
              <DialogDescription>
                Valide a conexão da sua instância enviando uma mensagem de teste.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Status da Instância</span>
                  <span className="text-xs text-muted-foreground">
                    {testInstance || 'Verificando...'}
                  </span>
                </div>
                {instanceStatus === 'checking' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Verificando
                  </Badge>
                )}
                {instanceStatus === 'connected' && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">Conectado</Badge>
                )}
                {instanceStatus === 'disconnected' && (
                  <Badge variant="destructive">Desconectado</Badge>
                )}
              </div>

              {instanceStatus === 'disconnected' && instanceError && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                  <strong>Erro:</strong> {instanceError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="test-phone">Telefone (WhatsApp)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none pointer-events-none text-sm">
                    🇧🇷 +
                  </span>
                  <Input
                    id="test-phone"
                    placeholder="5511999999999"
                    className="pl-[3.5rem]"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  O DDD e o DDI (55) serão formatados automaticamente.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem</Label>
                <Textarea
                  id="test-message"
                  placeholder="Digite sua mensagem de teste..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="resize-none h-24"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTestDialogOpen(false)}
                disabled={isSendingTest}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSendTest}
                disabled={isSendingTest || instanceStatus !== 'connected' || !testPhone}
              >
                {isSendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  'Enviar Mensagem'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/20">
          <header className="h-16 border-b flex items-center px-6 bg-background shrink-0 shadow-sm z-10">
            <SidebarTrigger className="md:hidden mr-4" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 mr-2">
                <CustomExternalLink
                  href="https://revistamodaatual.com.br"
                  className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Site Oficial</span>
                  <ExternalLink className="ml-0.5 h-3 w-3 opacity-50" />
                </CustomExternalLink>
                <CustomExternalLink
                  href="https://play.google.com/store/apps/details?id=com.revista-moda-atual/id6475497663"
                  forceTopBreakout={true}
                  className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Play className="h-4 w-4 text-emerald-500" />
                  <span>Play Store</span>
                  <ExternalLink className="ml-0.5 h-3 w-3 opacity-50" />
                </CustomExternalLink>
              </div>
              <ErrorBoundary>
                <WhatsappStatusWidget />
              </ErrorBoundary>
              <div className="text-sm font-medium text-muted-foreground hidden lg:block border-l pl-4 py-1">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                      <p className="text-muted-foreground">Sincronizando Dados do Serviço...</p>
                    </div>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
