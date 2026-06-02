import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import useAuthStore from '@/stores/useAuthStore'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { RefreshCw, Smartphone } from 'lucide-react'

export default function ManufacturerVClub() {
  const { user } = useAuthStore()
  const isManager =
    user?.manufacturer_role === 'manager' ||
    user?.role === 'admin' ||
    user?.email === 'valterpmendonca@gmail.com'

  const handleRefund = async (id: string) => {
    if (!isManager) {
      toast.error('Acesso negado: Apenas o Manager pode solicitar estorno.')
      return
    }

    try {
      await pb.send('/backend/v1/v-club/refund', {
        method: 'POST',
        body: JSON.stringify({ transaction_id: id }),
      })
      toast.success('Estorno processado e cashback reconciliado.')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao processar estorno. A transação já pode estar reembolsada.')
    }
  }

  const transactions = [
    { id: 'txn_123', client: 'Lojista Z', amount: 'R$ 4.500,00', status: 'approved' },
    { id: 'txn_124', client: 'Lojista Y', amount: 'R$ 1.200,00', status: 'refunded' },
  ]

  const cards = [
    { id: 'card_1', client: 'Lojista Z', type: 'Virtual', limit: 'R$ 10.000,00' },
    { id: 'card_2', client: 'Lojista X', type: 'Físico', limit: 'R$ 5.000,00' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Meu V CLUB</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie limites, cartões Co-branded e QR Codes dinâmicos.
        </p>
        {!isManager && (
          <Badge variant="destructive" className="mt-2">
            Modo Operador: Ações sensíveis desativadas
          </Badge>
        )}
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transações & Estornos</TabsTrigger>
          <TabsTrigger value="cards">Cartões de Clientes</TabsTrigger>
          <TabsTrigger value="qrcode">QR Codes Dinâmicos</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Gerencie aprovações e reconciliações financeiras.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Transação</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.id}</TableCell>
                      <TableCell>{t.client}</TableCell>
                      <TableCell>{t.amount}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'approved' ? 'default' : 'secondary'}>
                          {t.status === 'approved' ? 'Aprovado' : 'Estornado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.status === 'approved' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRefund(t.id)}
                            disabled={!isManager}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Solicitar Estorno
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle>Cartões Co-branded (Private Label)</CardTitle>
              <CardDescription>
                Acompanhe a emissão de cartões físicos e virtuais com a sua marca e a V MODA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative h-48 w-80 rounded-2xl bg-gradient-to-br from-primary to-orange-400 p-6 text-white shadow-xl flex-shrink-0">
                  <div className="flex justify-between items-start">
                    <span className="font-bold tracking-widest">
                      {user?.name?.toUpperCase() || 'SUA MARCA'}
                    </span>
                    <span className="text-sm font-semibold opacity-80">V MODA</span>
                  </div>
                  <Smartphone className="absolute bottom-6 right-6 h-8 w-8 opacity-50" />
                  <div className="absolute bottom-6 left-6 space-y-1">
                    <p className="font-mono text-lg tracking-widest">**** **** **** 1234</p>
                    <p className="text-xs opacity-80">V CLUB PRIVATE LABEL</p>
                  </div>
                </div>

                <div className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Formato</TableHead>
                        <TableHead>Limite de Crédito</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cards.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.client}</TableCell>
                          <TableCell>
                            <Badge variant={c.type === 'Virtual' ? 'outline' : 'default'}>
                              {c.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{c.limit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle>Vitrine Digital & Produtos</CardTitle>
              <CardDescription>
                Gere QRs que direcionam lojistas para o seu catálogo exclusivo na plataforma PWA.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <QRCodeDisplay
                data={`${window.location.origin}/qrcode/store_${user?.id}`}
                size={200}
              />
              <p className="mt-4 text-sm font-mono bg-muted p-2 rounded">
                /qrcode/store_{user?.id || 'demo'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/qrcode/store_${user?.id}`,
                  )
                  toast.success('Link copiado!')
                }}
              >
                Copiar Link do QR
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
