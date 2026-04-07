import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  User,
  AlertCircle,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

export default function VideoNegotiation() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  const [session, setSession] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)

  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [callStatus, setCallStatus] = useState<string>('connecting')
  const [error, setError] = useState<string | null>(null)

  const [mockRemoteConnected, setMockRemoteConnected] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    const loadSession = async () => {
      try {
        const s = await pb.collection('video_sessions').getOne(sessionId, {
          expand: 'host,participant',
        })
        setSession(s)

        const isHost = s.host === user?.id
        const partnerUser = isHost ? s.expand?.participant : s.expand?.host
        setPartner(partnerUser)

        if (s.status === 'ended' || s.status === 'declined') {
          setCallStatus('ended')
        } else if (s.status === 'active') {
          setCallStatus('connected')
        } else {
          setCallStatus('waiting')
        }
      } catch (err) {
        console.error('Error loading session', err)
        setError('Sessão não encontrada.')
      }
    }
    loadSession()
  }, [sessionId, user?.id])

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setLocalStream(stream)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing media devices', err)
        toast({
          title: 'Aviso',
          description: 'Não foi possível acessar a câmera/microfone. Modo de escuta ativado.',
          variant: 'default',
        })
      }
    }
    initMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useRealtime('video_sessions', (e) => {
    if (e.record.id === sessionId) {
      setSession((prev: any) => ({ ...prev, ...e.record }))
      if (e.record.status === 'active') {
        setCallStatus('connected')
        setTimeout(() => setMockRemoteConnected(true), 2000)
      } else if (e.record.status === 'ended' || e.record.status === 'declined') {
        setCallStatus('ended')
        toast({
          title: 'Chamada Encerrada',
          description: 'A sessão de negociação foi finalizada.',
        })
        setTimeout(() => navigate(-1), 1500)
      }
    }
  })

  useEffect(() => {
    if (session?.status === 'active' && !mockRemoteConnected) {
      const timer = setTimeout(() => setMockRemoteConnected(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [session?.status, mockRemoteConnected])

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn
      })
      setIsMicOn(!isMicOn)
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn
      })
      setIsCameraOn(!isCameraOn)
    }
  }

  const endCall = async () => {
    if (!sessionId) return
    try {
      await pb.collection('video_sessions').update(sessionId, {
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      setCallStatus('ended')
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      navigate(-1)
    } catch (err) {
      console.error('Error ending call', err)
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen bg-background">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-serif mb-2">Ops! Algo deu errado</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    )
  }

  const partnerName = partner?.name || 'Parceiro'
  const partnerAvatar = partner?.avatar
    ? pb.files.getUrl(partner, partner.avatar)
    : `https://img.usecurling.com/ppl/large?seed=${partner?.id || '1'}&gender=female`

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-neutral-950 text-white">
      <div className="p-4 flex items-center justify-between bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`
            ${callStatus === 'connected' ? 'border-green-500 text-green-500' : ''}
            ${callStatus === 'waiting' ? 'border-yellow-500 text-yellow-500' : ''}
            ${callStatus === 'ended' ? 'border-red-500 text-red-500' : ''}
            ${callStatus === 'connecting' ? 'border-blue-500 text-blue-500' : ''}
          `}
          >
            {callStatus === 'connected' && 'Em andamento'}
            {callStatus === 'waiting' && 'Aguardando parceiro...'}
            {callStatus === 'connecting' && 'Conectando...'}
            {callStatus === 'ended' && 'Finalizada'}
          </Badge>
          <span className="font-medium text-neutral-300">
            Negociação: {session?.room_name || 'Sala Privada'}
          </span>
        </div>
        <div className="text-sm text-neutral-400 font-serif">V Moda</div>
      </div>

      <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden">
        <div className="flex-1 bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden relative flex items-center justify-center shadow-lg">
          {callStatus === 'connected' && mockRemoteConnected ? (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-800/50">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-125"></div>
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-neutral-700 relative z-10 shadow-2xl"
                />
              </div>
              <div className="absolute bottom-6 left-6 bg-black/60 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-white font-medium tracking-wide">{partnerName}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-500">
              <User className="w-24 h-24 mb-4 opacity-50" />
              <p className="text-lg">
                {callStatus === 'waiting'
                  ? `Aguardando ${partnerName} aceitar...`
                  : 'Conectando...'}
              </p>
            </div>
          )}
        </div>

        <div className="w-full md:w-72 lg:w-96 shrink-0 flex flex-col gap-4">
          <div className="aspect-[4/3] bg-black rounded-xl border border-neutral-800 overflow-hidden relative shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''} scale-x-[-1]`}
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                <div className="w-16 h-16 rounded-full bg-neutral-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-neutral-400" />
                </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm text-xs font-medium flex items-center gap-2 text-white">
              Você
              {!isMicOn && <MicOff className="w-3 h-3 text-red-500" />}
            </div>
          </div>

          <Card className="bg-neutral-900 border-neutral-800 text-neutral-200 shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-medium text-white flex items-center gap-2 font-serif text-lg">
                Detalhes da Sessão
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Esta é uma sala segura de negociação. Mostre as peças ao vivo, feche valores e
                alinhe as logísticas de envio diretamente pelo vídeo.
              </p>

              {partner && (
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center gap-3">
                  <img
                    src={partnerAvatar}
                    alt="Partner"
                    className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{partnerName}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {partner.role === 'manufacturer'
                        ? 'Fabricante / Marca'
                        : 'Lojista / Sacoleira'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-6 bg-neutral-950 flex items-center justify-center gap-4 md:gap-6 border-t border-neutral-900">
        <Button
          variant={isMicOn ? 'secondary' : 'destructive'}
          size="icon"
          className={`w-14 h-14 rounded-full ${isMicOn ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : ''}`}
          onClick={toggleMic}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        <Button
          variant={isCameraOn ? 'secondary' : 'destructive'}
          size="icon"
          className={`w-14 h-14 rounded-full ${isCameraOn ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : ''}`}
          onClick={toggleCamera}
        >
          {isCameraOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 ml-4"
          onClick={endCall}
        >
          <PhoneOff className="w-7 h-7" />
        </Button>
      </div>
    </div>
  )
}
