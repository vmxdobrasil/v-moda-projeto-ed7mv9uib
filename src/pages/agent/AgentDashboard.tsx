import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { QrCode, UserPlus } from 'lucide-react'
import { getCustomers, createCustomer, Customer } from '@/services/customers'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function AgentDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })

  const user = pb.authStore.record

  const loadData = async () => {
    try {
      const data = await getCustomers()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCustomer({
        ...formData,
        source: 'manual',
        status: 'new',
      })
      toast({ title: 'Cliente registrado com sucesso!' })
      setIsOpen(false)
      setFormData({ name: '', phone: '', email: '' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  // Mocking commission calculation: 2% of a theoretical average order value (1500) per converted customer
  const convertedCount = customers.filter((c) => c.status === 'converted').length
  const totalCommission = convertedCount * 1500 * 0.02
  const pendingCommission = (customers.length - convertedCount) * 1500 * 0.02 * 0.1 // 10% prob factor

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Painel do Agente</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas captações e monitore suas comissões (2%).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowQR(true)}>
            <QrCode className="w-4 h-4 mr-2" /> Meu QR Code
          </Button>
          <Button onClick={() => setIsOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Registrar Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissão Acumulada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatBRL(totalCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De {convertedCount} clientes com conversão (Mock)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissão Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{formatBRL(pendingCommission)}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimativa de negociações ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Indicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Leads captados por você</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              Você ainda não indicou nenhum cliente.
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.phone || c.email || 'Sem contato extra'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium capitalize ${c.status === 'converted' ? 'text-green-600' : ''}`}
                    >
                      {c.status === 'new'
                        ? 'Novo'
                        : c.status === 'converted'
                          ? 'Convertido'
                          : c.status}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.created).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone (WhatsApp)</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail (opcional)</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">
                Finalizar Cadastro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-sm flex flex-col items-center p-8">
          <DialogHeader>
            <DialogTitle className="text-center mb-4 text-xl">Seu QR Code de Agente</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50">
            <QRCodeDisplay
              data={`https://vmodabrasil.goskip.app/qrcode/agent_${user?.id}`}
              size={220}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Apresente este QR Code para que lojistas e revendedores se cadastrem vinculados a você,
            garantindo a sua comissão de 2%.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
