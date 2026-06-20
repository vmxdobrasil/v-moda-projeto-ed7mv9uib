import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export default function AdminManufacturers() {
  const [manufacturers, setManufacturers] = useState<RecordModel[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: "role = 'manufacturer'",
        sort: '-created',
      })
      setManufacturers(records)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const updateStatus = async (id: string, is_verified: boolean) => {
    try {
      await pb.collection('users').update(id, { is_verified })
      toast({ title: 'Status atualizado com sucesso' })
      loadData()
    } catch (error) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Fabricantes do Guia</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Fabricantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Verificado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manufacturers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || 'Sem nome'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={user.is_verified}
                      onCheckedChange={(checked) => updateStatus(user.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {manufacturers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum fabricante encontrado.
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
