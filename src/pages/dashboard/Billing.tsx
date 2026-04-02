import { useState, useEffect } from 'react'
import {
  getMySubscription,
  updateMySubscription,
  createMySubscription,
  Subscription,
} from '@/services/subscriptions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 'R$ 0',
    description: 'Para fabricantes iniciantes',
    features: ['Até 50 leads no CRM', 'Canal WhatsApp (básico)', 'Suporte da comunidade'],
  },
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 99/mês',
    description: 'Para pequenos negócios em crescimento',
    features: [
      'Até 500 leads no CRM',
      'WhatsApp e Instagram',
      'Respostas automáticas de IA',
      'Suporte por email',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 299/mês',
    description: 'O plano ideal para escalar vendas',
    features: [
      'Leads ilimitados no CRM',
      'Todos os canais integrados',
      'Agente de IA avançado',
      'Relatórios detalhados',
      'Suporte prioritário',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob Consulta',
    description: 'Para grandes operações',
    features: [
      'Tudo do Pro',
      'API dedicada',
      'Gerente de conta exclusivo',
      'Treinamento de equipe',
    ],
  },
]

export default function Billing() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const sub = await getMySubscription()
      setSubscription(sub)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setProcessing(true)
    try {
      if (subscription) {
        await updateMySubscription(subscription.id, planId as any)
      } else {
        await createMySubscription(planId as any)
      }
      toast.success('Plano atualizado com sucesso!')
      await loadSubscription()
    } catch (err) {
      toast.error('Erro ao atualizar plano')
    } finally {
      setProcessing(false)
    }
  }

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Carregando plano...</div>

  const currentPlanId = subscription?.plan_tier || 'free'

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Plano</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura e acesse novos recursos de IA.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-lg">Assinatura Atual</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-bold capitalize text-primary">{currentPlanId}</span>
            {subscription?.status === 'active' ? (
              <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
            ) : subscription ? (
              <Badge variant="destructive">Pagamento Pendente</Badge>
            ) : (
              <Badge variant="outline" className="border-primary text-primary">
                Plano Gratuito
              </Badge>
            )}
          </div>
          {subscription?.next_billing_date && (
            <p className="text-sm text-muted-foreground mt-2">
              Próxima cobrança em{' '}
              {new Date(subscription.next_billing_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda com o plano?</p>
          <Button variant="outline">Contatar Suporte</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlanId
          return (
            <Card
              key={plan.id}
              className={`flex flex-col transition-all duration-300 ${isCurrent ? 'border-primary border-2 shadow-lg relative scale-105' : 'hover:border-primary/50'}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  SEU PLANO
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="h-10">{plan.description}</CardDescription>
                <div className="mt-4 text-3xl font-bold">{plan.price}</div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || processing}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrent ? 'Plano Atual' : 'Fazer Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
