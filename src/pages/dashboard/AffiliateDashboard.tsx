import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Copy,
  Link as LinkIcon,
  BarChart3,
  Users,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react'
import useAuthStore from '@/stores/useAuthStore'
import pb from '@/lib/pocketbase/client'

export default function AffiliateDashboard() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'affiliate') {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        const refs = await pb.collection('referrals').getFullList({
          filter: `affiliate="${user.id}"`,
          sort: '-created',
          expand: 'brand',
        })
        setReferrals(refs)
      } catch (e) {
        console.error('Error loading referrals', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  useEffect(() => {
    const searchBrands = async () => {
      if (search.length < 2) {
        setBrands([])
        return
      }
      try {
        const res = await pb.collection('customers').getList(1, 5, {
          filter: `name ~ "${search}"`,
        })
        setBrands(res.items)
      } catch (e) {
        // silently fail on search
      }
    }
    const timer = setTimeout(searchBrands, 300)
    return () => clearTimeout(timer)
  }, [search])

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user || user.role !== 'affiliate') {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 bg-background rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Esta área é exclusiva para participantes do Programa de Afiliados V Moda.
        </p>
        <Button className="w-full" asChild>
          <Link to="/afiliados">Conheça o Programa</Link>
        </Button>
      </div>
    )
  }

  const leads = referrals.filter((r) => r.type === 'lead').length
  const clicks = referrals.filter((r) => r.type === 'click').length
  const total = referrals.length

  // Calculate a mock conversion rate based on leads over clicks (or total interactions)
  const conversionRate = clicks > 0 ? ((leads / (clicks + leads)) * 100).toFixed(1) : '0.0'

  const copyLink = (brandId?: string) => {
    const code = user.affiliate_code || user.id
    let url = `${window.location.origin}`
    if (brandId) {
      url += `/marcas/${brandId}?ref=${code}`
    } else {
      url += `/?ref=${code}`
    }
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copiado!',
      description: 'Link de afiliado copiado para a área de transferência.',
    })
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Painel de Afiliado</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo, {user.name}. Acompanhe seu desempenho e gere links de indicação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Visitantes no portal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads}</div>
            <p className="text-xs text-muted-foreground mt-1">Contatos de WhatsApp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Leads por interação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Gerador de Links</CardTitle>
            <CardDescription>Crie links rastreáveis para compartilhar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Link Principal do Portal</p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/?ref=${user.affiliate_code || user.id}`}
                  readOnly
                  className="bg-muted/50"
                />
                <Button onClick={() => copyLink()} variant="secondary">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Link Direto para Marca</p>
              <p className="text-xs text-muted-foreground mb-3">
                Pesquise uma marca do guia para gerar um link específico.
              </p>
              <Input
                placeholder="Buscar marca pelo nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4"
              />

              {brands.length > 0 && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="overflow-hidden pr-2">
                        <p className="font-medium text-sm truncate">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {brand.city || 'Localização não informada'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(brand.id)}
                        className="shrink-0"
                      >
                        <LinkIcon className="w-4 h-4 mr-2 hidden sm:block" /> Gerar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {search.length > 1 && brands.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-md">
                  Nenhuma marca encontrada.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Indicações</CardTitle>
            <CardDescription>Últimos registros computados com seu código.</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium">Nenhuma indicação registrada.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comece a compartilhar seus links para ver resultados aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.slice(0, 8).map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${ref.type === 'lead' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
                      >
                        {ref.type === 'lead' ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <MousePointerClick className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {ref.expand?.brand?.name || 'Portal Principal'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ref.created).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-muted rounded-full uppercase tracking-wider">
                      {ref.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
