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

        // 1. Check if it's a Customer ID
        try {
          const customer = await pb.collection('customers').getOne(id)
          if (customer) target = `/admin/clientes?id=${id}`
        } catch (e) {
          // ignore, continue searching
        }

        // 2. Check if it's a Project (Product) ID
        if (!target) {
          try {
            const project = await pb.collection('projects').getOne(id)
            if (project) target = `/admin/produtos?id=${id}`
          } catch (e) {
            // ignore
          }
        }

        // 3. Check if it's a User (Agent/Affiliate) ID
        if (!target) {
          try {
            const user = await pb.collection('users').getOne(id)
            if (user) {
              if (user.role === 'affiliate') target = `/admin/afiliados?id=${id}`
              else if (user.role === 'agent') target = `/admin/agentes?id=${id}`
              else if (user.role === 'manufacturer') target = `/admin/fabricantes?id=${id}`
              else target = `/admin/clientes`
            }
          } catch (e) {
            // ignore
          }
        }

        // 4. Check if it's a V-Club Card ID
        if (!target) {
          try {
            const card = await pb.collection('v_club_cards').getOne(id)
            if (card) target = `/admin/v-club?card=${id}`
          } catch (e) {
            // ignore
          }
        }

        // 5. Fallback to Backend Route
        if (!target) {
          try {
            const res = await fetch(
              `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/qrcode/${id}`,
              {
                headers: {
                  Authorization: pb.authStore.token,
                },
              },
            )
            if (res.ok) {
              const data = await res.json()
              target = data.target
            }
          } catch (e) {
            // Error with backend, target remains null
          }
        }

        // Execute Redirection
        if (target) {
          if (target.startsWith('http')) {
            window.location.href = target
          } else {
            navigate(target, { replace: true })
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
            Este QR Code pode ter expirado ou não foi encontrado em nosso sistema. Verifique o link
            e tente novamente.
          </p>
          <Button onClick={() => navigate('/admin')} className="w-full" size="lg">
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
