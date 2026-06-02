import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

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
        const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/qrcode/${id}`)
        if (!res.ok) {
          setError(true)
          return
        }

        const data = await res.json()
        if (data.target) {
          if (data.target.startsWith('http')) {
            window.location.href = data.target
          } else {
            navigate(data.target, { replace: true })
          }
        } else {
          setError(true)
        }
      } catch (err) {
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
          <h2 className="text-2xl font-semibold tracking-tight mb-2">QR Code Inválido</h2>
          <p className="text-muted-foreground mb-8">
            Este QR Code pode ter expirado ou não é mais válido.
          </p>
          <Button onClick={() => navigate('/')} className="w-full" size="lg">
            Continuar para o Marketplace
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
        <p className="text-muted-foreground">Acessando o destino do QR Code na V MODA BRASIL.</p>
      </div>
    </div>
  )
}
