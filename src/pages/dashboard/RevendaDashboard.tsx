import { useState, useEffect } from 'react'
import { Award, MapPin, ShieldCheck, Star, Target, TrendingUp, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'

export default function RevendaDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const careerLevel = user?.unlocked_benefits?.career_level || 'Consultora Fashion'
  const isExclusive = user?.unlocked_benefits?.fashion_exclusive || false
  const [zones, setZones] = useState<any[]>([])
  const [newZone, setNewZone] = useState('')

  const levels = [
    { name: 'Consultora Fashion', required: 0 },
    { name: 'Consultora Fashion Exclusive', required: 100 },
    { name: 'Consultora Master/Mentora', required: 500 },
  ]

  const currentLevelIndex = levels.findIndex((l) => l.name === careerLevel)
  const progress = currentLevelIndex >= 0 ? (currentLevelIndex / (levels.length - 1)) * 100 : 0

  useEffect(() => {
    loadZones()
  }, [])

  const loadZones = async () => {
    if (!user) return
    try {
      const records = await pb.collection('zone_requests').getFullList({
        filter: `requester = "${user.id}"`,
        sort: '-created',
      })
      setZones(records)
    } catch (e) {
      console.error(e)
    }
  }

  const requestZone = async () => {
    if (!newZone.trim()) return
    try {
      await pb.collection('zone_requests').create({
        requester: user?.id,
        zone_name: newZone,
        status: 'pending',
      })
      setNewZone('')
      loadZones()
      toast({ title: 'Sucesso', description: 'Solicitação de zona enviada com sucesso!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao solicitar zona.' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Painel Revenda</h2>
          <p className="text-muted-foreground">
            Evolua sua carreira e gerencie suas zonas de atuação.
          </p>
        </div>
        {isExclusive && (
          <Badge
            variant="default"
            className="bg-amber-500 hover:bg-amber-600 text-white gap-1 px-3 py-1"
          >
            <ShieldCheck className="h-4 w-4" />
            Fashion Exclusive
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sua Jornada de Consultora
            </CardTitle>
            <CardDescription>
              Acompanhe seu progresso e desbloqueie benefícios exclusivos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Nível Atual: {careerLevel}</span>
                <span className="text-sm text-muted-foreground">Progresso</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {levels.map((lvl, i) => (
                  <span
                    key={i}
                    className={i <= currentLevelIndex ? 'text-foreground font-medium' : ''}
                  >
                    {lvl.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div
                className={`p-4 rounded-lg border ${currentLevelIndex >= 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}
              >
                <Star className="h-6 w-6 mb-2 text-primary" />
                <h4 className="font-semibold mb-1">Consultora Fashion</h4>
                <p className="text-xs text-muted-foreground">
                  Acesso ao catálogo e materiais básicos de venda.
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${currentLevelIndex >= 1 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 opacity-60'}`}
              >
                <ShieldCheck className="h-6 w-6 mb-2 text-amber-500" />
                <h4 className="font-semibold mb-1">Fashion Exclusive</h4>
                <p className="text-xs text-muted-foreground">
                  Zonas de exclusividade e acesso antecipado às coleções.
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${currentLevelIndex >= 2 ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 opacity-60'}`}
              >
                <Award className="h-6 w-6 mb-2 text-purple-500" />
                <h4 className="font-semibold mb-1">Master / Mentora</h4>
                <p className="text-xs text-muted-foreground">
                  Comissões extras, mentoria e destaque nacional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Proteção de Território
            </CardTitle>
            <CardDescription>
              Solicite zonas de atuação exclusiva (Disponível para Fashion Exclusive).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isExclusive ? (
              <div className="text-center p-6 border rounded-lg bg-amber-50/50 border-amber-200">
                <ShieldCheck className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="font-semibold text-amber-900 mb-1">Certificação Necessária</h3>
                <p className="text-sm text-amber-800">
                  Conclua os módulos na Academy Fashion para solicitar zonas exclusivas.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label>Nova Zona (Cidade/Bairro)</Label>
                    <Input
                      placeholder="Ex: Zona Sul, São Paulo - SP"
                      value={newZone}
                      onChange={(e) => setNewZone(e.target.value)}
                    />
                  </div>
                  <Button onClick={requestZone}>Solicitar</Button>
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold">Suas Solicitações</h4>
                  {zones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma solicitação encontrada.</p>
                  ) : (
                    zones.map((z) => (
                      <div
                        key={z.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <span className="font-medium text-sm">{z.zone_name}</span>
                        <Badge
                          variant={
                            z.status === 'approved'
                              ? 'default'
                              : z.status === 'denied'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {z.status === 'approved'
                            ? 'Aprovado'
                            : z.status === 'denied'
                              ? 'Negado'
                              : 'Pendente'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Metas e Benefícios
            </CardTitle>
            <CardDescription>Próximos passos para evolução.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <CheckCircle2
                  className={`h-5 w-5 ${currentLevelIndex >= 1 ? 'text-green-500' : 'text-muted-foreground'}`}
                />
                <div>
                  <p className="font-medium text-sm">Certificação Academy Fashion</p>
                  <p className="text-xs text-muted-foreground">
                    Conclua os cursos para virar Exclusive.
                  </p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2
                  className={`h-5 w-5 ${currentLevelIndex >= 2 ? 'text-green-500' : 'text-muted-foreground'}`}
                />
                <div>
                  <p className="font-medium text-sm">Atingir R$ 10.000 em vendas</p>
                  <p className="text-xs text-muted-foreground">
                    Meta para o nível Master / Mentora.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
