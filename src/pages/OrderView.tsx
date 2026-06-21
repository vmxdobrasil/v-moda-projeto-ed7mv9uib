import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { QrCode, CreditCard, CheckCircle2, MessageCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function OrderView() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentStep, setPaymentStep] = useState<'selection' | 'pix' | 'asaas' | 'success'>(
    'selection',
  )

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  async function loadData() {
    try {
      const orderRecord = await pb.collection('orders').getOne(id!, { expand: 'seller_id' })
      setOrder(orderRecord)

      const itemsRecords = await pb.collection('order_items').getFullList({
        filter: `order_id="${id}"`,
        expand: 'project_id',
      })
      setItems(itemsRecords)

      if (orderRecord.status === 'paid' || orderRecord.status === 'delivered') {
        setPaymentStep('success')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPayment = async (method: 'pix' | 'asaas') => {
    try {
      await pb.collection('orders').update(id!, { payment_method: method })
      setPaymentStep(method)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro', description: 'Erro ao selecionar pagamento', variant: 'destructive' })
    }
  }

  const handleSendReceipt = () => {
    const phone = order?.expand?.seller_id?.phone || ''
    if (!phone) {
      toast({
        title: 'Aviso',
        description: 'Número do vendedor não encontrado. Entre em contato diretamente.',
        variant: 'destructive',
      })
      return
    }
    const cleanPhone = phone.replace(/\D/g, '')
    const text = `Olá! Realizei o pagamento via PIX do pedido #${id}. Segue o comprovante.`
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) return <div className="p-8 text-center mt-20">Carregando pedido...</div>
  if (!order)
    return <div className="p-8 text-center text-red-500 mt-20">Pedido não encontrado.</div>

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-fade-in-up mt-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Confirmação de Pedido</h1>
        <p className="text-muted-foreground mt-2">Pedido #{id}</p>
        <div className="mt-4">
          <Badge
            variant={order.status === 'pending' ? 'outline' : 'default'}
            className="text-sm px-4 py-1"
          >
            Status:{' '}
            {order.status === 'pending'
              ? 'Aguardando Pagamento'
              : order.status === 'paid'
                ? 'Pago'
                : 'Entregue'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Variação</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.expand?.project_id?.name || 'Produto não encontrado'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.selected_size && <span>Tam: {item.selected_size} </span>}
                          {item.selected_color && <span>Cor: {item.selected_color}</span>}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {(item.price_at_purchase * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-end text-xl font-bold text-orange-600">
                Total: R$ {(order.total_amount || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {paymentStep === 'success' ? (
            <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-700 dark:text-green-400">
                  Pagamento Confirmado
                </h3>
                <p className="mt-2 text-green-600 dark:text-green-500">
                  Seu pedido está em processamento e será enviado em breve.
                </p>
              </CardContent>
            </Card>
          ) : paymentStep === 'selection' ? (
            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full h-16 flex flex-col items-center justify-center gap-1 bg-[#00B4D8] hover:bg-[#0096B4] text-white"
                  onClick={() => handleSelectPayment('pix')}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <QrCode className="w-5 h-5" /> PIX
                  </div>
                  <span className="text-xs opacity-90">Aprovação imediata</span>
                </Button>

                <Button
                  className="w-full h-16 flex flex-col items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-white"
                  onClick={() => handleSelectPayment('asaas')}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <CreditCard className="w-5 h-5" /> Cartão / Boleto
                  </div>
                  <span className="text-xs opacity-90">Via Asaas Seguros</span>
                </Button>
              </CardContent>
            </Card>
          ) : paymentStep === 'pix' ? (
            <Card>
              <CardHeader>
                <CardTitle>Pagamento PIX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex flex-col items-center">
                <div className="p-4 bg-white rounded-lg border">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126420014br.gov.bcb.pix0120exemplo@vmoda.com.br5204000053039865802BR59039866004${(order.total_amount || 0).toFixed(2)}6207V Moda630400006304C4C2`}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-center w-full">
                  <p className="text-sm font-medium">Chave PIX (E-mail):</p>
                  <code className="block p-2 bg-muted rounded mt-1 select-all font-mono text-sm text-orange-600">
                    pagamentos@vmodabrasil.com.br
                  </code>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSendReceipt}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Comprovante
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPaymentStep('selection')}
                >
                  Voltar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pagamento Asaas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  Você será redirecionado para o ambiente seguro do Asaas para finalizar seu
                  pagamento com Cartão de Crédito ou Boleto.
                </p>
                <Button className="w-full bg-[#0030B9] hover:bg-[#002080] text-white">
                  Ir para Checkout Asaas
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setPaymentStep('selection')}
                >
                  Voltar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
