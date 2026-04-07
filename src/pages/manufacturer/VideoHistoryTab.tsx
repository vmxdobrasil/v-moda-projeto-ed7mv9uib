import { useEffect, useState } from 'react'
import { Video, Calendar, User, PhoneOff, Phone } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import useAuthStore from '@/stores/useAuthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FadeIn } from '@/components/FadeIn'

export function VideoHistoryTab() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const loadSessions = async () => {
      try {
        const res = await pb.collection('video_sessions').getList(1, 20, {
          filter: `host="${user.id}" || participant="${user.id}"`,
          sort: '-created',
          expand: 'host,participant',
        })
        setSessions(res.items)
      } catch (err) {
        console.error('Error loading video sessions:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
  }, [user])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-serif">Histórico de Videochamadas</h2>
        <p className="text-muted-foreground">
          Acompanhe suas negociações em vídeo com lojistas e parceiros.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" /> Sessões Recentes
          </CardTitle>
          <CardDescription>
            Lista de todas as chamadas recebidas ou realizadas por você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="divide-y border rounded-lg overflow-hidden">
              {sessions.map((session, i) => {
                const isHost = session.host === user?.id
                const partner = isHost ? session.expand?.participant : session.expand?.host
                const isIncoming = !isHost

                return (
                  <FadeIn key={session.id} delay={i * 50}>
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncoming ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}
                        >
                          {isIncoming ? (
                            <Phone className="w-5 h-5" />
                          ) : (
                            <Video className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{session.room_name}</p>
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {partner?.name || 'Usuário'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(session.created).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(session.created).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            session.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : session.status === 'ended'
                                ? 'bg-neutral-100 text-neutral-800 border-neutral-200'
                                : session.status === 'declined'
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          {session.status === 'active'
                            ? 'Ativa'
                            : session.status === 'ended'
                              ? 'Finalizada'
                              : session.status === 'declined'
                                ? 'Recusada'
                                : 'Pendente'}
                        </span>
                        {isIncoming && session.status === 'pending' && (
                          <span className="text-xs text-blue-600 font-medium animate-pulse">
                            Recebendo...
                          </span>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <PhoneOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Nenhuma chamada encontrada</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                O histórico de suas negociações em vídeo aparecerá aqui quando você realizar ou
                receber chamadas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
