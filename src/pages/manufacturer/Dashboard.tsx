import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Package, Users, Truck, Award, Eye, TrendingUp, Mail, Phone, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getManufacturerLeads, type Lead } from '@/services/leads'
import { Badge } from '@/components/ui/badge'

export default function ManufacturerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ views: 0, leads: 0, conversions: 0 })
  const [leads, setLeads] = useState<any[]>([])
  const [rankingStatus, setRankingStatus] = useState('')
  const [revendaLeads, setRevendaLeads] = useState<Lead[]>([])

  useEffect(() => {
    if (!user) return
    const loadData = async () => {
      try {
        const brands = await pb.collection('customers').getFullList({
          filter: `manufacturer = "${user.id}"`,
        })
        const totalViews = brands.reduce((acc, b) => acc + ((b as any).whatsapp_clicks || 0), 0)
        const topBrand = brands.find((b) => (b as any).ranking_position > 0)
        if (topBrand) {
          const cat = ((topBrand as any).ranking_category || '').replace(/_/g, ' ')
          setRankingStatus(`${(topBrand as any).ranking_position}º no TOP ${cat}`)
        } else if ((user as any).is_waitlisted) {
          setRankingStatus('Na lista de espera')
        } else {
          setRankingStatus('Não classificado')
        }

        let leadsData: any[] = []
        try {
          leadsData = await pb.collection('referrals').getFullList({
            filter: `brand.manufacturer = "${user.id}" && (type = "lead" || type = "conversion")`,
            sort: '-created',
            expand: 'affiliate',
          })
        } catch {
          /* intentionally ignored */
        }

        let revendaLeadsData: Lead[] = []
        try {
          revendaLeadsData = await getManufacturerLeads(user.id)
        } catch {
          /* intentionally ignored */
        }
        setRevendaLeads(revendaLeadsData)

        setStats({
          views: totalViews,
          leads: leadsData.filter((l) => l.type === 'lead').length,
          conversions: leadsData.filter((l) => l.type === 'conversion').length,
        })
        setLeads(leadsData)
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [user])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {user?.name || user?.brand_name || 'Fabricante'}!
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-muted-foreground">Bem-vindo ao seu portal de gestão.</p>
          {rankingStatus && (
            <Badge variant="outline" className="text-orange-600 border-orange-500">
              {rankingStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visões do Perfil</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads (Quero Revender)</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/manufacturer/catalog">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meu Catálogo</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gerenciar</div>
              <p className="text-xs text-muted-foreground mt-1">Produtos e Coleções</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/manufacturer/leads">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CRM & Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Acessar</div>
              <p className="text-xs text-muted-foreground mt-1">Negociações e Clientes</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/manufacturer/logistics">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Logística</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Acompanhar</div>
              <p className="text-xs text-muted-foreground mt-1">Status de Envios</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/manufacturer/v-club">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">V Club</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Configurar</div>
              <p className="text-xs text-muted-foreground mt-1">Cashback e Benefícios</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads Recentes ("Quero Revender")</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Revendedora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.slice(0, 10).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    {l.expand?.affiliate?.name || 'Anônimo'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={l.type === 'conversion' ? 'default' : 'secondary'}>
                      {l.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {l.expand?.affiliate?.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {l.expand.affiliate.email}
                      </div>
                    )}
                    {l.expand?.affiliate?.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {l.expand.affiliate.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(l.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum lead ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Leads de Lojistas ("Quero Revender")
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Revendedora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revendaLeads.slice(0, 10).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    {l.expand?.retailer?.name || 'Usuário'}
                    {l.expand?.retailer?.email && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {l.expand.retailer.email}
                      </div>
                    )}
                    {l.expand?.retailer?.phone && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {l.expand.retailer.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        l.status === 'converted'
                          ? 'default'
                          : l.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                      }
                      className={l.status === 'pending' ? 'bg-primary/10 text-primary' : ''}
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(l.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
              {revendaLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum lead de revenda ainda.
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
