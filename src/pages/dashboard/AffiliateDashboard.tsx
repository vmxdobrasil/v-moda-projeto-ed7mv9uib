import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Copy } from 'lucide-react'
import { RecordModel } from 'pocketbase'

export default function AffiliateDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<RecordModel[]>([])

  const loadReferrals = async () => {
    if (!user) return
    try {
      const records = await pb.collection('referrals').getFullList({
        filter: `affiliate = '${user.id}'`,
        sort: '-created',
      })
      setReferrals(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadReferrals()
  }, [user])

  useRealtime('referrals', () => {
    loadReferrals()
  })

  const affiliateCode = user?.affiliate_code || user?.id.substring(0, 8).toUpperCase()
  const affiliateLink = `https://vmodabrasil.goskip.app/?ref=${affiliateCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    toast({ title: 'Link copiado para a área de transferência!' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Portal do Afiliado</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Seu Link de Indicação</CardTitle>
            <CardDescription>
              Compartilhe este link para atrair clientes e ganhar comissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input readOnly value={affiliateLink} />
              <Button variant="secondary" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="mt-4 p-4 bg-accent/30 rounded-lg">
              <p className="text-sm font-medium">
                Seu Código: <span className="font-bold">{affiliateCode}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Taxa de Comissão: {user?.commission_rate || 5}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-accent/20 rounded-xl">
                <div className="text-2xl font-bold">
                  {referrals.filter((r) => r.type === 'click').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Cliques</div>
              </div>
              <div className="p-4 bg-accent/20 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {referrals.filter((r) => r.type === 'lead').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Leads</div>
              </div>
              <div className="p-4 bg-accent/20 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {referrals.filter((r) => r.type === 'conversion').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Conversões</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((ref) => (
                <TableRow key={ref.id}>
                  <TableCell>{new Date(ref.created).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{ref.type}</TableCell>
                  <TableCell>{ref.source_channel || '-'}</TableCell>
                  <TableCell>{ref.is_paid ? 'Sim' : 'Não'}</TableCell>
                </TableRow>
              ))}
              {referrals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
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
