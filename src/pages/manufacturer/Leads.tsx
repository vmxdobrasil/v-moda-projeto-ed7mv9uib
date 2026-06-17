import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Search, ExternalLink, Star } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

export default function ManufacturerLeads() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user) return
    const fetchLeads = async () => {
      try {
        const records = await pb.collection('customers').getFullList({
          filter: `manufacturer = "${user.id}"`,
          sort: '-created',
        })
        setLeads(records)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeads()
  }, [user])

  const filteredLeads = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone?.includes(searchTerm),
  )

  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      new: { label: 'Novo', variant: 'default' },
      interested: { label: 'Interessado', variant: 'secondary' },
      negotiating: { label: 'Em Negociação', variant: 'outline' },
      converted: { label: 'Convertido', variant: 'default' },
      inactive: { label: 'Inativo', variant: 'destructive' },
    }
    const mapped = map[status] || { label: status, variant: 'outline' }
    return <Badge variant={mapped.variant}>{mapped.label}</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads & VIPs</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e membros do V Club.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Clientes</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium flex flex-wrap items-center gap-2">
                          {lead.name}
                          {lead.v_club_status === 'approved' && (
                            <Badge
                              variant="default"
                              className="bg-amber-500 hover:bg-amber-600 text-[10px] px-1.5 py-0 text-white border-transparent"
                            >
                              <Star className="w-3 h-3 mr-1" />
                              VIP Exclusivo
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {lead.phone || lead.email}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell className="capitalize text-sm">
                        {lead.source?.replace('_', ' ') || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {lead.last_contacted_at
                          ? format(new Date(lead.last_contacted_at), "dd 'de' MMM, HH:mm", {
                              locale: ptBR,
                            })
                          : 'Nunca'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/manufacturer/negotiation/${lead.id}`)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Hub
                          </Button>
                          {lead.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  `https://wa.me/${lead.phone.replace(/\D/g, '')}`,
                                  '_blank',
                                )
                              }
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
