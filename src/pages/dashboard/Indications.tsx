import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  getReferredCustomers,
  getReferralStats,
  activateAffiliate,
  type CustomerIndication,
  type ReferralStat,
} from '@/services/indications'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Link2,
  MousePointerClick,
  UserPlus,
  ShoppingCart,
  Percent,
  Copy,
  CheckCircle2,
} from 'lucide-react'

export default function Indications() {
  const [user, setUser] = useState(pb.authStore.record)
  const [customers, setCustomers] = useState<CustomerIndication[]>([])
  const [referrals, setReferrals] = useState<ReferralStat[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Track auth changes
  useEffect(() => {
    return pb.authStore.onChange((token, record) => {
      setUser(record)
    })
  }, [])

  const loadData = async () => {
    if (!user?.affiliate_code) {
      setLoading(false)
      return
    }
    try {
      const [custData, refData] = await Promise.all([getReferredCustomers(), getReferralStats()])
      setCustomers(custData)
      setReferrals(refData)
    } catch (e) {
      console.error('Failed to load indications data', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.affiliate_code])

  useRealtime('customers', () => loadData(), !!user?.affiliate_code)
  useRealtime('referrals', () => loadData(), !!user?.affiliate_code)

  const handleActivate = async () => {
    try {
      setActivating(true)
      const updatedUser = await activateAffiliate()
      setUser(updatedUser)
      toast({ title: 'Sistema de indicações ativado com sucesso!' })
    } catch (e) {
      toast({
        title: 'Erro ao ativar o sistema',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setActivating(false)
    }
  }

  const referralLink = useMemo(() => {
    if (!user?.affiliate_code) return ''
    const baseUrl =
      window.location.hostname.includes('localhost') || window.location.hostname.includes('preview')
        ? window.location.origin
        : 'https://vmoda.goskip.app'
    return `${baseUrl}/?ref=${user.affiliate_code}`
  }, [user?.affiliate_code])

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast({ title: 'Link copiado para a área de transferência!' })
    setTimeout(() => setCopied(false), 2000)
  }

  const stats = useMemo(() => {
    const clicks = referrals.filter((r) => r.type === 'click').length
    const leads = referrals.filter((r) => r.type === 'lead').length
    const conversions = referrals.filter((r) => r.type === 'conversion').length
    return { clicks, leads, conversions }
  }, [referrals])

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      new: 'Novo',
      interested: 'Interessado',
      negotiating: 'Em Negociação',
      converted: 'Convertido',
      inactive: 'Inativo',
    }
    return map[status] || status
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'converted':
        return 'default'
      case 'negotiating':
      case 'interested':
        return 'secondary'
      case 'inactive':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando painel de indicações...
      </div>
    )
  }

  if (!user?.affiliate_code) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in h-[80vh]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Link2 className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Ative seu Sistema de Indicações</h2>
        <p className="text-muted-foreground max-w-lg mb-8 text-lg">
          Gere seu link exclusivo para indicar clientes e acompanhe de perto suas métricas de
          conversão e desempenho.
        </p>
        <Button onClick={handleActivate} disabled={activating} size="lg" className="px-8">
          {activating ? 'Ativando...' : 'Gerar Meu Link Exclusivo'}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema de Indicações</h1>
          <p className="text-muted-foreground">
            Gerencie seu link, acompanhe leads e conversões em tempo real.
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-1.5 text-sm flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary" />
          Taxa de Comissão: <span className="font-bold">{user?.commission_rate || 0}%</span>
        </Badge>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" /> Seu Link de Indicação
          </CardTitle>
          <CardDescription>
            Compartilhe este link com sua rede. Todos que se cadastrarem através dele serão
            vinculados a você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-background border p-3 rounded-md text-sm font-mono truncate select-all flex items-center">
              {referralLink}
            </div>
            <Button onClick={copyLink} className="shrink-0 min-w-[120px]">
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" /> Copiar Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Cliques no Link
              <MousePointerClick className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.clicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Leads Gerados
              <UserPlus className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Conversões (Vendas)
              <ShoppingCart className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.conversions}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Indicações</CardTitle>
          <CardDescription>Lista de clientes que chegaram através do seu link.</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              Você ainda não possui clientes indicados. <br />
              Comece compartilhando seu link!
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data de Indicação</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        {new Date(customer.created).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(customer.status)}>
                          {translateStatus(customer.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
