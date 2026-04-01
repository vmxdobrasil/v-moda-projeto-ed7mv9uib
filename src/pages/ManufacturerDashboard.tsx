import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { useManufacturerStore } from '@/stores/useManufacturerStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package } from 'lucide-react'
import { SettingsTab } from './manufacturer/SettingsTab'
import { ReportsTab } from './manufacturer/ReportsTab'
import { ProductsTab } from './manufacturer/ProductsTab'

export default function ManufacturerDashboard() {
  const { user } = useAuthStore()
  const { manufacturers } = useManufacturerStore()

  // Fallback to 'm1' if manufacturerId is not set for demo purposes
  const mId = user?.manufacturerId || 'm1'
  const manufacturer = manufacturers.find((m) => m.id === mId)

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect if not a manufacturer
  if (user.type !== 'Lojista Fabricante') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Fabricante</h1>
          <p className="text-muted-foreground">Gerencie as operações da sua marca no atacado</p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="settings">Configurações</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="products">Meus Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-0">
          <SettingsTab manufacturerId={mId} />
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="products" className="mt-0">
          <ProductsTab manufacturerName={manufacturer?.name || ''} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
