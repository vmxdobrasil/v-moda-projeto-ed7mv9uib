import { CRMLeadGrid } from '@/components/crm/CRMLeadGrid'

export default function DashboardCustomers() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Clientes e Leads</h1>
        <p className="text-muted-foreground">
          Gerencie contatos, acompanhe o histórico e envie mensagens via WhatsApp.
        </p>
      </div>
      <CRMLeadGrid />
    </div>
  )
}
