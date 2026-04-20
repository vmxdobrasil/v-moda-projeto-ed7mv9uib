import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Video, PhoneCall, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'

export default function VideoSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [newSession, setNewSession] = useState({ participant: '', room_name: '' })

  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const myId = pb.authStore.record?.id
      if (!myId) return
      const [sess, usrs] = await Promise.all([
        pb.collection('video_sessions').getFullList({
          filter: `host = "${myId}" || participant = "${myId}"`,
          sort: '-created',
          expand: 'host,participant',
        }),
        pb.collection('users').getFullList({ filter: `id != "${myId}"`, sort: 'name' }),
      ])
      setSessions(sess)
      setUsers(usrs)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao carregar sessões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('video_sessions', () => loadData())

  const handleCreate = async () => {
    if (!newSession.participant || !newSession.room_name) {
      return toast.error('Preencha todos os campos.')
    }
    try {
      const record = await pb.collection('video_sessions').create({
        host: pb.authStore.record?.id,
        participant: newSession.participant,
        room_name: newSession.room_name,
        status: 'pending',
      })
      toast.success('Sessão criada! Você pode ingressar agora.')
      setIsOpen(false)
      setNewSession({ participant: '', room_name: '' })
      navigate(`/negotiation/video/${record.id}`)
    } catch (e) {
      toast.error('Erro ao criar sessão')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vídeo Negociação</h1>
          <p className="text-muted-foreground">
            Realize chamadas de vídeo focadas em vendas com seus clientes e parceiros.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Nova Negociação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Iniciar Nova Sessão de Vídeo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Sala / Assunto</Label>
                <Input
                  value={newSession.room_name}
                  onChange={(e) => setNewSession({ ...newSession, room_name: e.target.value })}
                  placeholder="Ex: Demonstração Coleção Outono"
                />
              </div>
              <div className="space-y-2">
                <Label>Convidar Participante</Label>
                <Select
                  value={newSession.participant}
                  onValueChange={(v) => setNewSession({ ...newSession, participant: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email || u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full mt-4" onClick={handleCreate}>
                <Video className="w-4 h-4 mr-2" /> Iniciar Chamada
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sala / Assunto</TableHead>
              <TableHead>Organizador</TableHead>
              <TableHead>Convidado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  Nenhuma sessão de vídeo registrada.
                  <br />
                  Crie uma nova sessão para conversar ao vivo com seus parceiros.
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => {
                const isHost = session.host === pb.authStore.record?.id
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.room_name}</TableCell>
                    <TableCell>{isHost ? 'Você' : session.expand?.host?.name || '-'}</TableCell>
                    <TableCell>
                      {!isHost ? 'Você' : session.expand?.participant?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          session.status === 'active'
                            ? 'default'
                            : session.status === 'pending'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={
                          session.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''
                        }
                      >
                        {session.status === 'active'
                          ? 'Em andamento'
                          : session.status === 'pending'
                            ? 'Pendente'
                            : session.status === 'ended'
                              ? 'Finalizada'
                              : 'Recusada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(session.created).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.status !== 'ended' && session.status !== 'declined' ? (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/negotiation/video/${session.id}`)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <PhoneCall className="w-4 h-4 mr-2" /> Ingressar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/negotiation/summary/${session.id}`)}
                        >
                          Ver Resumo
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
