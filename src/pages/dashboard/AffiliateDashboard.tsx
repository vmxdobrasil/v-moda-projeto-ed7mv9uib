import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Copy,
  DollarSign,
  Clock,
  Users,
  Download,
  Plus,
  Upload,
  MessageCircle,
  FileText,
  Target,
  Image as ImageIcon,
  BusFront,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'
import { createCustomer, updateCustomer } from '@/services/customers'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import ImportLeadsDialog from './components/ImportLeadsDialog'

export default function AffiliateDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [source, setSource] = useState('social_profile')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [manufacturers, setManufacturers] = useState<any[]>([])

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesContent, setNotesContent] = useState('')

  const [editingLogisticsId, setEditingLogisticsId] = useState<string | null>(null)
  const [logisticsNotes, setLogisticsNotes] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'none',
    manufacturer: 'none',
    caravan_name: '',
  })

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'affiliate') return
    try {
      const refs = await pb.collection('referrals').getFullList({
        filter: `affiliate="${user.id}"`,
        sort: '-created',
        expand: 'brand',
      })
      setReferrals(refs)

      const custs = await pb.collection('customers').getFullList({
        filter: `affiliate_referrer="${user.id}"`,
        sort: '-created',
      })
      setCustomers(custs)

      const mfrs = await pb.collection('users').getFullList({
        filter: `role="manufacturer"`,
        sort: 'name',
      })
      setManufacturers(mfrs)
    } catch (e) {
      console.error(e)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('referrals', loadData)
  useRealtime('customers', loadData)
  useRealtime('notifications', (e) => {
    if (e.action === 'create' && e.record.user === user?.id) {
      toast({
        title: e.record.title || 'Nova Notificação',
        description: e.record.message,
      })
    }
  })

  if (!user || user.role !== 'affiliate') return null

  const commissionRate = (user.commission_rate || 2.0) / 100
  let earned = 0,
    pending = 0

  referrals.forEach((ref) => {
    const val = ref.metadata?.amount || ref.metadata?.value || 0
    if (ref.type === 'conversion') earned += val * commissionRate
    else if (ref.type === 'lead') pending += val * commissionRate
  })

  const conversions = referrals.filter((r) => r.type === 'conversion').length
  const nextGoal = Math.max(10, Math.ceil((conversions + 1) / 10) * 10)
  const progressPercent = Math.min(100, (conversions / nextGoal) * 100)

  const copyLink = () => {
    const code = user.affiliate_code || user.id
    navigator.clipboard.writeText(`${window.location.origin}/parceiro?ref=${code}&src=${source}`)
    toast({ title: 'Link copiado!', description: 'Link do Guia copiado com sucesso.' })
  }

  const exportCSV = () => {
    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Cidade',
      'Estado',
      'Origem',
      'Ônibus',
      'Data de Registro',
    ]
    const csvContent = customers
      .map((c) =>
        [
          c.name,
          c.email || '',
          c.phone || '',
          c.city || '',
          c.state || '',
          c.source || 'Não informada',
          c.caravan_name || '',
          new Date(c.created).toLocaleDateString('pt-BR'),
        ]
          .map((v) => `"${v}"`)
          .join(','),
      )
      .join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + headers.join(',') + '\n' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `clientes_guia_transportador_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast({ title: 'Exportação concluída!', description: 'O download começará em instantes.' })
  }

  const handleManualRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }
    if (!formData.phone.trim()) {
      toast({ title: 'Erro', description: 'O telefone é obrigatório.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      if (formData.phone) {
        const existing = await pb
          .collection('customers')
          .getFirstListItem(`phone="${formData.phone}" && affiliate_referrer="${user.id}"`)
          .catch(() => null)

        if (existing) {
          toast({
            title: 'Erro',
            description: 'Um cliente com este telefone já foi registrado por você.',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
      }

      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        status: 'new',
      }

      if (formData.source !== 'none') payload.source = formData.source
      if (formData.manufacturer !== 'none') payload.manufacturer = formData.manufacturer
      if (formData.caravan_name) payload.caravan_name = formData.caravan_name

      await createCustomer(payload)
      toast({ title: 'Cliente registrado!', description: 'Cliente adicionado com sucesso.' })
      setIsDialogOpen(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        source: 'none',
        manufacturer: 'none',
        caravan_name: '',
      })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao registrar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openWhatsApp = (customer: any) => {
    if (!customer.phone) return
    const text = encodeURIComponent(
      `Olá ${customer.name}, sou seu Guia de Compras / Transportador e gostaria de te ajudar...`,
    )
    window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${text}`, '_blank')
  }

  const openNotes = (customer: any) => {
    setEditingNotesId(customer.id)
    setNotesContent(customer.notes || '')
  }

  const saveNotes = async () => {
    if (!editingNotesId) return
    try {
      await pb.collection('customers').update(editingNotesId, { notes: notesContent })
      toast({ title: 'Sucesso', description: 'Anotações salvas com sucesso.' })
      setEditingNotesId(null)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as anotações.',
        variant: 'destructive',
      })
    }
  }

  const handleLogisticsStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCustomer(id, { logistics_status: newStatus })
      toast({ title: 'Status Atualizado', description: 'Status logístico atualizado.' })
      loadData()
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar o status logístico.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-serif font-bold">Painel do Guia de Compras / Transportador</h1>
        <Button asChild className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
          <Link to="/dashboard/media-kit">
            <ImageIcon className="w-4 h-4 mr-2" />
            Acessar Media Kit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Meus Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Meta de Conversões</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversions} / {nextGoal}
            </div>
            <Progress value={progressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-amber-600">Comissão Pendente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">R$ {pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-600">Total Ganho</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {earned.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerador de Links</CardTitle>
          <CardDescription>
            Crie links rastreáveis para compartilhar nos seus canais e registrar clientes
            automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <span className="text-sm font-medium">Origem do Tráfego</span>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_profile">Perfil Social (Instagram, etc)</SelectItem>
                  <SelectItem value="whatsapp_group">Grupo de WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={copyLink} className="mb-[2px] whitespace-nowrap">
              <Copy className="w-4 h-4 mr-2" /> Copiar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leads" className="w-full mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Meus Clientes</TabsTrigger>
          {user.is_transporter && <TabsTrigger value="logistics">Logística de Ônibus</TabsTrigger>}
        </TabsList>
        <TabsContent value="leads" className="m-0">
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4">
              <div>
                <CardTitle>Mini CRM - Meus Clientes</CardTitle>
                <CardDescription>
                  Acompanhe, gerencie e contate os lojistas e sacoleiras indicados.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" /> Importar
                </Button>
                <Button variant="outline" onClick={exportCSV} disabled={customers.length === 0}>
                  <Download className="w-4 h-4 mr-2" /> Exportar Lista
                </Button>

                <ImportLeadsDialog
                  open={isImportDialogOpen}
                  onOpenChange={setIsImportDialogOpen}
                  onImportStateChange={setIsImporting}
                  onImportComplete={loadData}
                />

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" /> Cadastrar Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Registrar Cliente Manualmente</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleManualRegistration} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                        <Input
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData((f) => ({ ...f, state: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="caravan_name">Nome do Ônibus / Excursão (Opcional)</Label>
                        <Input
                          id="caravan_name"
                          value={formData.caravan_name}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, caravan_name: e.target.value }))
                          }
                          placeholder="Ex: Excursão Brás - 15/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Origem (Opcional)</Label>
                        <Select
                          value={formData.source}
                          onValueChange={(v) => setFormData((f) => ({ ...f, source: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a origem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não informada</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="site">Site</SelectItem>
                            <SelectItem value="whatsapp_group">Grupo de WhatsApp</SelectItem>
                            <SelectItem value="social_profile">Perfil Social</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Registrando...' : 'Registrar Cliente'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                          {customer.notes && (
                            <FileText
                              className="inline-block w-3 h-3 ml-2 text-muted-foreground"
                              title="Possui anotações"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{customer.email || '-'}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.city ? `${customer.city}/${customer.state || '-'}` : '-'}
                        </TableCell>
                        <TableCell>{customer.source || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.status === 'converted' ? 'default' : 'secondary'}
                            className={
                              customer.status === 'converted'
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-amber-100 text-amber-800'
                            }
                          >
                            {customer.status === 'converted' ? 'Convertido' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openWhatsApp(customer)}
                              disabled={!customer.phone}
                              title="Chamar no WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openNotes(customer)}
                              title="Anotações / CRM"
                            >
                              <FileText className="w-4 h-4 text-blue-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {customers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhum cliente registrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {user.is_transporter && (
          <TabsContent value="logistics" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BusFront className="w-5 h-5" /> Logística de Ônibus & Coletas
                </CardTitle>
                <CardDescription>
                  Gerencie as mercadorias, passageiros do ônibus e coletas nos fabricantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lojista / Sacoleira</TableHead>
                        <TableHead>Ônibus / Excursão</TableHead>
                        <TableHead>Status Logístico</TableHead>
                        <TableHead>Notas de Coleta</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.caravan_name || '-'}</TableCell>
                          <TableCell>
                            <Select
                              value={c.logistics_status || 'Aguardando Ônibus'}
                              onValueChange={(val) => handleLogisticsStatusChange(c.id, val)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                                <SelectItem value="Em Trânsito no Ônibus">
                                  Em Trânsito no Ônibus
                                </SelectItem>
                                <SelectItem value="Entregue">Entregue</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {c.logistics_notes || 'Nenhuma anotação'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingLogisticsId(c.id)
                                setLogisticsNotes(c.logistics_notes || '')
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" /> Notas
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {customers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            Nenhum registro logístico.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Sheet open={!!editingNotesId} onOpenChange={(open) => !open && setEditingNotesId(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Anotações do Cliente</SheetTitle>
            <SheetDescription>
              Registre preferências, tamanhos, histórico de conversas ou interesses específicos.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <Textarea
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Ex: Cliente prefere vestidos tamanho M..."
              className="min-h-[250px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNotesId(null)}>
                Cancelar
              </Button>
              <Button onClick={saveNotes}>Salvar Anotações</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!editingLogisticsId}
        onOpenChange={(open) => !open && setEditingLogisticsId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas de Logística / Coleta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={logisticsNotes}
              onChange={(e) => setLogisticsNotes(e.target.value)}
              placeholder="Ex: Coletar 5 volumes na loja X do Setor Fama para o Ônibus."
              className="min-h-[150px] resize-none"
            />
            <Button
              onClick={async () => {
                if (!editingLogisticsId) return
                try {
                  await pb
                    .collection('customers')
                    .update(editingLogisticsId, { logistics_notes: logisticsNotes })
                  toast({ title: 'Sucesso', description: 'Notas salvas.' })
                  setEditingLogisticsId(null)
                  loadData()
                } catch (err) {
                  toast({
                    title: 'Erro',
                    variant: 'destructive',
                    description: 'Não foi possível salvar.',
                  })
                }
              }}
              className="w-full"
            >
              Salvar Notas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
