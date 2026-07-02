import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bus, MessageCircle } from 'lucide-react'

export function AgentLogistics({ customers }: { customers: any[] }) {
  const caravans = customers.filter((c) => c.shipping_method === 'caravana_onibus')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          Rastreio de Caravanas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Nome da Caravana</TableHead>
                <TableHead>Rota Ativa</TableHead>
                <TableHead>Nº do Assento</TableHead>
                <TableHead>Status Logístico</TableHead>
                <TableHead>Contato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caravans.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.caravan_name || '-'}</TableCell>
                  <TableCell>{c.active_route || '-'}</TableCell>
                  <TableCell>{c.seat_number || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.logistics_status || 'Pendente'}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.phone ? (
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {caravans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    Nenhum cliente associado a caravanas no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
