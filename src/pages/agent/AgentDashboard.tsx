import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function AgentDashboard() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const records = await pb.collection('users').getFullList({
          filter: "role = 'agent'",
          sort: '-created',
        })
        setAgents(records)
      } catch (err) {
        console.error('Failed to load agents', err)
      } finally {
        setLoading(false)
      }
    }
    loadAgents()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agentes Conveniados</h2>
        <p className="text-muted-foreground">Gestão e acompanhamento de agentes parceiros.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Agentes</CardTitle>
          <CardDescription>Agentes ativos no sistema e suas regiões de atuação.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-muted-foreground">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Regiões de Atuação</TableHead>
                  <TableHead>Cidades</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">{agent.name || 'N/A'}</TableCell>
                    <TableCell>{agent.email}</TableCell>
                    <TableCell>{agent.operating_regions || 'Não definido'}</TableCell>
                    <TableCell>{agent.operating_cities || 'Não definido'}</TableCell>
                    <TableCell>
                      <Badge variant={agent.is_verified ? 'default' : 'secondary'}>
                        {agent.is_verified ? 'Ativo' : 'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {agents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhum agente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
