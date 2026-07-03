import { useState } from 'react'
import { MapPin, Store, Loader2, AlertCircle, CheckCircle2, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  lookupCep,
  findExclusivePartners,
  getGoogleMapsUrl,
  type ExclusivePartner,
  type CepInfo,
} from '@/services/exclusivity'

interface ClickCollectPanelProps {
  manufacturerIds: string[]
  onPickupChange: (isPickup: boolean, partner: ExclusivePartner | null) => void
}

export function ClickCollectPanel({ manufacturerIds, onPickupChange }: ClickCollectPanelProps) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [partner, setPartner] = useState<ExclusivePartner | null>(null)
  const [cepInfo, setCepInfo] = useState<CepInfo | null>(null)
  const [error, setError] = useState('')
  const [isPickup, setIsPickup] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    setError('')
    setPartner(null)
    setIsPickup(false)
    onPickupChange(false, null)
    try {
      const info = await lookupCep(cep)
      setCepInfo(info)
      const partners = await findExclusivePartners(info, manufacturerIds)
      if (partners.length > 0) {
        setPartner(partners[0])
        setIsPickup(true)
        onPickupChange(true, partners[0])
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao verificar CEP')
    } finally {
      setLoading(false)
    }
  }

  const togglePickup = (val: boolean) => {
    setIsPickup(val)
    onPickupChange(val, val ? partner : null)
  }

  return (
    <Card className="border-2 border-dashed border-[#FF6600]/30">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#FF6600]" />
          <h3 className="font-semibold text-sm">CEP & Retirada Local (Click & Collect)</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Digite seu CEP"
            maxLength={9}
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleCheck}
            disabled={loading || cep.length < 8}
            className="bg-[#FF6600] hover:bg-[#e65c00] text-white"
            size="sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar'}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {partner && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#FF6600] text-white">Zona Exclusiva</Badge>
              <span className="text-xs text-muted-foreground">
                Retirada obrigatória nesta região
              </span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Store className="w-5 h-5 text-[#FF6600] mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{partner.name}</p>
                <p className="text-xs text-muted-foreground">
                  {partner.address || 'Endereço não informado'}
                </p>
                {partner.phone && (
                  <p className="text-xs text-muted-foreground mt-1">Tel: {partner.phone}</p>
                )}
                {partner.address && (
                  <a
                    href={getGoogleMapsUrl(partner.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#FF6600] mt-2 hover:underline"
                  >
                    <Navigation className="w-3 h-3" /> Ver no Mapa
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Click & Collect ativado para esta unidade</span>
            </div>
          </div>
        )}

        {cepInfo && !partner && (
          <p className="text-xs text-muted-foreground">
            Nenhum parceiro exclusivo encontrado para {cepInfo.localidade}/{cepInfo.uf}. Entrega
            direta disponível.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
