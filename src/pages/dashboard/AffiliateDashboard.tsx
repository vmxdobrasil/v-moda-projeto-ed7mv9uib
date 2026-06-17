import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
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

export default function AffiliateDashboard() {
  const { user } = useAuth()
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const filter =
          user?.role === 'admin' || user?.email === 'valterpmendonca@gmail.com'
            ? ''
            : user?.role === 'manufacturer'
              ? `brand.manufacturer = "${user.id}"`
              : `affiliate = "${user?.id}"`

        const records = await pb.collection('referrals').getFullList({
          filter,
          expand: 'affiliate,brand',
          sort: '-created',
        })
        setReferrals(records)
      } catch (err) {
        console.error('Failed to load referrals', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Afiliados</h2>
        <p className="text-muted-foreground">Monitoramento de links de indicação e comissões.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.filter((r) => r.type === 'conversion').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Indicações</CardTitle>
          <CardDescription>
            Acompanhe cliques, leads e conversões geradas pelos afiliados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center text-muted-foreground">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Taxa Com.</TableHead>
                  <TableHead>Cliente/Marca</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref) => {
                  const affiliate = ref.expand?.affiliate
                  const brand = ref.expand?.brand

                  return (
                    <TableRow key={ref.id}>
                      <TableCell>{new Date(ref.created).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="font-medium">
                        {affiliate?.name || 'Desconhecido'}
                      </TableCell>
                      <TableCell>{affiliate?.affiliate_code || '-'}</TableCell>
                      <TableCell>
                        {affiliate?.commission_rate ? `${affiliate.commission_rate}%` : '-'}
                      </TableCell>
                      <TableCell>{brand?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={ref.type === 'conversion' ? 'default' : 'secondary'}>
                          {ref.type === 'click'
                            ? 'Clique'
                            : ref.type === 'lead'
                              ? 'Lead'
                              : 'Conversão'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ref.is_paid ? 'outline' : 'secondary'}>
                          {ref.is_paid ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {referrals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhuma indicação encontrada.
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
