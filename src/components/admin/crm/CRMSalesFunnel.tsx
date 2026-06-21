import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { differenceInDays } from 'date-fns'
import { MessageCircle } from 'lucide-react'
import { OODASuggestionDialog } from './OODASuggestionDialog'

type Customer = any

const STAGE_MAPPING: Record<string, string> = {
  new: 'Prospecção',
  lead: 'Prospecção',
  contact: 'Contato',
  interested: 'Contato',
  proposal: 'Proposta',
  qualified: 'Proposta',
  negotiating: 'Negociação',
  negotiation: 'Negociação',
  converted: 'Fechamento',
  closed: 'Fechamento',
}

const STAGES = ['Prospecção', 'Contato', 'Proposta', 'Negociação', 'Fechamento']

function getAdaColor(customer: Customer) {
  const dateStr = customer.last_action_date || customer.updated
  if (!dateStr) return 'bg-gray-400'
  const diff = differenceInDays(new Date(), new Date(dateStr))
  if (diff <= 7) return 'bg-green-500'
  if (diff <= 15) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function CRMSalesFunnel() {
  const [customers, setCustomers] = useState<Customer[]>([])

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        sort: '-updated',
        filter: "status != 'inactive'",
        expand: 'category_id',
      })
      setCustomers(records)
    } catch (err) {
      console.error('Error loading CRM funnel', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => {
    loadData()
  })

  const getCustomersByStage = (stageName: string) => {
    return customers.filter((c) => STAGE_MAPPING[c.status] === stageName)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  return (
    <Card className="flex flex-col border border-border shadow-sm">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle>Funil de Vendas Consolidado (Singapore System)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <div className="flex gap-4 min-w-[1000px] h-[600px]">
          {STAGES.map((stage) => {
            const stageCustomers = getCustomersByStage(stage)
            return (
              <div key={stage} className="flex-1 bg-muted/50 rounded-lg p-3 flex flex-col">
                <h3 className="font-semibold mb-3 flex justify-between items-center text-sm">
                  {stage}
                  <Badge variant="secondary" className="bg-background text-orange-600">
                    {stageCustomers.length}
                  </Badge>
                </h3>
                <ScrollArea className="flex-1 -mx-1 px-1">
                  <div className="space-y-3 pb-4">
                    {stageCustomers.map((c) => (
                      <Card
                        key={c.id}
                        className="p-3 text-sm flex flex-col gap-2 shadow-sm border-l-4 border-l-orange-500"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium line-clamp-1 flex-1 flex items-center gap-1">
                            {(c.source === 'whatsapp' || c.source === 'whatsapp_group') && (
                              <MessageCircle
                                className="h-3.5 w-3.5 text-green-500 shrink-0"
                                title="Origem WhatsApp"
                              />
                            )}
                            {c.name}
                          </span>
                          <div
                            className={`w-3 h-3 rounded-full shrink-0 mt-1 ${getAdaColor(c)}`}
                            title="Indicador ADA de Performance (Verde <= 7d, Amarelo <= 15d, Vermelho > 15d)"
                          />
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {c.expand?.category_id?.name || c.ranking_category || 'Sem categoria'}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="font-semibold text-orange-600">
                            {formatCurrency(c.estimated_value || 0)}
                          </div>
                          {c.phone && (
                            <a
                              href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-1.5 rounded-md transition-colors"
                              title="Falar no WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <OODASuggestionDialog customerId={c.id} />
                      </Card>
                    ))}
                    {stageCustomers.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-8 bg-background/50 rounded-md border border-dashed">
                        Vazio
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
