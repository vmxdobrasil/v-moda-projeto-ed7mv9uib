import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, UploadCloud, Search, Phone } from 'lucide-react'
import { getReferredCustomers, createCustomer, type Customer } from '@/services/customers'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import ImportLeadsDialog from './ImportLeadsDialog'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'

const statusMap: Record<string, string> = {
  new: 'Novo',
  interested: 'Interessado',
  negotiating: 'Em Negociação',
  converted: 'Convertido',
  inactive: 'Inativo',
}

export function AgentCustomers() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  const loadData = async () => {
    try {
      const data = await getReferredCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => loadData())

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`
    setPhone(val)
  }

  const canRegister =
    user?.role === 'agent' || user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'

  const handleAddCustomer = async () => {
    if (!name || !phone || !city) {
      toast({ title: 'Preencha todos os campos obrigatórios.', variant: 'destructive' })
      return
    }

    try {
      await createCustomer({
        name,
        phone: phone.replace(/\D/g, ''),
        city,
        source: 'manual',
        status: 'new',
        affiliate_referrer: user?.id,
      })
      toast({ title: 'Cliente adicionado com sucesso!' })
      setIsAddOpen(false)
      setName('')
      setPhone('')
      setCity('')
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao adicionar cliente', description: e.message, variant: 'destructive' })
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {canRegister && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsImportOpen(true)}
            >
              <UploadCloud className="w-4 h-4 mr-2" /> Importar
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Novo Cliente
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Meus Clientes</CardTitle>
          <CardDescription>
            Gerencie sua carteira de clientes e acompanhe as conversões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {customer.phone || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{customer.city || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {statusMap[customer.status] || customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(customer.created), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                WhatsApp / Telefone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">
                Cidade / UF <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo - SP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCustomer}>Salvar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {user && (
        <ImportLeadsDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          onImportStateChange={setImporting}
          onImportComplete={loadData}
          subscription={{ plan_tier: 'pro' }}
          customerCount={customers.length}
        />
      )}
    </div>
  )
}
