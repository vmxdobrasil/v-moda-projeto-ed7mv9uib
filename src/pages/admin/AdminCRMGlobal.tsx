import { CRMSummaryCards } from '@/components/admin/crm/CRMSummaryCards'
import { CRMSalesFunnel } from '@/components/admin/crm/CRMSalesFunnel'
import { CRMVClubFinancials } from '@/components/admin/crm/CRMVClubFinancials'
import { CRMExclusivityZones } from '@/components/admin/crm/CRMExclusivityZones'
import { GlobalStrategistAgentChat } from '@/components/admin/crm/GlobalStrategistAgentChat'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AdminCRMGlobal() {
  return (
    <div className="space-y-6 p-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Global V MODA</h1>
        <p className="text-muted-foreground mt-1">
          Visão consolidada do ecossistema, funil de vendas, cartões V Club e inteligência
          artificial.
        </p>
      </div>

      <CRMSummaryCards />

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="funnel" className="data-[state=active]:text-orange-600">
            Funil de Vendas (Singapore)
          </TabsTrigger>
          <TabsTrigger value="financials" className="data-[state=active]:text-orange-600">
            Saúde Financeira V Club
          </TabsTrigger>
          <TabsTrigger value="exclusivity" className="data-[state=active]:text-orange-600">
            Exclusividade Territorial
          </TabsTrigger>
          <TabsTrigger value="ai-agent" className="data-[state=active]:text-orange-600">
            OODA Assistente (IA)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="funnel" className="mt-0">
          <CRMSalesFunnel />
        </TabsContent>
        <TabsContent value="financials" className="mt-0">
          <CRMVClubFinancials />
        </TabsContent>
        <TabsContent value="exclusivity" className="mt-0">
          <CRMExclusivityZones />
        </TabsContent>
        <TabsContent value="ai-agent" className="mt-0">
          <GlobalStrategistAgentChat />
        </TabsContent>
      </Tabs>
    </div>
  )
}
