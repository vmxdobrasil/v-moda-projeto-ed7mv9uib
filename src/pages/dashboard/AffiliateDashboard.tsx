import { useState, useEffect, useCallback } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Copy, DollarSign, Clock, Users, Download, Plus } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'
import { createCustomer } from '@/services/customers'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function AffiliateDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [source, setSource] = useState('social_profile')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    source: 'whatsapp_group',
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
    } catch (e) {
      console.error(e)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('referrals', loadData)
  useRealtime('customers', loadData)

  if (!user || user.role !== 'affiliate') return null

  const commissionRate = (user.commission_rate || 1.0) / 100
  let earned = 0,
    pending = 0

  referrals.forEach((ref) => {
    const val = ref.metadata?.value || 1000
    if (ref.type === 'conversion') earned += val * commissionRate
    else if (ref.type === 'lead') pending += val * commissionRate
  })

  const copyLink = () => {
    const code = user.affiliate_code || user.id
    navigator.clipboard.writeText(`${window.location.origin}/parceiro?ref=${code}&src=${source}`)
    toast({ title: 'Link copiado!', description: 'Link de afiliado copiado com sucesso.' })
  }

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'Origem', 'Data de Registro']
    const csvContent = customers
      .map((c) =>
        [
          c.name,
          c.email || '',
          c.phone || '',
          c.city || '',
          c.state || '',
          c.source === 'whatsapp_group'
            ? 'Grupo WhatsApp'
            : c.source === 'social_profile'
              ? 'Rede Social'
              : c.source || '',
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
    link.download = `leads_afiliado_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast({ title: 'Exportação concluída!', description: 'O download começará em instantes.' })
  }

  const handleManualRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        source: formData.source as any,
        status: 'new',
      })
      toast({ title: 'Lead registrado!', description: 'Cliente adicionado com sucesso.' })
      setIsDialogOpen(false)
      setFormData({ name: '', email: '', phone: '', city: '', state: '', source: 'whatsapp_group' })
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

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-serif font-bold">Painel de Afiliado</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Meus Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
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
            Crie links rastreáveis para compartilhar nos seus canais.
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

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4">
          <div>
            <CardTitle>Meus Leads</CardTitle>
            <CardDescription>Acompanhe e gerencie os clientes indicados.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} disabled={customers.length === 0}>
              <Download className="w-4 h-4 mr-2" /> Exportar Lista
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Lead Manualmente</DialogTitle>
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
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
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
                    <Label>Origem</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(v) => setFormData((f) => ({ ...f, source: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp_group">Grupo de WhatsApp</SelectItem>
                        <SelectItem value="social_profile">Perfil Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Lead'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">{customer.email || '-'}</div>
                    <div className="text-sm text-muted-foreground">{customer.phone || '-'}</div>
                  </TableCell>
                  <TableCell>
                    {customer.city ? `${customer.city}/${customer.state || '-'}` : '-'}
                  </TableCell>
                  <TableCell>
                    {customer.source === 'whatsapp_group'
                      ? 'Grupo WhatsApp'
                      : customer.source === 'social_profile'
                        ? 'Rede Social'
                        : customer.source || 'Manual'}
                  </TableCell>
                  <TableCell>{new Date(customer.created).toLocaleDateString('pt-BR')}</TableCell>
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
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum lead registrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
