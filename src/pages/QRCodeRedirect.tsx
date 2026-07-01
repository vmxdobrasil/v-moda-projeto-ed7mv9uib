import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

export default function QRCodeRedirect() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(true)
      return
    }
    const resolve = async () => {
      try {
        const result = await pb.send(`/backend/v1/qrcode/${id}/resolve`, { method: 'GET' })
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
          return
        }
        if (result.brandId) {
          navigate(`/marcas/${result.brandId}`)
          return
        }
        navigate('/')
      } catch {
        setError(true)
      }
    }
    resolve()
  }, [id, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-muted-foreground">QR Code inválido ou expirado.</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-primary underline hover:opacity-80"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
