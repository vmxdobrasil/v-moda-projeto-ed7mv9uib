import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'

import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function processRedirect() {
      if (!id) {
        if (isMounted) {
          setError('QR Code inválido ou não encontrado')
          setLoading(false)
        }
        return
      }

      try {
        // 1. Expand manufacturer to get hub information safely
        const customer = await pb.collection('customers').getOne(id, {
          expand: 'manufacturer',
        })

        const brand = customer.expand?.manufacturer

        // 2. Type-safe handling of fashion_hubs
        let hubsStr = 'Hub não especificado'
        if (brand && brand.fashion_hubs) {
          if (typeof brand.fashion_hubs === 'string') {
            hubsStr = brand.fashion_hubs.replace(/_/g, ' ')
          } else if (Array.isArray(brand.fashion_hubs)) {
            hubsStr = brand.fashion_hubs
              .filter(Boolean)
              .map((h: string | number) => String(h).replace(/_/g, ' '))
              .join(', ')
          } else {
            hubsStr = String(brand.fashion_hubs).replace(/_/g, ' ')
          }
        }

        console.log(`Processing QR Code for customer of hub: ${hubsStr}`)

        // 3. Determine final destination
        let destination = '/'
        if (customer.phone) {
          const cleanPhone = customer.phone.replace(/\D/g, '')
          destination = `https://wa.me/55${cleanPhone}`
        } else if (customer.instagram_handle) {
          const cleanHandle = customer.instagram_handle.replace('@', '')
          destination = `https://instagram.com/${cleanHandle}`
        } else if (customer.email) {
          destination = `mailto:${customer.email}`
        }

        // 4. Execute redirection
        if (isMounted) {
          if (destination.startsWith('http') || destination.startsWith('mailto')) {
            window.location.replace(destination)
          } else {
            navigate(destination, { replace: true })
          }
        }
      } catch (err) {
        console.error('QR Code resolution failed:', err)
        if (isMounted) {
          setError('QR Code inválido ou não encontrado')
          setLoading(false)
        }
      }
    }

    processRedirect()

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  // Loading State UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-zinc-600 font-medium animate-pulse">Redirecionando...</p>
      </div>
    )
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-100 flex flex-col items-center text-center max-w-md w-full animate-fade-in-up">
          <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mb-2">Ops! Algo deu errado.</h1>
          <p className="text-zinc-500 mb-8">{error}</p>
          <Button onClick={() => navigate('/', { replace: true })} className="w-full" size="lg">
            Voltar para o Início
          </Button>
        </div>
      </div>
    )
  }

  return null
}
