import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star } from 'lucide-react'

export default function ManufacturerLeads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return
        const filter = [`manufacturer = "${user.id}"`]
        if (statusFilter !== 'all') {
          filter.push(`status = "${statusFilter}"`)
        }

        const records = await pb
          .collection('customers')
          .getFullList({ filter: filter.join(' && '), sort: '-created' })
        setLeads(records)
      } catch (error) {
        console.error('Error loading leads', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, statusFilter])

  const statusMap: Record<string, { label: string; color: string }> = {
    new: { label: 'Novo', color: 'bg-blue-100 text-blue-800' },
    interested: { label: 'Interessado', color: 'bg-yellow-100 text-yellow-800' },
    negotiating: { label: 'Negociando', color: 'bg-orange-100 text-orange-800' },
    converted: { label: 'Convertido', color: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inativo', color: 'bg-gray-100 text-gray-800' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leads e Clientes</h2>
          <p className="text-muted-foreground">Gerencie os interessados e clientes da sua marca.</p>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="interested">Interessado</SelectItem>
              <SelectItem value="negotiating">Negociando</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Lead</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Categoria / Ranking</TableHead>
                <TableHead>Exclusivo?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {lead.avatar ? (
                          <img
                            src={pb.files.getUrl(lead, lead.avatar, { thumb: '40x40' })}
                            alt={lead.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div>{lead.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {lead.phone || lead.email || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusMap[lead.status]?.color || 'bg-gray-100 text-gray-800'}`}
                      >
                        {statusMap[lead.status]?.label || lead.status || 'Novo'}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {lead.source?.replace('_', ' ') || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm capitalize">
                        {lead.ranking_category?.replace('_', ' ') || '-'}
                      </div>
                      {lead.ranking_position && (
                        <div className="text-xs text-muted-foreground">
                          Posição: #{lead.ranking_position}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.is_exclusive ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
