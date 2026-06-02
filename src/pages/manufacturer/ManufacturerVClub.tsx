import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, ShieldCheck } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function ManufacturerVClub() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    store_identifier: '',
    store_cashback_rate: '0.025',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const user = pb.authStore.record
      if (!user) return
      const res = await pb.collection('v_club_settings').getFirstListItem(`store="${user.id}"`)
      setSettings(res)
      setFormData({
        store_identifier: res.store_identifier || '',
        store_cashback_rate: res.store_cashback_rate?.toString() || '0.025',
      })
    } catch (e) {
      // Not found, will show default form
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const rate = parseFloat(formData.store_cashback_rate)
    if (isNaN(rate) || rate < 0.025 || rate > 1) {
      toast({
        title: 'Taxa inválida',
        description: 'A comissão deve ser configurada entre 0.025% e 1%',
        variant: 'destructive',
      })
      return
    }

    try {
      const data = {
        store: pb.authStore.record?.id,
        store_identifier: formData.store_identifier,
        store_cashback_rate: rate,
        is_active: true,
      }
      if (settings?.id) {
        await pb.collection('v_club_settings').update(settings.id, data)
        toast({ title: 'Configurações atualizadas' })
      } else {
        const res = await pb.collection('v_club_settings').create(data)
        setSettings(res)
        toast({ title: 'V CLUB CARD Private Label ativado!' })
      }
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <CreditCard className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">V CLUB CARD Private Label</h1>
          <p className="text-muted-foreground">
            Configure os cartões de fidelidade personalizados para seus clientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Programa</CardTitle>
          <CardDescription>
            Defina as regras de cashback e a identificação da sua marca no cartão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label>Identificador da Marca no Cartão</Label>
              <Input
                required
                placeholder="Ex: NOME_DA_LOJA"
                value={formData.store_identifier}
                onChange={(e) =>
                  setFormData({ ...formData, store_identifier: e.target.value.toUpperCase() })
                }
              />
              <p className="text-xs text-muted-foreground">
                Este nome será impresso no cartão V CLUB do seu cliente, marcando a sua
                exclusividade.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Taxa de Comissão / Cashback (%)</Label>
              <Input
                required
                type="number"
                step="0.001"
                min="0.025"
                max="1"
                value={formData.store_cashback_rate}
                onChange={(e) => setFormData({ ...formData, store_cashback_rate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Defina a taxa de retorno para o cliente. (Permitido entre 0.025% e 1%).
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg">
                Salvar Configurações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {settings?.is_active && (
        <Card className="bg-primary/5 border-primary/20 animate-fade-in-up">
          <CardContent className="p-6 flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Programa V CLUB Ativo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seus clientes atacadistas já podem solicitar o V CLUB CARD na finalização de
                compras, com o repasse automático da taxa definida de {settings.store_cashback_rate}
                %.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
