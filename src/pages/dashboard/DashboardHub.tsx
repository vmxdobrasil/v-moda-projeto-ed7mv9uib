import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FolderKanban, Truck, Share2, Activity } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'

export default function DashboardHub() {
  const [stats, setStats] = useState({
    leads: 0,
    projects: 0,
    caravans: {
      total: 0,
      waiting: 0,
      inTransit: 0,
      delivered: 0,
    },
    conversions: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const loadData = async () => {
    const user = pb.authStore.record
    if (!user) return

    const isAdmin = user.email === 'valterpmendonca@gmail.com' || user.role === 'admin'
    const isAffiliate = user.role === 'affiliate'
    const isManufacturer = user.role === 'manufacturer' || user.type === 'Lojista Fabricante'

    try {
      // 1. Leads
      let leadsRes
      if (isAdmin) {
        leadsRes = await pb.collection('customers').getList(1, 1)
      } else if (isManufacturer) {
        leadsRes = await pb
          .collection('customers')
          .getList(1, 1, { filter: `manufacturer = "${user.id}"` })
      } else {
        leadsRes = await pb
          .collection('customers')
          .getList(1, 1, { filter: `affiliate_referrer = "${user.id}"` })
      }

      // 2. Projects
      let projectsRes
      if (isAdmin) {
        projectsRes = await pb.collection('projects').getList(1, 1)
      } else if (isManufacturer) {
        projectsRes = await pb
          .collection('projects')
          .getList(1, 1, { filter: `manufacturer = "${user.id}"` })
      } else {
        projectsRes = { totalItems: 0 } as any
      }

      // 3. Caravans
      const baseFilter = isManufacturer
        ? `manufacturer = "${user.id}" && `
        : isAdmin
          ? ''
          : 'id = "INVALID" && '
      const [waitingRes, inTransitRes, deliveredRes] = await Promise.all([
        pb
          .collection('customers')
          .getList(1, 1, { filter: `${baseFilter}logistics_status = "Aguardando Ônibus"` }),
        pb
          .collection('customers')
          .getList(1, 1, { filter: `${baseFilter}logistics_status = "Em Trânsito no Ônibus"` }),
        pb
          .collection('customers')
          .getList(1, 1, { filter: `${baseFilter}logistics_status = "Entregue"` }),
      ])
      const totalCaravans =
        waitingRes.totalItems + inTransitRes.totalItems + deliveredRes.totalItems

      // 4. Conversions
      let conversionsRes
      if (isAdmin) {
        conversionsRes = await pb
          .collection('referrals')
          .getList(1, 1, { filter: `type = "conversion"` })
      } else if (isAffiliate) {
        conversionsRes = await pb
          .collection('referrals')
          .getList(1, 1, { filter: `affiliate = "${user.id}" && type = "conversion"` })
      } else {
        conversionsRes = { totalItems: 0 } as any
      }

      setStats({
        leads: leadsRes.totalItems,
        projects: projectsRes.totalItems,
        caravans: {
          total: totalCaravans,
          waiting: waitingRes.totalItems,
          inTransit: inTransitRes.totalItems,
          delivered: deliveredRes.totalItems,
        },
        conversions: conversionsRes.totalItems,
      })

      // Recent Activity
      let activityRes
      if (isAdmin) {
        activityRes = await pb.collection('customers').getList(1, 5, { sort: '-created' })
      } else if (isManufacturer) {
        activityRes = await pb
          .collection('customers')
          .getList(1, 5, { filter: `manufacturer = "${user.id}"`, sort: '-created' })
      } else {
        activityRes = await pb
          .collection('customers')
          .getList(1, 5, { filter: `affiliate_referrer = "${user.id}"`, sort: '-created' })
      }
      setRecentActivity(activityRes.items)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)
  useRealtime('projects', loadData)
  useRealtime('referrals', loadData)

  return (
    <div className="p-2 md:p-6 w-full max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Hub</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Visão geral consolidada dos seus indicadores e atividades recentes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground mt-1">Leads gerenciados no CRM</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">Catálogos e vitrines publicados</p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status de Caravanas</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.caravans.total}</div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Aguardando:</span>{' '}
                <span className="font-medium text-foreground">{stats.caravans.waiting}</span>
              </div>
              <div className="flex justify-between">
                <span>Em Trânsito:</span>{' '}
                <span className="font-medium text-foreground">{stats.caravans.inTransit}</span>
              </div>
              <div className="flex justify-between">
                <span>Entregue:</span>{' '}
                <span className="font-medium text-foreground">{stats.caravans.delivered}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões de Afiliados</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
            <p className="text-xs text-muted-foreground mt-1">Negócios fechados via indicação</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" /> Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8 flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 text-muted-foreground/30" />
                Nenhuma atividade recente no sistema.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 group hover:bg-muted/30 p-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Novo lead registrado: {activity.name || 'Sem nome'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Status:{' '}
                      <span className="font-medium text-primary">
                        {activity.status === 'new' ? 'Novo' : activity.status || 'Novo'}
                      </span>
                      {activity.source && ` • Origem: ${activity.source}`}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(activity.created), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
