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
  Circle,
  Square,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

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

  const [notes, setNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    if (session?.negotiation_notes && !notes) {
      setNotes(session.negotiation_notes)
    }
  }, [session?.negotiation_notes])

  useEffect(() => {
    if (!sessionId || !session) return
    if (notes === session.negotiation_notes) return

    const timer = setTimeout(() => {
      pb.collection('video_sessions')
        .update(sessionId, { negotiation_notes: notes })
        .catch(console.error)
    }, 1000)

    return () => clearTimeout(timer)
  }, [notes, sessionId, session])

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
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
        setTimeout(() => navigate(`/negotiation/summary/${sessionId}`), 1500)
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

  const startRecording = () => {
    if (!localStream) return
    chunksRef.current = []

    try {
      let options = { mimeType: 'video/webm;codecs=vp9,opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm' }
        }
      }

      const recorder = new MediaRecorder(localStream, options)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: options.mimeType })
        const formData = new FormData()
        formData.append('recording', blob, `recording-${sessionId}.webm`)
        try {
          await pb.collection('video_sessions').update(sessionId!, formData)
          toast({ title: 'Sucesso', description: 'Gravação salva com sucesso.' })
        } catch (err) {
          console.error('Error uploading recording', err)
          toast({ title: 'Erro', description: 'Erro ao salvar a gravação.' })
        }
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      toast({ title: 'Gravando', description: 'A sessão está sendo gravada.' })
    } catch (err) {
      console.error('Error starting recording', err)
      toast({ title: 'Erro', description: 'Seu navegador não suporta gravação.' })
    }
  }

  const stopRecordingFn = () => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        const originalOnStop = mediaRecorderRef.current.onstop
        mediaRecorderRef.current.onstop = async (e) => {
          if (originalOnStop) await (originalOnStop as any)(e)
          resolve()
        }
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      } else {
        resolve()
      }
    })
  }

  const endCall = async () => {
    if (!sessionId) return
    try {
      if (isRecording) {
        toast({ title: 'Finalizando', description: 'Salvando a gravação...' })
        await stopRecordingFn()
      }

      await pb.collection('video_sessions').update(sessionId, {
        status: 'ended',
        ended_at: new Date().toISOString(),
        negotiation_notes: notes,
      })
      setCallStatus('ended')
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      navigate(`/negotiation/summary/${sessionId}`)
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

          <Card className="bg-neutral-900 border-neutral-800 text-neutral-200 shadow-xl flex-1 flex flex-col min-h-[300px]">
            <CardContent className="p-5 flex-1 flex flex-col gap-4">
              <div className="space-y-1">
                <h3 className="font-medium text-white flex items-center gap-2 font-serif text-lg">
                  Anotações da Negociação
                </h3>
                <p className="text-xs text-neutral-400">
                  Registre acordos, preços e termos. Salvo automaticamente.
                </p>
              </div>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: 50 peças a R$ 35. Frete por conta do cliente..."
                className="flex-1 bg-neutral-950/50 border-neutral-800 text-neutral-200 resize-none placeholder:text-neutral-600 focus-visible:ring-neutral-700 min-h-[150px]"
              />

              {partner && (
                <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center gap-3 mt-auto">
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
          variant={isRecording ? 'destructive' : 'secondary'}
          size="icon"
          className={`w-14 h-14 rounded-full ${isRecording ? 'bg-red-600 animate-pulse hover:bg-red-700 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}
          onClick={isRecording ? stopRecordingFn : startRecording}
          title={isRecording ? 'Parar Gravação' : 'Gravar Sessão'}
        >
          {isRecording ? (
            <Square className="w-6 h-6 fill-current" />
          ) : (
            <Circle className="w-6 h-6 fill-current text-red-500" />
          )}
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
