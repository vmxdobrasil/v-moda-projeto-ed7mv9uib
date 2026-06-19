import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, MessageCircle, Mail, Phone, MapPin, Calendar, Store, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SendWhatsAppModal } from '@/components/crm/SendWhatsAppModal'
import { normalizePhoneBR } from '@/lib/utils'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCustomer()
    }
  }, [id])

  const fetchCustomer = async () => {
    try {
      const record = await pb.collection('customers').getOne(id as string, {
        expand: 'manufacturer,category_id,affiliate_referrer',
      })
      setCustomer(record)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Falha ao carregar detalhes do cliente.',
        variant: 'destructive',
      })
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-muted-foreground">Detalhes do Cliente CRM</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações Principais</CardTitle>
            <CardDescription>Dados de contato e status atual do cliente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Telefone
              </span>
              <p className="font-medium">
                {customer.phone ? normalizePhoneBR(customer.phone) : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </span>
              <p className="font-medium">{customer.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Localização
              </span>
              <p className="font-medium">
                {customer.city ? `${customer.city}, ${customer.state || ''}` : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Store className="h-4 w-4" /> Loja de Origem
              </span>
              <p className="font-medium">{customer.origin_store_name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Tag className="h-4 w-4" /> Status
              </span>
              <div>
                <Badge
                  variant={customer.status === 'converted' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {customer.status || 'N/A'}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Cadastro
              </span>
              <p className="font-medium">
                {format(new Date(customer.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engajamento</CardTitle>
            <CardDescription>Métricas e histórico.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Origem</span>
              <Badge variant="outline" className="capitalize">
                {customer.source || 'Manual'}
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Posição no Ranking</span>
              <span className="font-medium">
                {customer.ranking_position ? `${customer.ranking_position}º` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Cliques no WhatsApp</span>
              <span className="font-medium">{customer.whatsapp_clicks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">V-Club Status</span>
              <Badge variant="outline" className="capitalize">
                {customer.v_club_status || 'none'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <SendWhatsAppModal
        open={isWhatsAppModalOpen}
        onOpenChange={setIsWhatsAppModalOpen}
        customer={customer}
      />
    </div>
  )
}
