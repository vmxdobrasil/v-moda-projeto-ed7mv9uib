import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { getAllSubscriptions, Subscription } from '@/services/subscriptions'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<(Subscription & { expand?: { user: any } })[]>(
    [],
  )
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getAllSubscriptions()
      setSubscriptions(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('subscriptions', () => {
    loadData()
  })

  const handleUpdate = async (id: string, field: string, value: any) => {
    try {
      await pb.collection('subscriptions').update(id, { [field]: value })
      toast.success('Assinatura atualizada com sucesso')
      loadData()
    } catch (err) {
      toast.error('Erro ao atualizar assinatura')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando assinaturas...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Assinaturas</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerencie os planos e limites de importação dos membros (varejistas e afiliados).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Limite de Importação</TableHead>
                  <TableHead>Próxima Cobrança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.expand?.user?.name || 'Usuário Desconhecido'}
                    </TableCell>
                    <TableCell>{sub.expand?.user?.email || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={sub.plan_tier}
                        onValueChange={(val) => handleUpdate(sub.id, 'plan_tier', val)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Gratuito</SelectItem>
                          <SelectItem value="basic">Básico</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sub.status}
                        onValueChange={(val) => handleUpdate(sub.id, 'status', val)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="past_due">Pendente</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-[100px]"
                        defaultValue={sub.import_limit || 0}
                        onBlur={(e) =>
                          handleUpdate(sub.id, 'import_limit', parseInt(e.target.value) || 0)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {sub.next_billing_date
                        ? new Date(sub.next_billing_date).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {subscriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma assinatura encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
