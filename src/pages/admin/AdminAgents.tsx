import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Check, X, MapPin, UserCheck, Save } from 'lucide-react'

export default function AdminAgents() {
  const { toast } = useToast()
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRegions, setEditingRegions] = useState<Record<string, string>>({})

  const loadData = async () => {
    try {
      const records = await pb.collection('users').getFullList({
        filter: 'role = "agent"',
        sort: '-created',
      })
      setAgents(records)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('users', () => loadData())

  const pendingAgents = agents.filter((a) => a.approval_status === 'pending')
  const approvedAgents = agents.filter((a) => a.approval_status === 'approved')

  const handleApprove = async (id: string) => {
    try {
      await pb.collection('users').update(id, { approval_status: 'approved' })
      toast({ title: 'Agente aprovado com sucesso!' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao aprovar', variant: 'destructive' })
    }
  }

  const handleDeny = async (id: string) => {
    try {
      await pb.collection('users').update(id, { approval_status: 'denied' })
      toast({ title: 'Agente recusado.' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao recusar', variant: 'destructive' })
    }
  }

  const handleSaveRegions = async (id: string) => {
    const regions = editingRegions[id]
    if (regions === undefined) return
    try {
      await pb.collection('users').update(id, { operating_regions: regions })
      toast({ title: 'Regiões atualizadas!' })
      setEditingRegions((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <UserCheck className="h-8 w-8 text-primary" /> Gestão de Agentes
        </h1>
        <p className="text-muted-foreground mt-2">
          Credencie agentes, gerencie rotas e audite comissões.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pendingAgents.length})</TabsTrigger>
          <TabsTrigger value="all">Todos os Agentes ({approvedAgents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Credenciamento</CardTitle>
              <CardDescription>Aprove ou recuse novos agentes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy text-navy-foreground">
                    <TableHead className="text-navy-foreground">Nome</TableHead>
                    <TableHead className="text-navy-foreground">Email</TableHead>
                    <TableHead className="text-navy-foreground">Telefone</TableHead>
                    <TableHead className="text-navy-foreground">Região</TableHead>
                    <TableHead className="text-right text-navy-foreground">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : pendingAgents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma solicitação pendente.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.name || 'Sem nome'}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>{agent.phone || '-'}</TableCell>
                        <TableCell>{agent.operating_regions || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-electric text-electric-foreground"
                              onClick={() => handleApprove(agent.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => handleDeny(agent.id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Recusar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Agentes e Rotas
              </CardTitle>
              <CardDescription>
                Atribua regiões de operação (ex: Goiânia, Brás, Bom Retiro).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy text-navy-foreground">
                    <TableHead className="text-navy-foreground">Nome</TableHead>
                    <TableHead className="text-navy-foreground">Status</TableHead>
                    <TableHead className="text-navy-foreground">Regiões de Atuação</TableHead>
                    <TableHead className="text-right text-navy-foreground">Salvar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedAgents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum agente credenciado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          {agent.name || 'Sem nome'}
                          <div className="text-xs text-muted-foreground">{agent.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Aprovado</Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingRegions[agent.id] ?? agent.operating_regions ?? ''}
                            onChange={(e) =>
                              setEditingRegions((prev) => ({ ...prev, [agent.id]: e.target.value }))
                            }
                            placeholder="Ex: Goiânia, Brás, Bom Retiro"
                            className="max-w-xs"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveRegions(agent.id)}
                            disabled={editingRegions[agent.id] === undefined}
                          >
                            <Save className="h-4 w-4 mr-1" /> Salvar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
