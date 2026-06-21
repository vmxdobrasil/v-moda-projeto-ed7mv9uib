import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { differenceInDays, isThisMonth, parseISO } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Loader2,
  Sparkles,
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'new', label: 'Novo' },
  { id: 'contact', label: 'Em Contato' },
  { id: 'proposal', label: 'Proposta Enviada' },
  { id: 'closed', label: 'Fechado' },
]

export default function AdminManufacturerCRM() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({})
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        filter: "status = 'new' || status = 'contact' || status = 'proposal' || status = 'closed'",
        sort: '-updated',
      })
      setCustomers(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  const totalLeads = customers.length
  const closedThisMonth = customers.filter(
    (c) => c.status === 'closed' && isThisMonth(parseISO(c.updated)),
  ).length

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('leadId')
    if (id) {
      const lead = customers.find((c) => c.id === id)
      if (lead && lead.status !== newStatus) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status: newStatus, last_action_date: new Date().toISOString() }
              : c,
          ),
        )
        try {
          await pb
            .collection('customers')
            .update(id, { status: newStatus, last_action_date: new Date().toISOString() })
        } catch (err) {
          loadData()
          toast({
            title: 'Erro',
            description: 'Não foi possível atualizar o lead.',
            variant: 'destructive',
          })
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const askAgent = async (customerId: string) => {
    setLoadingAi((prev) => ({ ...prev, [customerId]: true }))
    try {
      const res = await pb.send('/backend/v1/guide-crm/ask', {
        method: 'POST',
        body: JSON.stringify({ customer_id: customerId }),
      })
      setAiInsights((prev) => ({ ...prev, [customerId]: res.content }))
      toast({ title: 'Análise OODA Concluída', description: 'Insights gerados com sucesso.' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao analisar lead.', variant: 'destructive' })
    } finally {
      setLoadingAi((prev) => ({ ...prev, [customerId]: false }))
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6 gap-6 overflow-hidden bg-muted/10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
          CRM de Fabricantes (Guia)
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie leads e conversões para o Guia de Compras usando o Sistema Singapore.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Leads
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">{totalLeads}</div>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Novos</CardTitle>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.status === 'new').length}
            </div>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Propostas Enviadas
            </CardTitle>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.status === 'proposal').length}
            </div>
          </CardHeader>
        </Card>
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fechamentos do Mês
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{closedThisMonth}</div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-4 flex-1 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex-1 min-w-[280px] bg-muted/50 rounded-xl p-4 flex flex-col border border-border"
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="secondary" className="bg-background text-orange-600">
                {customers.filter((c) => c.status === col.id).length}
              </Badge>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-3 pb-4">
                {customers
                  .filter((c) => c.status === col.id)
                  .map((customer) => (
                    <LeadCard
                      key={customer.id}
                      customer={customer}
                      onDragStart={handleDragStart}
                      askAgent={askAgent}
                      loadingAi={loadingAi[customer.id]}
                      aiInsight={aiInsights[customer.id]}
                    />
                  ))}
                {customers.filter((c) => c.status === col.id).length === 0 && (
                  <div className="text-center text-muted-foreground text-xs py-8 bg-background/50 rounded-md border border-dashed">
                    Nenhum lead nesta etapa
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  )
}

function LeadCard({ customer, onDragStart, askAgent, loadingAi, aiInsight }: any) {
  const getAdaColor = (dateStr: string) => {
    if (!dateStr) return 'green'
    const diff = differenceInDays(new Date(), parseISO(dateStr))
    if (diff <= 7) return 'green'
    if (diff <= 15) return 'yellow'
    return 'red'
  }

  const adaColor = getAdaColor(customer.last_action_date || customer.updated)
  const adaBorderClass =
    adaColor === 'green'
      ? 'border-l-green-500'
      : adaColor === 'yellow'
        ? 'border-l-yellow-500'
        : 'border-l-red-500'

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp':
        return <MessageCircle className="w-3 h-3 text-green-600" />
      case 'instagram':
        return <Instagram className="w-3 h-3 text-pink-600" />
      case 'email':
        return <Mail className="w-3 h-3 text-blue-600" />
      default:
        return <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
    }
  }

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, customer.id)}
      className={cn(
        'p-3 cursor-move border-l-4 shadow-sm hover:shadow-md transition-all bg-card',
        adaBorderClass,
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-sm line-clamp-1 flex-1 pr-2">{customer.name}</h4>
        <Badge
          variant="outline"
          className="text-[10px] shrink-0 flex items-center gap-1 bg-background"
        >
          {getSourceIcon(customer.source)}
          <span className="capitalize">{customer.source || 'Manual'}</span>
        </Badge>
      </div>

      {customer.phone && (
        <a
          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center text-xs text-muted-foreground hover:text-orange-600 mb-2 transition-colors w-fit"
        >
          <Phone className="w-3 h-3 mr-1" />
          {customer.phone}
        </a>
      )}

      {aiInsight ? (
        <div className="mt-3 p-2 bg-orange-50/50 rounded-md border border-orange-100 text-xs">
          <div className="flex items-center gap-1 text-orange-700 font-semibold mb-1">
            <Sparkles className="w-3 h-3" />
            OODA Insight
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">{aiInsight}</p>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 mt-2"
          onClick={() => askAgent(customer.id)}
          disabled={loadingAi}
        >
          {loadingAi ? (
            <Loader2 className="w-3 h-3 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-3 h-3 mr-2" />
          )}
          Analisar com OODA
        </Button>
      )}
    </Card>
  )
}
