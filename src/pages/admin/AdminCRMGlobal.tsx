import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CRMSummaryCards } from '@/components/admin/crm/CRMSummaryCards'
import { CRMSalesFunnel } from '@/components/admin/crm/CRMSalesFunnel'
import { CRMExclusivityZones } from '@/components/admin/crm/CRMExclusivityZones'
import { CRMVClubFinancials } from '@/components/admin/crm/CRMVClubFinancials'

export default function AdminCRMGlobal() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Global</h1>
          <p className="text-muted-foreground">Visão consolidada do ecossistema V MODA BRASIL</p>
        </div>
      </div>

      <CRMSummaryCards />

      <Tabs defaultValue="funnel" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="funnel">Funil de Vendas</TabsTrigger>
          <TabsTrigger value="exclusivity">Exclusividade Territorial</TabsTrigger>
          <TabsTrigger value="financials">Financeiro V Club</TabsTrigger>
        </TabsList>
        <TabsContent value="funnel" className="mt-6">
          <CRMSalesFunnel />
        </TabsContent>
        <TabsContent value="exclusivity" className="mt-6">
          <CRMExclusivityZones />
        </TabsContent>
        <TabsContent value="financials" className="mt-6">
          <CRMVClubFinancials />
        </TabsContent>
      </Tabs>
    </div>
  )
}
