import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { RecordModel } from 'pocketbase'

export default function ManufacturerVClub() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<RecordModel | null>(null)
  const [loading, setLoading] = useState(false)

  const loadSettings = async () => {
    if (!user) return
    try {
      const records = await pb.collection('v_club_settings').getFullList({
        filter: `store = '${user.id}'`,
      })
      if (records.length > 0) {
        setSettings(records[0])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [user])

  const saveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    const formData = new FormData(e.currentTarget)
    const rate = parseFloat(formData.get('store_cashback_rate') as string)
    const isActive = formData.get('is_active') === 'on'

    setLoading(true)
    try {
      if (settings) {
        await pb.collection('v_club_settings').update(settings.id, {
          store_cashback_rate: rate,
          is_active: isActive,
        })
      } else {
        await pb.collection('v_club_settings').create({
          store: user.id,
          store_identifier: `STORE-${user.id.substring(0, 5).toUpperCase()}`,
          store_cashback_rate: rate,
          is_active: isActive,
          platform_commission_rate: 0,
        })
      }
      toast({ title: 'Configurações salvas' })
      loadSettings()
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">V Club - Cashback</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Programa</CardTitle>
          <CardDescription>Defina as taxas de cashback para seus clientes fiéis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveSettings} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={settings?.is_active} />
              <Label htmlFor="is_active">Ativar V Club para a loja</Label>
            </div>

            <div className="space-y-2 max-w-sm">
              <Label htmlFor="store_cashback_rate">Taxa de Cashback (%)</Label>
              <Input
                id="store_cashback_rate"
                name="store_cashback_rate"
                type="number"
                step="0.01"
                defaultValue={settings?.store_cashback_rate || 0}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              Salvar Configurações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
