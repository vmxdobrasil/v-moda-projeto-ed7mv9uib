import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ManufacturerVClub() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<any>(null)
  const [vipCustomers, setVipCustomers] = useState<any[]>([])
  const [cashback, setCashback] = useState('0')
  const [commission, setCommission] = useState('0')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadSettings()
      loadVips()
    }
  }, [user])

  async function loadSettings() {
    try {
      const recs = await pb
        .collection('v_club_settings')
        .getFullList({ filter: `store = "${user?.id}"` })
      if (recs.length > 0) {
        setSettings(recs[0])
        setCashback(recs[0].store_cashback_rate?.toString() || '0')
        setCommission(recs[0].platform_commission_rate?.toString() || '0')
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function loadVips() {
    try {
      const cards = await pb.collection('v_club_cards').getFullList({
        filter: `store = "${user?.id}" && status = "active"`,
        expand: 'customer',
      })
      setVipCustomers(cards.map((c) => c.expand?.customer).filter(Boolean))
    } catch (e) {
      console.error(e)
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        store: user?.id,
        store_cashback_rate: parseFloat(cashback),
        platform_commission_rate: parseFloat(commission),
        is_active: true,
        store_identifier:
          settings?.store_identifier || Math.random().toString(36).substring(2, 6).toUpperCase(),
      }
      if (settings) {
        await pb.collection('v_club_settings').update(settings.id, data)
      } else {
        const res = await pb.collection('v_club_settings').create(data)
        setSettings(res)
      }
      toast({ title: 'Configurações salvas com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Gestão VIP V Club</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas taxas de cashback e gerencie seus clientes VIP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Configurações do Clube</CardTitle>
            <CardDescription>Defina as vantagens para seus clientes VIP.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="space-y-2">
                <Label>Taxa de Cashback (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={cashback}
                  onChange={(e) => setCashback(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Valor que retorna para o cliente VIP.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Taxa da Plataforma (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Seus Clientes VIP</CardTitle>
            <CardDescription>Clientes com V Club Card ativo na sua loja.</CardDescription>
          </CardHeader>
          <CardContent>
            {vipCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Nenhum cliente VIP encontrado.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vipCustomers.map((vip, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{vip.name}</TableCell>
                      <TableCell>{vip.phone || vip.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                          VIP V Club
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
