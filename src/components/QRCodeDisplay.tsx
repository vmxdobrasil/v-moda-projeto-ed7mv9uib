import { cn } from '@/lib/utils'

interface QRCodeDisplayProps {
  data: string
  size?: number
  className?: string
}

export function QRCodeDisplay({ data, size = 150, className }: QRCodeDisplayProps) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&color=FF6B00`

  return (
    <div
      className={cn(
        'inline-block rounded-xl border-2 border-primary/20 bg-white p-3 shadow-sm',
        className,
      )}
    >
      <img src={url} width={size} height={size} alt="QR Code" className="block" />
    </div>
  )
}
