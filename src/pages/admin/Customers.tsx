import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'
import { getCustomers, Customer } from '@/services/customers'
import { Users } from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => loadData())

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'interested':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
      case 'negotiating':
        return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'converted':
        return 'bg-green-500/10 text-green-600 border-green-200'
      case 'inactive':
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Novo'
      case 'interested':
        return 'Interessado'
      case 'negotiating':
        return 'Em Negociação'
      case 'converted':
        return 'Convertido'
      case 'inactive':
        return 'Inativo'
      default:
        return status || 'Indefinido'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
        <p className="text-muted-foreground">Gerencie seus clientes e leads em tempo real.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Lista de Clientes
          </CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Origem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">Carregando dados...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(c.status)}>
                      {getStatusLabel(c.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{c.source?.replace('_', ' ') || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
