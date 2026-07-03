import { useState } from 'react'
import { MapPin, Search, Store, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { checkExclusivity, type ExclusivePartner } from '@/services/geolocation'

interface ClickCollectProps {
  onPartnerSelect: (partner: ExclusivePartner | null) => void
}

export function ClickCollect({ onPartnerSelect }: ClickCollectProps) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [partner, setPartner] = useState<ExclusivePartner | null>(null)
  const [error, setError] = useState('')

  const handleLookup = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      setError('CEP inválido. Digite 8 dígitos.')
      return
    }
    setLoading(true)
    setError('')
    const result = await checkExclusivity(cleanCep)
    if (result.partner) {
      setPartner(result.partner)
      onPartnerSelect(result.partner)
    } else {
      setPartner(null)
      onPartnerSelect(null)
      setError('Nenhum parceiro exclusivo encontrado. Entrega direta disponível.')
    }
    setLoading(false)
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">Retirar no Local (Click & Collect)</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Digite seu CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
            maxLength={8}
            className="flex-1"
          />
          <Button onClick={handleLookup} disabled={loading} size="sm" variant="outline">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-xs text-muted-foreground">{error}</p>}
        {partner && (
          <div className="p-3 bg-primary/5 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <p className="font-medium text-sm">{partner.name}</p>
            </div>
            {partner.address && <p className="text-xs text-muted-foreground">{partner.address}</p>}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${partner.address}, ${partner.city}, ${partner.state}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              <MapPin className="w-3 h-3" /> Ver no Mapa
            </a>
            <p className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
              Retirada obrigatória nesta unidade (exclusividade regional)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
