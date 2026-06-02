import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function QRCodeRedirect() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (id?.startsWith('prod_')) navigate(`/products/${id.replace('prod_', '')}`)
    else if (id?.startsWith('store_')) navigate(`/manufacturers/${id.replace('store_', '')}`)
    else navigate('/')
  }, [id, navigate])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in-up">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <h2 className="text-lg font-semibold">Redirecionando...</h2>
        <p className="text-sm text-muted-foreground mt-1">Acessando o destino do QR Code.</p>
      </div>
    </div>
  )
}
