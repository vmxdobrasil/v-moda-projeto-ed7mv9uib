import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function resolveCode() {
      if (!id) {
        return setError('Identificador de QR Code não fornecido.')
      }
      try {
        // Here you could fetch additional resolving logic via PocketBase.
        // For general tracking and checkout direction:
        navigate(`/orders/view/${id}`, { replace: true })
      } catch (err) {
        setError('O QR Code informado é inválido ou expirou.')
      }
    }

    // Simulate a minor validation delay for UX
    const timer = setTimeout(() => resolveCode(), 600)
    return () => clearTimeout(timer)
  }, [id, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-background p-8 rounded-xl shadow-sm border max-w-sm w-full text-center space-y-4 animate-fade-in-up">
          <div className="text-destructive font-medium text-lg">Erro na Leitura</div>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary text-sm font-medium hover:underline mt-2"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-muted-foreground text-sm font-medium animate-pulse">
        Redirecionando para o ambiente seguro...
      </p>
    </div>
  )
}
