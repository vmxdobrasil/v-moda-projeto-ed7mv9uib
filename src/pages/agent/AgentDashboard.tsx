import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgentOverview } from '@/components/agent/AgentOverview'
import { AgentClients } from '@/components/agent/AgentClients'
import { AgentFinances } from '@/components/agent/AgentFinances'
import { AgentLogistics } from '@/components/agent/AgentLogistics'
import { AgentExcursions } from '@/components/agent/AgentExcursions'
import { AgentCargoControl } from '@/components/agent/AgentCargoControl'
import { AgentOnboardingLinks } from '@/components/agent/AgentOnboardingLinks'
import { AgentQrScanner } from '@/components/agent/AgentQrScanner'

export default function AgentDashboard() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [customers, setCustomers] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const activeTab = searchParams.get('tab') || 'overview'

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', value)
    }
    setSearchParams(searchParams, { replace: true })
  }

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      pb
        .collection('customers')
        .getFullList({ filter: `affiliate_referrer = "${user.id}"`, sort: '-created' }),
      pb
        .collection('referrals')
        .getFullList({ filter: `affiliate = "${user.id}"`, expand: 'brand', sort: '-created' }),
    ]).then(([custData, refData]) => {
      setCustomers(custData)
      setReferrals(refData)
      setLoading(false)
    })
  }, [user?.id])

  if (loading) {
    return (
      <div className="p-8 text-center animate-pulse text-muted-foreground">
        Carregando portal do agente...
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-fade-in-up">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Portal do Agente</h2>
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="excursions">Excursões</TabsTrigger>
          <TabsTrigger value="cargo">Cargas</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="qr">QR Entrega</TabsTrigger>
          <TabsTrigger value="finances">Financeiro</TabsTrigger>
          <TabsTrigger value="logistics">Logística</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <AgentOverview customers={customers} referrals={referrals} user={user} />
        </TabsContent>
        <TabsContent value="clients" className="space-y-4">
          <AgentClients customers={customers} />
        </TabsContent>
        <TabsContent value="excursions" className="space-y-4">
          <AgentExcursions />
        </TabsContent>
        <TabsContent value="cargo" className="space-y-4">
          <AgentCargoControl />
        </TabsContent>
        <TabsContent value="links" className="space-y-4">
          <AgentOnboardingLinks />
        </TabsContent>
        <TabsContent value="qr" className="space-y-4">
          <AgentQrScanner />
        </TabsContent>
        <TabsContent value="finances" className="space-y-4">
          <AgentFinances referrals={referrals} user={user} />
        </TabsContent>
        <TabsContent value="logistics" className="space-y-4">
          <AgentLogistics customers={customers} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
