import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Store, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { cn } from '@/lib/utils'

const STEPS = [
  { num: 1, label: 'Negócio', icon: Store },
  { num: 2, label: 'Região', icon: MapPin },
  { num: 3, label: 'Contato', icon: User },
]

const FASHION_HUBS = [
  { value: '44_goiania', label: '44 Goiânia' },
  { value: 'fama_goiania', label: 'Fama Goiânia' },
  { value: 'bras_sp', label: 'Brás SP' },
  { value: 'bom_retiro_sp', label: 'Bom Retiro SP' },
  { value: 'outros', label: 'Outros' },
]

export default function RetailerOnboarding() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    brand_name: '',
    tax_id: '',
    operating_cities: '',
    operating_regions: '',
    fashion_hubs: '',
    contact_person: '',
    phone: '',
    address: '',
  })

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleComplete = async () => {
    setLoading(true)
    try {
      await pb.collection('users').update(user.id, form)
      toast({ title: 'Cadastro completo!', description: 'Bem-vindo à Central de Abastecimento!' })
      navigate('/revenda')
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const canProceed =
    step === 1
      ? form.brand_name && form.tax_id
      : step === 2
        ? form.operating_cities && form.operating_regions
        : form.contact_person && form.phone

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-navy mb-2">Bem-vindo(a) ao V MODA!</h1>
          <p className="text-sm text-muted-foreground">
            Complete seu cadastro em 3 passos rápidos.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s) => (
            <div key={s.num} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  step >= s.num ? 'bg-electric text-white' : 'bg-muted text-muted-foreground',
                )}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              {s.num < STEPS.length && (
                <div className={cn('w-12 h-0.5 mx-1', step > s.num ? 'bg-electric' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-8 space-y-4">
            {step === 1 && (
              <>
                <h2 className="text-lg font-bold text-navy">Dados do Negócio</h2>
                <div className="space-y-2">
                  <Label>Nome da Loja *</Label>
                  <Input
                    value={form.brand_name}
                    onChange={(e) => update('brand_name', e.target.value)}
                    placeholder="Ex: Boutique Fashion"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ *</Label>
                  <Input
                    value={form.tax_id}
                    onChange={(e) => update('tax_id', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="rounded-xl h-12"
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-lg font-bold text-navy">Região de Atuação</h2>
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Input
                    value={form.operating_cities}
                    onChange={(e) => update('operating_cities', e.target.value)}
                    placeholder="Sua cidade"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado (UF) *</Label>
                  <Input
                    value={form.operating_regions}
                    onChange={(e) => update('operating_regions', e.target.value.toUpperCase())}
                    placeholder="SP"
                    maxLength={2}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Polo de Moda</Label>
                  <Select
                    value={form.fashion_hubs}
                    onValueChange={(v) => update('fashion_hubs', v)}
                  >
                    <SelectTrigger className="rounded-xl h-12">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {FASHION_HUBS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Rua, número, bairro"
                    className="rounded-xl h-12"
                  />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-lg font-bold text-navy">Dados de Contato</h2>
                <div className="space-y-2">
                  <Label>Pessoa de Contato *</Label>
                  <Input
                    value={form.contact_person}
                    onChange={(e) => update('contact_person', e.target.value)}
                    placeholder="Seu nome"
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="rounded-xl h-12"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="rounded-xl h-12 flex-1"
                >
                  Voltar
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed}
                  className="bg-electric hover:bg-electric/90 text-white rounded-xl h-12 flex-1"
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading || !canProceed}
                  className="bg-electric hover:bg-electric/90 text-white rounded-xl h-12 flex-1"
                >
                  {loading ? 'Salvando...' : 'Finalizar Cadastro'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
