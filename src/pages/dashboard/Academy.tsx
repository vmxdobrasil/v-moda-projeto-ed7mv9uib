import { useState, useEffect } from 'react'
import { GraduationCap, PlayCircle, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'

export default function Academy() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [resources, setResources] = useState<any[]>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const isExclusive = user?.unlocked_benefits?.fashion_exclusive || false

  const tracks = [
    { id: 't1', title: 'Fundamentos da Moda', icon: BookOpen },
    { id: 't2', title: 'Curadoria MODA ATUAL', icon: ShieldCheck },
    { id: 't3', title: 'Metodologia "7 Looks"', icon: PlayCircle },
    { id: 't4', title: 'Vendas Consultivas', icon: GraduationCap },
  ]

  useEffect(() => {
    loadResources()
    const stored = localStorage.getItem('academy_completed')
    if (stored) setCompletedModules(JSON.parse(stored))
  }, [])

  const loadResources = async () => {
    try {
      const records = await pb.collection('resources').getFullList({ sort: '-created' })
      setResources(records)
    } catch (error) {
      console.error(error)
    }
  }

  const markComplete = (trackId: string) => {
    const next = [...completedModules, trackId]
    setCompletedModules(next)
    localStorage.setItem('academy_completed', JSON.stringify(next))
    toast({ title: 'Módulo concluído!', description: 'Continue assim para sua certificação.' })
  }

  const claimCertification = async () => {
    if (completedModules.length < tracks.length) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: 'Conclua todos os módulos primeiro.',
      })
      return
    }

    setIsUpdating(true)
    try {
      const benefits = {
        ...(user?.unlocked_benefits || {}),
        fashion_exclusive: true,
        career_level: 'Consultora Fashion Exclusive',
      }
      await pb.collection('users').update(user!.id, {
        unlocked_benefits: benefits,
      })
      toast({ title: 'Parabéns!', description: 'Você agora é uma Consultora Fashion Exclusive!' })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao emitir certificação.' })
    } finally {
      setIsUpdating(false)
    }
  }

  const progress = (completedModules.length / tracks.length) * 100

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academy Fashion</h2>
          <p className="text-muted-foreground">
            Sua central de aprendizado, tendências e técnicas de vendas.
          </p>
        </div>

        <Card className="w-full md:w-72 bg-primary text-primary-foreground border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium opacity-90">Sua Certificação</p>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-2 w-24 bg-primary-foreground/20" />
                <span className="text-xs font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
            {isExclusive ? (
              <ShieldCheck className="h-8 w-8 text-amber-400" />
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={claimCertification}
                disabled={isUpdating || progress < 100}
                className="text-xs h-8"
              >
                Emitir Selo
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {isExclusive && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-amber-500 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Você é uma Consultora Fashion Exclusive!</h4>
            <p className="text-xs">
              Selo digital ativado. Você já pode solicitar zonas de exclusividade no Painel Revenda.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tracks.map((track) => {
          const isCompleted = completedModules.includes(track.id)
          return (
            <Card key={track.id} className={isCompleted ? 'border-primary bg-primary/5' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                    <track.icon
                      className={`h-5 w-5 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}
                    />
                  </div>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                <CardTitle className="text-lg mt-3">{track.title}</CardTitle>
                <CardDescription>Módulo obrigatório para certificação.</CardDescription>
              </CardHeader>
              <CardFooter>
                {!isCompleted ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => markComplete(track.id)}
                  >
                    Acessar Conteúdo
                  </Button>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center py-1.5">
                    Concluído
                  </Badge>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="pt-6">
        <h3 className="text-xl font-bold mb-4">Biblioteca Complementar</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {resources.slice(0, 6).map((res) => (
            <div
              key={res.id}
              className="flex gap-3 items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                {res.type === 'video' ? (
                  <PlayCircle className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{res.name}</h4>
                <p className="text-xs text-muted-foreground capitalize">{res.type}</p>
              </div>
              <Button size="icon" variant="ghost" asChild>
                <a href={res.url} target="_blank" rel="noreferrer">
                  <PlayCircle className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
          {resources.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-3">
              Nenhum recurso extra encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
