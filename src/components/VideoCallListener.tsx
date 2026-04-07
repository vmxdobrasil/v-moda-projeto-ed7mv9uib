import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Video, X, Phone } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

export function VideoCallListener() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [incomingCall, setIncomingCall] = useState<any>(null)

  const isInVideoCall = location.pathname.includes('/negotiation/video')

  useRealtime(
    'video_sessions',
    (e) => {
      if (!user) return

      if (e.action === 'create' || e.action === 'update') {
        const session = e.record
        if (session.participant === user.id && session.status === 'pending' && !isInVideoCall) {
          setIncomingCall(session)
        }

        if (
          session.participant === user.id &&
          (session.status === 'ended' || session.status === 'declined') &&
          incomingCall?.id === session.id
        ) {
          setIncomingCall(null)
        }
      }
    },
    !!user && !isInVideoCall,
  )

  const acceptCall = async () => {
    if (!incomingCall) return
    try {
      await pb.collection('video_sessions').update(incomingCall.id, {
        status: 'active',
        started_at: new Date().toISOString(),
      })
      const sessionId = incomingCall.id
      setIncomingCall(null)
      navigate(`/negotiation/video/${sessionId}`)
    } catch (err) {
      console.error('Error accepting call:', err)
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a chamada.',
        variant: 'destructive',
      })
    }
  }

  const declineCall = async () => {
    if (!incomingCall) return
    try {
      await pb.collection('video_sessions').update(incomingCall.id, {
        status: 'declined',
        ended_at: new Date().toISOString(),
      })
      setIncomingCall(null)
    } catch (err) {
      console.error('Error declining call:', err)
    }
  }

  return (
    <Dialog open={!!incomingCall} onOpenChange={(open) => !open && declineCall()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary animate-pulse" />
            Chamada de Vídeo Recebida
          </DialogTitle>
          <DialogDescription>
            Você está recebendo uma solicitação de chamada de vídeo para negociação.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary/20 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-24 h-24 bg-primary/40 rounded-full flex items-center justify-center relative z-10">
              <Phone className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="destructive" onClick={declineCall} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" /> Recusar
          </Button>
          <Button
            variant="default"
            onClick={acceptCall}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <Video className="w-4 h-4 mr-2" /> Aceitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
