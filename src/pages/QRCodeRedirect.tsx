import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'
import logoUrl from '@/assets/logo-v-moda-fb088.png'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setError('Código QR inválido.')
      return
    }

    const resolveQRCode = async () => {
      try {
        const response = await pb.send(`/backend/v1/qrcode/${id}`, {
          method: 'GET',
        })

        if (response?.target) {
          let target = response.target as string

          // The backend hook formats targets for HashRouter (e.g. '/#/?ref=...', '/#/v-club?...')
          // Since the app uses BrowserRouter, we must strip the '/#' prefix
          if (target.startsWith('/#')) {
            target = target.substring(2)
          }

          navigate(target, { replace: true })
        } else {
          setError('Destino não encontrado.')
        }
      } catch (err: any) {
        console.error('Error resolving QR code:', err)
        setError('Código QR inválido ou expirado.')
      }
    }

    // Add an artificial small delay so the loading state is visible and feels smoother
    const timer = setTimeout(() => {
      resolveQRCode()
    }, 600)

    return () => clearTimeout(timer)
  }, [id, navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 p-4 sm:p-6">
      {error ? (
        <div className="flex w-full max-w-md flex-col items-center space-y-6 animate-fade-in-up rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-black/5 border border-gray-100 text-center">
          <img
            src={logoUrl}
            alt="V MODA BRASIL"
            className="h-8 sm:h-10 object-contain mb-2 opacity-40 grayscale"
          />

          <div className="rounded-full bg-red-50 p-5 text-red-500 ring-8 ring-red-50/50">
            <AlertCircle size={40} strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Oops!</h1>
            <p className="text-base text-gray-600">{error}</p>
          </div>

          <Button
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
            onClick={() => navigate('/', { replace: true })}
          >
            Voltar para o início
          </Button>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col items-center space-y-10 animate-fade-in rounded-3xl bg-white p-10 sm:p-12 shadow-xl shadow-black/5 border border-gray-100 text-center">
          <img src={logoUrl} alt="V MODA BRASIL" className="h-10 sm:h-12 object-contain" />

          <div className="flex flex-col items-center space-y-6">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/5">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
              <Loader2 size={32} className="animate-spin text-primary/40" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
                Redirecionando...
              </h2>
              <p className="text-sm text-gray-500 font-medium">Por favor, aguarde um momento.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
