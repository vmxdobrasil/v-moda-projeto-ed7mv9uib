import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Phone, Mail, Crown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function ManufacturerLeads() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    pb.collection('customers')
      .getFullList({
        filter: `manufacturer = "${user.id}"`,
        sort: '-created',
      })
      .then(setCustomers)
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-1">Meus Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus lojistas, atacadistas e status VIP.</p>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/10 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Lojista / Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status V Club</TableHead>
                <TableHead>Localização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <span className="truncate max-w-[200px]">{c.name}</span>
                      {c.v_club_status === 'approved' && (
                        <Badge
                          variant="secondary"
                          className="ml-3 bg-yellow-100/80 text-yellow-800 hover:bg-yellow-200 shadow-sm border border-yellow-200"
                        >
                          <Crown className="w-3 h-3 mr-1" /> VIP
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-muted-foreground gap-1.5">
                      {c.phone ? (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-2 text-primary/60" /> {c.phone}
                        </span>
                      ) : null}
                      {c.email ? (
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-2 text-primary/60" /> {c.email}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.v_club_status === 'approved' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200">
                        Aprovado
                      </Badge>
                    ) : c.v_club_status === 'pending' ? (
                      <Badge
                        variant="outline"
                        className="border-amber-200 text-amber-700 bg-amber-50"
                      >
                        Pendente
                      </Badge>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        Sem cartão
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.city && c.state ? `${c.city}, ${c.state}` : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Nenhum cliente associado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
