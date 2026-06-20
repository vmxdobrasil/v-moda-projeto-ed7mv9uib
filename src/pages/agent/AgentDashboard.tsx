import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export default function AgentDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [regions, setRegions] = useState(user?.operating_regions || '')
  const [cities, setCities] = useState(user?.operating_cities || '')
  const [customers, setCustomers] = useState<RecordModel[]>([])

  useEffect(() => {
    if (!user) return
    const loadAssignedCustomers = async () => {
      try {
        const records = await pb.collection('customers').getList(1, 20, {
          filter: "caravan_name != ''",
          sort: '-created',
        })
        setCustomers(records.items)
      } catch (err) {
        console.error(err)
      }
    }
    loadAssignedCustomers()
  }, [user])

  const updateProfile = async () => {
    if (!user) return
    try {
      await pb.collection('users').update(user.id, {
        operating_regions: regions,
        operating_cities: cities,
      })
      toast({ title: 'Perfil atualizado' })
    } catch (err) {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' })
    }
  }

  const updateNotes = async (id: string, notes: string) => {
    try {
      await pb.collection('customers').update(id, { logistics_notes: notes })
      toast({ title: 'Notas atualizadas' })
    } catch (error) {
      toast({ title: 'Erro ao atualizar notas', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Portal do Agente / Guia</h1>

      <Card>
        <CardHeader>
          <CardTitle>Minhas Regiões de Atuação</CardTitle>
          <CardDescription>Defina onde você atua para receber leads e caravanas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label>Regiões</Label>
            <Input
              value={regions}
              onChange={(e) => setRegions(e.target.value)}
              placeholder="Ex: Brás, Bom Retiro..."
            />
          </div>
          <div className="space-y-2">
            <Label>Cidades Base</Label>
            <Input
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder="Ex: Goiânia, São Paulo..."
            />
          </div>
          <Button onClick={updateProfile}>Salvar Regiões</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caravanas e Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Loja</TableHead>
                <TableHead>Caravana</TableHead>
                <TableHead>Poltrona</TableHead>
                <TableHead>Notas Logísticas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.caravan_name}</TableCell>
                  <TableCell>{c.seat_number || '-'}</TableCell>
                  <TableCell>
                    <Input
                      defaultValue={c.logistics_notes}
                      onBlur={(e) => {
                        if (e.target.value !== c.logistics_notes) {
                          updateNotes(c.id, e.target.value)
                        }
                      }}
                      placeholder="Adicionar nota..."
                    />
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    Nenhum cliente ou caravana atribuído.
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
