import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function QRCodeRedirect() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(true)
      return
    }

    const resolveQR = async () => {
      try {
        let target: string | null = null

        try {
          const res = await fetch(
            `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/qrcode/${id}`,
            {
              headers: pb.authStore.token ? { Authorization: pb.authStore.token } : undefined,
            },
          )
          if (res.ok) {
            const data = await res.json()
            target = data.target
          } else if (res.status === 404) {
            // Let it fall through to setError(true)
          } else {
            console.error('Failed to resolve QR Code, status:', res.status)
          }
        } catch (e) {
          console.error('Error fetching QR Code resolution', e)
        }

        // Execute Redirection
        if (target) {
          // Prevent infinite loops
          const currentPath = window.location.pathname
          const targetPath = target.split('?')[0] // extract path without query params
          if (targetPath === currentPath || targetPath === `/qrcode/${id}`) {
            setError(true)
            return
          }

          if (target.startsWith('http')) {
            window.location.href = target
          } else {
            navigate(target.startsWith('/') ? target : `/${target}`, { replace: true })
          }
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Unexpected error resolving QR code', err)
        setError(true)
      }
    }

    resolveQR()
  }, [id, navigate])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <div className="text-center animate-fade-in-up max-w-sm w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Link Expirado ou Inválido</h2>
          <p className="text-muted-foreground mb-8">
            Este QR Code ou link pode ter expirado ou não foi encontrado em nosso sistema. Verifique
            o endereço e tente novamente.
          </p>
          <Button onClick={() => navigate('/')} className="w-full" size="lg">
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in-up max-w-sm w-full">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Redirecionando...</h2>
        <p className="text-muted-foreground">
          Localizando o destino e acessando de forma segura na V MODA BRASIL.
        </p>
      </div>
    </div>
  )
}
