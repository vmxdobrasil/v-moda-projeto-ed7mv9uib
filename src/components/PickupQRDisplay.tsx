import { QrCode, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getGoogleMapsUrl } from '@/services/exclusivity'

interface PickupQRDisplayProps {
  code: string
  partnerName?: string
  partnerAddress?: string
}

export function PickupQRDisplay({ code, partnerName, partnerAddress }: PickupQRDisplayProps) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(code)}&color=FF6600`

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-muted/20 rounded-lg border-2 border-[#FF6600]/20">
      <div className="flex items-center gap-2 text-[#FF6600]">
        <QrCode className="w-5 h-5" />
        <h3 className="font-semibold text-sm uppercase tracking-wider">QR Code de Retirada</h3>
      </div>
      <div className="bg-white p-3 rounded-xl border shadow-sm">
        <img src={qrUrl} width={180} height={180} alt="QR Code de Retirada" className="block" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">Apresente este código na retirada</p>
        <p className="font-mono font-bold text-lg tracking-wider text-[#FF6600]">{code}</p>
      </div>
      {partnerName && (
        <div className="text-center text-sm">
          <p className="font-medium">{partnerName}</p>
          {partnerAddress && (
            <a
              href={getGoogleMapsUrl(partnerAddress)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[#FF6600] mt-1 hover:underline"
            >
              <Navigation className="w-3 h-3" /> Ver no Mapa
            </a>
          )}
        </div>
      )}
    </div>
  )
}
