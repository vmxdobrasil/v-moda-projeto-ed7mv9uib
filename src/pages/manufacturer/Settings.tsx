import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ManufacturerSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    fashion_hubs: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [brandSettings, setBrandSettings] = useState<any[]>([])
  const [newBrandSetting, setNewBrandSetting] = useState({ name: '', key: '', value_text: '' })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        fashion_hubs: user.fashion_hubs || '',
      })
    }
    loadBrandSettings()
  }, [user])

  const loadBrandSettings = async () => {
    try {
      const records = await pb.collection('brand_settings').getFullList()
      setBrandSettings(records)
    } catch (e) {
      console.error(e)
    }
  }

  const handleProfileSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('fashion_hubs', formData.fashion_hubs)
      if (avatarFile) {
        data.append('avatar', avatarFile)
      }
      await pb.collection('users').update(user.id, data)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrandSetting = async () => {
    if (!newBrandSetting.name || !newBrandSetting.key) return
    try {
      await pb.collection('brand_settings').create(newBrandSetting)
      toast.success('Configuração da marca adicionada')
      setNewBrandSetting({ name: '', key: '', value_text: '' })
      loadBrandSettings()
    } catch (error) {
      toast.error('Erro ao adicionar configuração')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie o perfil da sua marca e configurações globais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil da Marca</CardTitle>
          <CardDescription>Informações públicas sobre você como fabricante.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Marca / Fabricante</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pólo de Moda de Atuação</Label>
            <Select
              value={formData.fashion_hubs}
              onValueChange={(v) => setFormData({ ...formData, fashion_hubs: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pólo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="44_goiania">Goiânia (Região 44)</SelectItem>
                <SelectItem value="fama_goiania">Goiânia (Fama)</SelectItem>
                <SelectItem value="bras_sp">São Paulo (Brás)</SelectItem>
                <SelectItem value="bom_retiro_sp">São Paulo (Bom Retiro)</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Logo / Avatar</Label>
            <div className="flex items-center gap-4">
              {user?.avatar && !avatarFile && (
                <img
                  src={pb.files.getUrl(user, user.avatar, { thumb: '64x64' })}
                  className="w-16 h-16 rounded-full object-cover border"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <Button onClick={handleProfileSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Perfil
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações da Marca (Brand Settings)</CardTitle>
          <CardDescription>Gerencie chaves, links e textos globais da plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {brandSettings.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma configuração encontrada.</p>
            )}
            {brandSettings.map((bs) => (
              <div key={bs.id} className="p-3 border rounded-md bg-muted/30">
                <p className="font-medium text-sm">
                  {bs.name}{' '}
                  <span className="text-xs text-muted-foreground ml-2 font-mono">{bs.key}</span>
                </p>
                <p className="text-sm mt-1">{bs.value_text || 'Sem valor em texto'}</p>
                {bs.value_file && (
                  <p className="text-xs text-primary mt-1">Contém arquivo anexado.</p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium">Adicionar Nova Configuração</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Chave Pix"
                  value={newBrandSetting.name}
                  onChange={(e) => setNewBrandSetting({ ...newBrandSetting, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Key (Identificador único)</Label>
                <Input
                  placeholder="Ex: chave_pix"
                  value={newBrandSetting.key}
                  onChange={(e) => setNewBrandSetting({ ...newBrandSetting, key: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Valor (Texto)</Label>
                <Input
                  value={newBrandSetting.value_text}
                  onChange={(e) =>
                    setNewBrandSetting({ ...newBrandSetting, value_text: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleAddBrandSetting}
              disabled={!newBrandSetting.name || !newBrandSetting.key}
            >
              Adicionar Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
