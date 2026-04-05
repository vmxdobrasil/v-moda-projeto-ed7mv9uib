import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { Copy, DollarSign, Clock, Users } from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

export default function AffiliateDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<any[]>([])
  const [source, setSource] = useState('social_profile')

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'affiliate') return
    try {
      const refs = await pb.collection('referrals').getFullList({
        filter: `affiliate="${user.id}"`,
        sort: '-created',
        expand: 'brand',
      })
      setReferrals(refs)
    } catch (e) {
      console.error(e)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('referrals', loadData)

  if (!user || user.role !== 'affiliate') return null

  const leadsList = referrals.filter((r) => ['lead', 'conversion'].includes(r.type))
  const commissionRate = (user.commission_rate || 1.0) / 100
  let earned = 0,
    pending = 0

  referrals.forEach((ref) => {
    const val = ref.metadata?.value || 1000
    if (ref.type === 'conversion') earned += val * commissionRate
    else if (ref.type === 'lead') pending += val * commissionRate
  })

  const copyLink = () => {
    const code = user.affiliate_code || user.id
    navigator.clipboard.writeText(`${window.location.origin}/parceiro?ref=${code}&src=${source}`)
    toast({ title: 'Link copiado!', description: 'Link de afiliado copiado com sucesso.' })
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto animate-fade-in-up">
      <h1 className="text-3xl font-serif font-bold">Painel de Afiliado</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Meus Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadsList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-amber-600">Comissão Pendente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">R$ {pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-emerald-600">Total Ganho</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">R$ {earned.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerador de Links</CardTitle>
          <CardDescription>
            Crie links rastreáveis para compartilhar nos seus canais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <span className="text-sm font-medium">Origem do Tráfego</span>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_profile">Perfil Social (Instagram, etc)</SelectItem>
                  <SelectItem value="whatsapp_group">Grupo de WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={copyLink} className="mb-[2px] whitespace-nowrap">
              <Copy className="w-4 h-4 mr-2" /> Copiar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Leads</CardTitle>
          <CardDescription>Acompanhe o status das suas indicações em tempo real.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leadsList.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.expand?.brand?.name || lead.metadata?.name || 'Anônimo'}
                  </TableCell>
                  <TableCell>{new Date(lead.created).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    {lead.source_channel === 'whatsapp_group' ? 'Grupo WhatsApp' : 'Rede Social'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={lead.type === 'conversion' ? 'default' : 'secondary'}
                      className={
                        lead.type === 'conversion'
                          ? 'bg-emerald-500 hover:bg-emerald-600'
                          : 'bg-amber-100 text-amber-800'
                      }
                    >
                      {lead.type === 'conversion' ? 'Convertido' : 'Pendente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {leadsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhum lead registrado.
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
