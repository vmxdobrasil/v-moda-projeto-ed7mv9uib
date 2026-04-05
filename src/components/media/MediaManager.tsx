import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BrandAssetsManager } from './BrandAssetsManager'
import { ResourcesManager } from './ResourcesManager'
import pb from '@/lib/pocketbase/client'

export function MediaManager() {
  const isManufacturer = pb.authStore.record?.role === 'manufacturer'
  const isAdmin = localStorage.getItem('admin_auth') === '1'
  const canUpload = isManufacturer || isAdmin

  if (!canUpload) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso negado. Apenas fabricantes podem gerenciar mídia.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Mídia</h2>
        <p className="text-muted-foreground">
          Gerencie os ativos da marca V-MODA e a biblioteca de recursos.
        </p>
      </div>

      <Tabs defaultValue="brand" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brand">Ativos da Marca</TabsTrigger>
          <TabsTrigger value="resources">Biblioteca de Recursos</TabsTrigger>
        </TabsList>
        <TabsContent value="brand">
          <BrandAssetsManager />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
