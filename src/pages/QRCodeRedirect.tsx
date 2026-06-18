import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Store, AlertTriangle, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { BrandLogo } from '@/components/BrandLogo'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [brand, setBrand] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        setLoading(true)

        // Attempt to fetch user (brand) by ID first
        try {
          const brandData = await pb.collection('users').getOne(id)
          setBrand(brandData)
          return
        } catch (e) {
          // Fallback to resolve endpoint if it's a token rather than a user ID
          try {
            const resolved = await pb.send(`/backend/v1/qrcode/resolve`, {
              method: 'POST',
              body: JSON.stringify({ token: id }),
              headers: { 'Content-Type': 'application/json' },
            })
            if (resolved && resolved.brand) {
              setBrand(resolved.brand)
              return
            }
          } catch (e2) {
            console.error('Failed to resolve QR Code via endpoint:', e2)
          }
        }

        throw new Error('QR Code não encontrado ou inválido.')
      } catch (err: any) {
        console.error('Error loading QR code:', err)
        setError(getErrorMessage(err) || 'Não foi possível carregar as informações deste QR Code.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
        <BrandLogo className="mb-8 opacity-50 w-32" />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Analisando QR Code...</p>
        </div>
      </div>
    )
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4">
        <BrandLogo className="mb-8 w-32" />
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-red-500 animate-fade-in-up">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700 font-serif">QR Code Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground pt-2">
            <p className="text-base">
              {error || 'Este QR Code não corresponde a uma marca válida ou expirou.'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 pt-4">
            <Button onClick={() => navigate('/')} className="w-full h-12 text-base">
              Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Robust formatting logic for fashion_hubs regardless of data type
  const formatFashionHubs = (hubs: any): string => {
    if (!hubs) return ''
    if (typeof hubs === 'string') {
      return hubs.replace(/_/g, ' ')
    }
    if (Array.isArray(hubs)) {
      return hubs
        .map((hub) => (typeof hub === 'string' ? hub.replace(/_/g, ' ') : ''))
        .filter(Boolean)
        .join(', ')
    }
    return ''
  }

  const formattedHubs = formatFashionHubs(brand.fashion_hubs)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 p-4">
      <BrandLogo className="mb-8 w-32" />
      <Card className="w-full max-w-md overflow-hidden shadow-2xl border-t-4 border-t-primary animate-fade-in-up">
        <div className="bg-primary/5 pt-10 pb-6 flex flex-col items-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

          <Avatar className="h-32 w-32 border-4 border-background shadow-lg mb-5 relative z-10">
            <AvatarImage
              src={
                brand.avatar
                  ? pb.files.getUrl(brand, brand.avatar, { thumb: '200x200' })
                  : `https://img.usecurling.com/ppl/medium?seed=${brand.id}&gender=female`
              }
              alt={brand.name || 'Marca'}
              className="object-cover bg-white"
            />
            <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
              {brand.name?.substring(0, 2).toUpperCase() || 'BR'}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-3xl font-serif font-bold text-center px-4 tracking-tight text-foreground relative z-10">
            {brand.name || 'Marca Parceira V Moda'}
          </h2>

          {(brand.operating_cities || formattedHubs) && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 px-6 relative z-10">
              {formattedHubs && (
                <div className="flex items-center gap-1.5 text-muted-foreground bg-background px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-border capitalize">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {formattedHubs}
                </div>
              )}
              {brand.operating_cities && (
                <div className="flex items-center gap-1.5 text-muted-foreground bg-background px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-border capitalize">
                  <Store className="h-3.5 w-3.5 text-primary" />
                  {brand.operating_cities}
                </div>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-8 space-y-6 bg-background relative z-10">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Você escaneou o QR Code desta marca com sucesso. Explore o perfil completo para
              conhecer coleções, condições e entrar em contato.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              className="w-full h-12 text-base font-medium shadow-md transition-all hover:scale-[1.02]"
              onClick={() => navigate(brand.role === 'manufacturer' ? `/marcas/${brand.id}` : '/')}
            >
              <Store className="mr-2 h-5 w-5" />
              Acessar Perfil da Marca
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={() => navigate('/')}
            >
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
