import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AgentDashboard from '@/pages/agent/AgentDashboard'
import AffiliateDashboard from '@/pages/dashboard/AffiliateDashboard'

export default function AdminPartners({
  defaultTab = 'agent',
}: {
  defaultTab?: 'agent' | 'affiliate'
}) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="agent">Agentes Conveniados</TabsTrigger>
          <TabsTrigger value="affiliate">Afiliados</TabsTrigger>
        </TabsList>
        <TabsContent value="agent" className="mt-6">
          <AgentDashboard />
        </TabsContent>
        <TabsContent value="affiliate" className="mt-6">
          <AffiliateDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
