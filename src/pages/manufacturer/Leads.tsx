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
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export default function ManufacturerLeads() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leads, setLeads] = useState<RecordModel[]>([])

  const loadLeads = async () => {
    if (!user) return
    try {
      const records = await pb.collection('customers').getFullList({
        filter: `manufacturer = '${user.id}'`,
        sort: '-created',
      })
      setLeads(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [user])

  useRealtime('customers', () => {
    loadLeads()
  })

  const updateStatus = async (id: string, status: string) => {
    try {
      await pb.collection('customers').update(id, { status })
      toast({ title: 'Status atualizado com sucesso' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">CRM & Leads</h1>

      <Card>
        <CardHeader>
          <CardTitle>Meus Clientes em Negociação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="capitalize">{lead.source || 'Manual'}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={lead.status || 'new'}
                      onValueChange={(val) => updateStatus(lead.id, val)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="negotiating">Em Negociação</SelectItem>
                        <SelectItem value="converted">Convertido</SelectItem>
                        <SelectItem value="closed">Perdido</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{new Date(lead.created).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum lead encontrado.
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
