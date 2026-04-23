import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { UserPlus, Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getReferrals } from '@/services/referrals'

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [usersRes, referralsRes] = await Promise.all([
        pb.collection('users').getFullList({
          filter: "role = 'affiliate'",
          sort: '-created',
        }),
        getReferrals(),
      ])
      setAffiliates(usersRes || [])
      setReferrals(referralsRes || [])
    } catch (error) {
      console.error('Failed to fetch affiliates', error)
      setAffiliates([])
      setReferrals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('users', loadData)
  useRealtime('referrals', loadData)

  const getAffiliateStats = (affiliateId: string) => {
    const refs = referrals?.filter((r) => r.affiliate === affiliateId) || []
    return {
      clicks: refs.filter((r) => r.type === 'click').length,
      leads: refs.filter((r) => r.type === 'lead').length,
      conversions: refs.filter((r) => r.type === 'conversion').length,
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Afiliados</h1>
        <p className="text-muted-foreground">Gestão de afiliados e acompanhamento de indicações.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Lista de Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Conversões</TableHead>
                <TableHead>Comissão (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates && affiliates.length > 0 ? (
                affiliates.map((affiliate) => {
                  const stats = getAffiliateStats(affiliate.id)
                  return (
                    <TableRow key={affiliate.id}>
                      <TableCell className="font-medium">{affiliate.name || 'Sem nome'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {affiliate.affiliate_code || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{stats.clicks}</TableCell>
                      <TableCell>{stats.leads}</TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-primary/20 text-primary hover:bg-primary/30"
                        >
                          {stats.conversions}
                        </Badge>
                      </TableCell>
                      <TableCell>{affiliate.commission_rate || 10}%</TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum afiliado encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Afiliado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals && referrals.length > 0 ? (
                referrals.slice(0, 10).map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>{ref.expand?.affiliate?.name || 'Desconhecido'}</TableCell>
                    <TableCell>{ref.expand?.brand?.name || 'Desconhecido'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ref.type === 'conversion' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {ref.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ref.created).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma indicação registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
