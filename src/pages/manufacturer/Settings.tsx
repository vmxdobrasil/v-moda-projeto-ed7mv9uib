import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'

export default function ManufacturerSettings() {
  const [brandSettings, setBrandSettings] = useState<any[]>([])

  useEffect(() => {
    loadBrandSettings()
  }, [])

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
            key: key,
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

  const handleUpdateSetting = async (id: string, value_text: string) => {
    try {
      await pb.collection('brand_settings').update(id, { value_text })
      toast.success('Configuração atualizada com sucesso')
    } catch (error) {
      toast.error('Erro ao atualizar configuração')
    }
  }

  const translateKey = (key: string) => {
    switch (key) {
      case 'welcome_message':
        return 'Mensagem de Boas-vindas'
      case 'brand_motto':
        return 'Lema da Marca'
      case 'about_us':
        return 'Sobre Nós'
      case 'ai_instructions':
        return 'Instruções do Agente de IA'
      default:
        return key.replace('_', ' ')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central de Personalização da Marca</h2>
        <p className="text-muted-foreground">
          Gerencie a identidade da sua marca, mensagens e configurações principais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens e Configurações Principais</CardTitle>
          <CardDescription>
            Atualize os textos da sua marca, como mensagens de boas-vindas e lemas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6">
            {brandSettings.length === 0 && (
              <p className="text-sm text-muted-foreground">Carregando configurações...</p>
            )}
            {brandSettings.map((bs) => (
              <div key={bs.id} className="space-y-2">
                <Label className="capitalize font-semibold">{translateKey(bs.key)}</Label>
                <div className="flex gap-2">
                  <Textarea
                    defaultValue={bs.value_text}
                    placeholder={
                      bs.key === 'ai_instructions'
                        ? 'Defina a personalidade da IA, ex: "Seja educado, foque em moda atacadista..."'
                        : `Digite ${translateKey(bs.key)}...`
                    }
                    className={bs.key === 'ai_instructions' ? 'min-h-[160px]' : 'min-h-[80px]'}
                    onBlur={(e) => {
                      if (e.target.value !== bs.value_text) {
                        handleUpdateSetting(bs.id, e.target.value)
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Chave: {bs.key}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
