import { useState, useEffect } from 'react'
import { getBrandSettings, updateBrandSetting, type BrandSetting } from '@/services/brandSettings'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { UploadCloud, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export function BrandAssetsManager() {
  const [settings, setSettings] = useState<BrandSetting[]>([])

  const load = async () => setSettings(await getBrandSettings().catch(() => []))
  useEffect(() => {
    load()
  }, [])
  useRealtime('brand_settings', load)

  return (
    <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up">
      {settings.map((setting) => (
        <BrandAssetCard key={setting.id} setting={setting} />
      ))}
    </div>
  )
}

function BrandAssetCard({ setting }: { setting: BrandSetting }) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('value_file', file)
      await updateBrandSetting(setting.id, formData)
      toast({ title: 'Sucesso', description: 'Ativo atualizado.' })
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const fileUrl = setting.value_file ? pb.files.getURL(setting, setting.value_file) : ''

  return (
    <Card>
      <CardHeader>
        <CardTitle>{setting.name}</CardTitle>
        <CardDescription>Chave: {setting.key}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden relative group transition-colors hover:bg-muted/50">
          {fileUrl ? (
            <img
              src={fileUrl}
              alt={setting.name}
              className="max-h-full max-w-full object-contain p-4"
            />
          ) : (
            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
          )}
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Label
              htmlFor={`file-${setting.id}`}
              className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Enviando...' : 'Alterar Imagem'}
            </Label>
            <Input
              id={`file-${setting.id}`}
              type="file"
              className="hidden"
              accept="image/*,image/svg+xml"
              onChange={handleUpload}
              disabled={uploading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
