import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'

export default function QRCodeRedirect() {
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    async function resolve() {
      if (!id) {
        navigate('/', { replace: true })
        return
      }

      try {
        // 1. Try GET custom route from the qrcode_resolve hook
        try {
          const res = await pb.send(`/backend/v1/qrcode/${id}`, { method: 'GET' })
          if (res?.url) {
            navigate(res.url, { replace: true })
            return
          }
          if (res?.type === 'v_club_card' || res?.collection === 'v_club_cards') {
            navigate(`/v-club?card=${res.id || res.recordId}`, { replace: true })
            return
          }
          if (res?.type === 'customer' || res?.collection === 'customers') {
            navigate(`/customers/${res.id || res.recordId}`, { replace: true })
            return
          }
        } catch (e) {
          // ignore and proceed to POST alternative
        }

        // 2. Try POST custom route from the qrcode_resolve hook
        try {
          const res = await pb.send('/backend/v1/qrcode/resolve', {
            method: 'POST',
            body: JSON.stringify({ id, token: id, qrcode: id }),
          })
          if (res?.url) {
            navigate(res.url, { replace: true })
            return
          }
          if (res?.type === 'v_club_card' || res?.collection === 'v_club_cards') {
            navigate(`/v-club?card=${res.id || res.recordId}`, { replace: true })
            return
          }
          if (res?.type === 'customer' || res?.collection === 'customers') {
            navigate(`/customers/${res.id || res.recordId}`, { replace: true })
            return
          }
        } catch (e) {
          // ignore and proceed to DB check
        }

        // 3. Fallback: Direct DB check (will only succeed if the user is authenticated and has correct permissions)
        if (pb.authStore.isValid) {
          try {
            const card = await pb
              .collection('v_club_cards')
              .getFirstListItem(`id="${id}" || card_number="${id}"`)
            if (card) {
              navigate(`/v-club?card=${card.id}`, { replace: true })
              return
            }
          } catch (e) {
            // ignore
          }

          try {
            const customer = await pb.collection('customers').getFirstListItem(`id="${id}"`)
            if (customer) {
              navigate(`/customers/${customer.id}`, { replace: true })
              return
            }
          } catch (e) {
            // ignore
          }
        }

        // If we reach here, nothing matched or we lack permissions
        toast({
          title: 'QR Code Inválido',
          description: 'Não foi possível encontrar o registro associado a este QR Code.',
          variant: 'destructive',
        })
        navigate('/', { replace: true })
      } catch (error) {
        console.error('QR Code resolution error:', error)
        navigate('/', { replace: true })
      }
    }

    resolve()
  }, [id, navigate])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground animate-pulse font-medium">Resolvendo QR Code...</p>
    </div>
  )
}
