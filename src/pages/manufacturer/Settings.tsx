import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const HUBS = [
  { value: '44_goiania', label: '44 Goiânia' },
  { value: 'fama_goiania', label: 'Fama Goiânia' },
  { value: 'bras_sp', label: 'Brás SP' },
  { value: 'bom_retiro_sp', label: 'Bom Retiro SP' },
  { value: 'outros', label: 'Outros' },
]

export default function ManufacturerSettings() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [brandSettings, setBrandSettings] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return pb.collection('users').getOne(user.id).then(setProfile).catch(console.error)
    loadBrandSettings()
  }, [user])

  const loadBrandSettings = async () => {
    try {
      const records = await pb.collection('brand_settings').getFullList()
      const requiredKeys = ['welcome_message', 'brand_motto', 'about_us', 'ai_instructions']
      const existingKeys = records.map((r) => r.key)
      let allSettings = [...records]
      for (const key of requiredKeys) {
        if (!existingKeys.includes(key)) {
          const newSetting = await pb.collection('brand_settings').create({
            name: key.replace('_', ' ').toUpperCase(),
            key,
            value_text: '',
          })
          allSettings.push(newSetting)
        }
      }
      setBrandSettings(allSettings)
    } catch (e) {
      console.error(e)
    }
  }

  const handleProfileUpdate = async () => {
    setSaving(true)
    try {
      await pb.collection('users').update(user.id, {
        brand_name: profile.brand_name,
        social_name: profile.social_name,
        tax_id: profile.tax_id,
        fashion_hubs: profile.fashion_hubs,
        address: profile.address,
        phone: profile.phone,
        instagram: profile.instagram,
        minimum_order: profile.minimum_order,
      })
      toast.success('Perfil da marca atualizado com sucesso')
    } catch (e) {
      toast.error('Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSetting = async (id: string, value_text: string) => {
    try {
      await pb.collection('brand_settings').update(id, { value_text })
      toast.success('Configuração atualizada')
    } catch (e) {
      toast.error('Erro ao atualizar')
    }
  }

  const translateKey = (key: string) => {
    const map: Record<string, string> = {
      welcome_message: 'Mensagem de Boas-vindas',
      brand_motto: 'Lema da Marca',
      about_us: 'Sobre Nós',
      ai_instructions: 'Instruções do Agente de IA',
    }
    return map[key] || key.replace(/_/g, ' ')
  }

  if (!profile) return <div className="p-8 text-muted-foreground">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central da Marca</h2>
        <p className="text-muted-foreground">
          Gerencie seu perfil, documentos e configurações de IA.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil da Marca</CardTitle>
          <CardDescription>
            Atualize informações da empresa: CNPJ, localização e pedido mínimo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Marca</Label>
              <Input
                value={profile.brand_name || ''}
                onChange={(e) => setProfile({ ...profile, brand_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input
                value={profile.social_name || ''}
                onChange={(e) => setProfile({ ...profile, social_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={profile.tax_id || ''}
                onChange={(e) => setProfile({ ...profile, tax_id: e.target.value })}
                placeholder="00.000.000/0001-00"
              />
            </div>
            <div className="space-y-2">
              <Label>Pólo de Moda</Label>
              <Select
                value={profile.fashion_hubs || ''}
                onValueChange={(v) => setProfile({ ...profile, fashion_hubs: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {HUBS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input
                value={profile.instagram || ''}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                placeholder="@sua_marca"
              />
            </div>
            <div className="space-y-2">
              <Label>Pedido Mínimo (R$)</Label>
              <Input
                type="number"
                value={profile.minimum_order || ''}
                onChange={(e) => setProfile({ ...profile, minimum_order: Number(e.target.value) })}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>
          </div>
          <Button
            onClick={handleProfileUpdate}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens e Configurações</CardTitle>
          <CardDescription>Textos da marca e instruções para a IA.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {brandSettings.map((bs) => (
            <div key={bs.id} className="space-y-2">
              <Label className="font-semibold">{translateKey(bs.key)}</Label>
              <Textarea
                defaultValue={bs.value_text}
                placeholder={`Digite ${translateKey(bs.key)}...`}
                className={bs.key === 'ai_instructions' ? 'min-h-[160px]' : 'min-h-[80px]'}
                onBlur={(e) => {
                  if (e.target.value !== bs.value_text) handleUpdateSetting(bs.id, e.target.value)
                }}
              />
              <p className="text-xs text-muted-foreground">Chave: {bs.key}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
