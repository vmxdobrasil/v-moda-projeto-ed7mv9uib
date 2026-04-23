import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, Download, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { BrandAssetsManager } from '@/components/media/BrandAssetsManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function MediaKit() {
  const user = pb.authStore.record
  const canManage = user?.role === 'manufacturer' || user?.role === 'admin'
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const records = await pb.collection('brand_settings').getFullList({
        filter: "value_file != ''",
        sort: '-created',
      })
      setAssets(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('brand_settings', loadData)

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Kit</h1>
        <p className="text-muted-foreground">
          Central de armazenamento para recursos e arquivos da marca.
        </p>
      </div>

      {canManage ? (
        <Tabs defaultValue="view" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="view">Arquivos Disponíveis</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Arquivos</TabsTrigger>
          </TabsList>

          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Arquivos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>{renderAssets()}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <BrandAssetsManager />
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Arquivos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>{renderAssets()}</CardContent>
        </Card>
      )}
    </div>
  )

  function renderAssets() {
    return assets.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
        <h3 className="text-lg font-medium">Nenhum arquivo encontrado</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Ainda não há arquivos de mídia disponíveis. Arquivos configurados na marca aparecerão
          aqui.
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="border rounded-lg p-4 flex flex-col items-center gap-4 hover:border-primary/50 transition-colors"
          >
            <div className="bg-muted p-4 rounded-full">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center w-full">
              <p className="font-medium truncate" title={asset.name}>
                {asset.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{asset.key}</p>
            </div>
            <Button variant="outline" className="w-full mt-auto" asChild>
              <a
                href={pb.files.getUrl(asset, asset.value_file)}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Download className="w-4 h-4 mr-2" /> Baixar Arquivo
              </a>
            </Button>
          </div>
        ))}
      </div>
    )
  }
}
