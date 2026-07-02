import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Copy,
  MousePointerClick,
  Users,
  DollarSign,
  Download,
  Image as ImageIcon,
} from 'lucide-react'
import { RecordModel } from 'pocketbase'
import { LinkGenerator } from '@/components/affiliate/LinkGenerator'
import { AffiliateFinance } from '@/components/affiliate/AffiliateFinance'

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
  useRealtime('referrals', () => loadReferrals())

  const affiliateCode = user?.affiliate_code || user?.id?.substring(0, 8).toUpperCase() || ''
  const affiliateLink = `https://vmodabrasil.goskip.app/?ref=${affiliateCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    toast({ title: 'Link copiado!' })
  }

  const clicks = referrals.filter((r) => r.type === 'click').length
  const leads = referrals.filter((r) => r.type === 'lead').length
  const conversions = referrals.filter((r) => r.type === 'conversion').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">Portal do Afiliado</h1>
        {user?.approval_status === 'pending' && (
          <span className="text-sm text-yellow-600 font-medium">
            ⏳ Aguardando aprovação do admin
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seu Link de Indicação</CardTitle>
          <CardDescription>Compartilhe para atrair clientes e ganhar comissões.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={affiliateLink} className="flex-1" />
            <Button variant="secondary" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" /> Copiar
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span>
              Código: <strong>{affiliateCode}</strong>
            </span>
            <span className="text-muted-foreground">Comissão: {user?.commission_rate || 1}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clicks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{conversions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="links">Meus Links</TabsTrigger>
          <TabsTrigger value="referrals">Indicações</TabsTrigger>
          <TabsTrigger value="finance">Financeiro</TabsTrigger>
          <TabsTrigger value="material">Material de Apoio</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="mt-4">
          <LinkGenerator affiliateCode={affiliateCode} />
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Indicações</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                  {referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        Nenhuma indicação registrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((ref) => (
                      <TableRow key={ref.id}>
                        <TableCell>{new Date(ref.created).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="capitalize">{ref.type}</TableCell>
                        <TableCell>{ref.source_channel || '-'}</TableCell>
                        <TableCell>{ref.is_paid ? 'Sim' : 'Não'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <AffiliateFinance />
        </TabsContent>

        <TabsContent value="material" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <ImageIcon className="h-10 w-10 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-navy">Logos V MODA</h3>
                <p className="text-xs text-muted-foreground mt-1">Logos oficiais em PNG e SVG</p>
                <a
                  href="/src/assets/logo-v-moda-fb088.png"
                  download
                  className="text-xs text-primary mt-2 inline-block"
                >
                  <Download className="h-3 w-3 inline mr-1" />
                  Baixar
                </a>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <ImageIcon className="h-10 w-10 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-navy">Banners</h3>
                <p className="text-xs text-muted-foreground mt-1">Banners para redes sociais</p>
                <a
                  href="https://img.usecurling.com/p/1080/1080?q=v%20moda%20brasil%20fashion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary mt-2 inline-block"
                >
                  <Download className="h-3 w-3 inline mr-1" />
                  Visualizar
                </a>
              </CardContent>
            </Card>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Copy className="h-10 w-10 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-navy">Copy Sugestões</h3>
                <p className="text-xs text-muted-foreground mt-1">Textos prontos para postar</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      '🛍️ Conheça as melhores marcas da moda brasileira na V MODA BRASIL! Acesse meu link e aproveite preços exclusivos: ' +
                        affiliateLink,
                    )
                    toast({ title: 'Copy copiado!' })
                  }}
                >
                  <Download className="h-3 w-3 inline mr-1" />
                  Copiar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
