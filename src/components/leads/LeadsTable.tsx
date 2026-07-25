import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { UnifiedLead } from '@/services/unified-leads'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  contacted: 'Contatado',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  converted: 'Convertido',
  closed: 'Fechado',
}

const COLLECTION_LABELS: Record<string, string> = {
  leads_venda: 'Vendas',
  leads_fabricantes: 'Fabricantes',
  leads_retailers: 'Retailers',
}

export function LeadsTable({ items, loading }: { items: UnifiedLead[]; loading: boolean }) {
  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Carregando...</div>
  }
  if (items.length === 0) {
    return <div className="py-12 text-center text-muted-foreground">Nenhum lead encontrado.</div>
  }
  return (
    <div className="rounded-md border bg-card shadow-sm overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((lead) => (
            <TableRow
              key={`${lead.collection}-${lead.id}`}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{lead.phone || '—'}</span>
                  <span className="text-xs text-muted-foreground">{lead.email || '—'}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{lead.source || '—'}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {COLLECTION_LABELS[lead.collection]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    lead.status === 'converted' || lead.status === 'approved'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {STATUS_LABELS[lead.status] || lead.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {lead.created ? new Date(lead.created).toLocaleDateString('pt-BR') : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/leads/${lead.collection}/${lead.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
