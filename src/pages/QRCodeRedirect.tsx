import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, QrCode } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [brandInfo, setBrandInfo] = useState<{ name: string; hubs: string } | null>(null)

  useEffect(() => {
    if (!id) return

    let timeoutId: ReturnType<typeof setTimeout>

    const resolveQR = async () => {
      try {
        const res = await pb.send(`/backend/v1/qrcode/${id}`, { method: 'GET' })
        const targetUrl = res.target.replace('/#/', '/')

        if (res.type === 'brand') {
          try {
            const cleanId = id.startsWith('store_') ? id.replace('store_', '') : id
            const customer = await pb.collection('customers').getOne(cleanId, {
              expand: 'manufacturer',
            })

            const rawHubs = customer.expand?.manufacturer?.fashion_hubs
            let formattedHubs = 'Hub não especificado'

            if (rawHubs) {
              if (Array.isArray(rawHubs)) {
                formattedHubs = rawHubs.map((h: string) => h.replace(/_/g, ' ')).join(', ')
              } else if (typeof rawHubs === 'string') {
                formattedHubs = rawHubs.replace(/_/g, ' ')
              }
            }

            setBrandInfo({
              name: customer.name,
              hubs: formattedHubs,
            })

            timeoutId = setTimeout(() => {
              navigate(targetUrl, { replace: true })
            }, 2500)
          } catch (err) {
            console.error('Error fetching brand details:', err)
            // Even if fetching extra data fails, we ensure redirection still occurs
            navigate(targetUrl, { replace: true })
          }
        } else {
          // Direct redirect for non-brand types without showing intermediary info
          navigate(targetUrl, { replace: true })
        }
      } catch (err) {
        console.error('QR Code resolution error:', err)
        setError('QR Code não encontrado ou inválido.')
      }
    }

    resolveQR()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [id, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background">
        <div className="rounded-full bg-destructive/10 p-6 mb-6">
          <QrCode className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">QR Code Inválido</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
        <Button onClick={() => navigate('/')} size="lg" className="rounded-full">
          Voltar para o Início
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      {brandInfo ? (
        <div className="flex flex-col items-center text-center animate-fade-in-up max-w-md">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full border-4 border-primary/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">{brandInfo.name}</h2>
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            {brandInfo.hubs}
          </div>
          <p className="mt-8 text-sm text-muted-foreground animate-pulse">Redirecionando...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Resolvendo QR Code...</p>
        </div>
      )}
    </div>
  )
}
