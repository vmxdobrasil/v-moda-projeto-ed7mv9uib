import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function CRM() {
  const [leads, setLeads] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      const userId = pb.authStore.record?.id
      if (!userId) return

      const records = await pb.collection('customers').getFullList({
        filter: `manufacturer = "${userId}"`,
        sort: '-created',
      })
      setLeads(records)
    } catch (err) {
      console.error(err)
    }
  }

  const exportCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Origem', 'Data']
    const rows = filteredLeads.map(
      (l) =>
        `"${l.name || ''}","${l.email || ''}","${l.phone || ''}","${l.status || ''}","${l.source || ''}","${new Date(l.created).toLocaleDateString()}"`,
    )
    const csvContent = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'leads-crm.csv'
    link.click()
  }

  const filteredLeads = leads.filter(
    (l) =>
      (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.email || '').toLowerCase().includes(search.toLowerCase()),
  )

  const statusMap: Record<string, string> = {
    new: 'Novo',
    interested: 'Interessado',
    negotiating: 'Em Negociação',
    converted: 'Convertido',
    inactive: 'Inativo',
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in zoom-in-95 duration-300 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Mini CRM</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus leads e contatos recebidos.</p>
        </div>
        <Button onClick={exportCSV} variant="default" className="shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Exportar Leads CSV
        </Button>
      </div>

      <div className="flex items-center bg-background p-2 rounded-xl border shadow-sm max-w-md">
        <Search className="w-5 h-5 text-muted-foreground mx-3" />
        <Input
          placeholder="Buscar leads por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 shadow-none focus-visible:ring-0 px-0 h-9"
        />
      </div>

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Nenhum lead encontrado com estes filtros.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{lead.name || 'Sem nome'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm">{lead.email || '-'}</span>
                      <span className="text-xs text-muted-foreground">{lead.phone || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        lead.status === 'converted'
                          ? 'default'
                          : lead.status === 'new'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {statusMap[lead.status] || lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm text-muted-foreground">
                    {lead.source || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.created).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
