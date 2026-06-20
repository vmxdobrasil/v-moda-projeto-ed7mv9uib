import { CRMLeadGrid } from '@/components/crm/CRMLeadGrid'

export default function AdminCustomers() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Global (V MODA)</h1>
        <p className="text-muted-foreground">
          Visualização de alta performance para todos os leads da plataforma.
        </p>
      </div>
      <CRMLeadGrid adminView />
    </div>
  )
}
