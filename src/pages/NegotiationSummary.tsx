import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FileText, Video as VideoIcon, ArrowLeft, Calendar, User, CheckCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function NegotiationSummary() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    pb.collection('video_sessions')
      .getOne(sessionId!, { expand: 'host,participant' })
      .then(setSession)
      .catch(() => navigate('/'))
  }, [sessionId, navigate])

  if (!session) {
    return (
      <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[50vh]">
        Carregando resumo da sessão...
      </div>
    )
  }

  const recordingUrl = session.recording ? pb.files.getUrl(session, session.recording) : null
  const partner =
    session.host === pb.authStore.record?.id ? session.expand?.participant : session.expand?.host

  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-serif font-bold flex items-center gap-3">
              Resumo da Negociação
              <CheckCircle className="w-6 h-6 text-green-500" />
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {session.ended_at
                ? format(new Date(session.ended_at), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", {
                    locale: ptBR,
                  })
                : 'Sessão Finalizada'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md border-muted">
          <CardHeader className="pb-4 border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Anotações e Acordos
            </CardTitle>
            <CardDescription>Notas registradas durante a chamada</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {session.negotiation_notes ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 bg-muted/30 p-5 rounded-lg border border-border/50 min-h-[200px]">
                {session.negotiation_notes}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground italic bg-muted/10 rounded-lg border border-dashed border-border/50 min-h-[200px] flex items-center justify-center">
                Nenhuma anotação registrada nesta sessão.
              </div>
            )}

            {partner && (
              <div className="mt-8 pt-6 border-t flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                  {partner.avatar ? (
                    <img
                      src={pb.files.getUrl(partner, partner.avatar)}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Negociado com {partner.name}</p>
                  <p className="text-xs text-muted-foreground">{partner.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-muted">
          <CardHeader className="pb-4 border-b bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-primary" />
              Gravação da Sessão
            </CardTitle>
            <CardDescription>Reproduza o vídeo capturado (Apenas seu áudio/vídeo)</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] bg-black/5 rounded-b-xl">
            {recordingUrl ? (
              <div className="w-full overflow-hidden rounded-lg shadow-sm border bg-black">
                <video src={recordingUrl} controls className="w-full aspect-video object-contain" />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                  <VideoIcon className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-medium text-foreground/80">Nenhuma gravação disponível</p>
                <p className="text-sm max-w-[250px]">
                  A sessão não foi gravada ou o vídeo ainda está sendo processado em segundo plano.
                  Tente recarregar a página em alguns instantes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
