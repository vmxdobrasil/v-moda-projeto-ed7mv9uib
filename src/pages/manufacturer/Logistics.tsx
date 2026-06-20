import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
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
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export default function ManufacturerLogistics() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<RecordModel[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      const records = await pb.collection('customers').getFullList({
        filter: `manufacturer = '${user.id}'`,
        sort: '-updated',
      })
      setCustomers(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('customers', () => {
    loadData()
  })

  const updateLogistics = async (id: string, data: any) => {
    try {
      await pb.collection('customers').update(id, data)
      toast({ title: 'Logística atualizada' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Gestão de Logística</h1>

      <Card>
        <CardHeader>
          <CardTitle>Acompanhamento de Envios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Método de Envio</TableHead>
                <TableHead>Status Logístico</TableHead>
                <TableHead>Código de Rastreio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={c.shipping_method || 'transportadora'}
                      onValueChange={(val) => updateLogistics(c.id, { shipping_method: val })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transportadora">Transportadora</SelectItem>
                        <SelectItem value="correios">Correios</SelectItem>
                        <SelectItem value="caravana_onibus">Caravana / Ônibus</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={c.logistics_status || 'Aguardando Envio'}
                      onValueChange={(val) => updateLogistics(c.id, { logistics_status: val })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aguardando Envio">Aguardando Envio</SelectItem>
                        <SelectItem value="Postado">Postado</SelectItem>
                        <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                        <SelectItem value="Entregue">Entregue</SelectItem>
                        <SelectItem value="Aguardando Ônibus">Aguardando Ônibus</SelectItem>
                        <SelectItem value="Em Trânsito no Ônibus">Em Trânsito no Ônibus</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      defaultValue={c.tracking_code}
                      placeholder="Código..."
                      onBlur={(e) => {
                        if (e.target.value !== c.tracking_code) {
                          updateLogistics(c.id, { tracking_code: e.target.value })
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum cliente para acompanhar.
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
