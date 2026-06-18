import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Building2, MapPin, Store } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface BrandData {
  id: string
  collectionId: string
  collectionName: string
  name: string
  avatar?: string
  role: string
  operating_regions?: string
  fashion_hubs?: string | string[]
  operating_cities?: string
}

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [brand, setBrand] = useState<BrandData | null>(null)

  useEffect(() => {
    async function resolveQrCode() {
      try {
        if (!id) throw new Error('ID do QR Code não fornecido')

        const res = await pb.send<{ target: string; type: string; data?: any }>(
          `/backend/v1/qrcode/${id}`,
          { method: 'GET' },
        )

        if (res.type === 'manufacturer' || res.type === 'brand') {
          const urlParams = new URLSearchParams(res.target.split('?')[1] || '')
          const brandId = urlParams.get('id')
          if (brandId) {
            const brandData = await pb.collection('users').getOne<BrandData>(brandId)
            setBrand(brandData)
            return
          }
        }

        const targetUrl = res.target.replace('/#/', '/')
        navigate(targetUrl, { replace: true })
      } catch (err: any) {
        setError(err.message || 'QR Code inválido ou expirado')
      }
    }

    resolveQrCode()
  }, [id, navigate])

  const formatFashionHubs = (hubs: string | string[] | null | undefined): string => {
    if (!hubs || hubs.length === 0) return 'Não informado'

    if (Array.isArray(hubs)) {
      return hubs.map((hub) => hub.replace(/_/g, ' ')).join(', ')
    }

    if (typeof hubs === 'string') {
      return hubs.replace(/_/g, ' ')
    }

    return 'Não informado'
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md shadow-sm border-red-100">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Erro ao ler QR Code</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="pt-4">
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar para o Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (brand) {
    const avatarUrl = brand.avatar ? pb.files.getURL(brand, brand.avatar) : ''
    const fallbackInitials = brand.name ? brand.name.substring(0, 2).toUpperCase() : 'BR'

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md shadow-lg border-slate-200 animate-fade-in-up">
          <CardHeader className="text-center pt-8 pb-4">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/10 shadow-sm">
              <AvatarImage src={avatarUrl} alt={brand.name} className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                {fallbackInitials}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-bold text-slate-900">{brand.name}</CardTitle>
            <CardDescription className="capitalize text-sm font-medium">
              {brand.role === 'manufacturer' ? 'Fabricante Oficial' : brand.role}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            <Separator />

            <div className="space-y-4 pt-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                  <MapPin className="mr-2 h-4 w-4" />
                  Regiões de Atuação
                </div>
                <p className="text-sm text-slate-900 pl-6">
                  {brand.operating_regions || 'Não informado'}
                </p>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                  <Store className="mr-2 h-4 w-4" />
                  Polos de Moda
                </div>
                <p className="text-sm text-slate-900 pl-6 capitalize">
                  {formatFashionHubs(brand.fashion_hubs)}
                </p>
              </div>

              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                  <Building2 className="mr-2 h-4 w-4" />
                  Cidades
                </div>
                <p className="text-sm text-slate-900 pl-6">
                  {brand.operating_cities || 'Não informado'}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t px-6 py-4 rounded-b-xl">
            <Button
              onClick={() => navigate(`/manufacturers?id=${brand.id}`)}
              className="w-full py-6 text-base font-semibold shadow-sm"
              size="lg"
            >
              Acessar Perfil Completo
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        <div className="rounded-full bg-primary/10 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-base font-medium text-slate-600">Resolvendo QR Code...</p>
      </div>
    </div>
  )
}
