import { CRMLeadGrid } from '@/components/crm/CRMLeadGrid'

export default function Customers() {
  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display text-navy dark:text-white">
          Meus Clientes e Leads
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie contatos, acompanhe o histórico e envie mensagens via WhatsApp.
        </p>
      </div>
      <CRMLeadGrid adminView={true} />
    </div>
  )
}
