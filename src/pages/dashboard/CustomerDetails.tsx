import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Customer, updateCustomer } from '@/services/customers'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Save, Loader2, Mail, Phone, Calendar, User, FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: '',
    ranking_category: '',
    notes: '',
  })

  useEffect(() => {
    if (!id) return
    loadCustomer(id)
  }, [id])

  const loadCustomer = async (customerId: string) => {
    try {
      setLoading(true)
      const record = await pb.collection('customers').getOne<Customer>(customerId)
      setCustomer(record)
      setFormData({
        name: record.name || '',
        email: record.email || '',
        phone: record.phone || '',
        status: record.status || 'new',
        ranking_category: record.ranking_category || '',
        notes: record.notes || '',
      })
    } catch (error) {
      toast({ description: 'Erro ao carregar cliente.', variant: 'destructive' })
      navigate('/dashboard/clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await updateCustomer(id, formData)
      toast({ description: 'Cliente atualizado com sucesso!' })
      loadCustomer(id)
    } catch (error) {
      toast({ description: 'Erro ao salvar alterações.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!customer) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/clientes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detalhes do Cliente</h1>
          <p className="text-muted-foreground text-sm">
            Visualize e edite as informações do perfil.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24 border-2 shadow-sm">
              <AvatarImage
                src={
                  customer.avatar
                    ? pb.files.getUrl(customer, customer.avatar, { thumb: '200x200' })
                    : undefined
                }
                alt={customer.name}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-bold uppercase bg-primary/10 text-primary">
                {customer.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{customer.name}</h2>
              <div className="mt-2">
                <BadgeStatus status={customer.status} />
              </div>
            </div>

            <div className="w-full space-y-3 mt-4 text-sm text-left border-t pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{customer.email || 'Sem e-mail'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{customer.phone || 'Sem telefone'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Desde {new Date(customer.created).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span className="capitalize">
                  Origem: {customer.source?.replace('_', ' ') || 'Desconhecida'}
                </span>
              </div>
              {customer.logistics_file && (
                <div className="mt-4 pt-4 border-t w-full flex flex-col gap-2 text-sm text-left">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" /> Documento Logístico:
                  </span>
                  <a
                    href={pb.files.getUrl(customer, customer.logistics_file)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    Baixar / Visualizar Arquivo
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações e Edição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status do Funil</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="interested">Interessado</SelectItem>
                    <SelectItem value="negotiating">Em Negociação</SelectItem>
                    <SelectItem value="converted">Convertido</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Categoria de Ranking (Loja/Nicho)</Label>
                <Select
                  value={formData.ranking_category}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, ranking_category: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sem categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moda_feminina">Moda Feminina</SelectItem>
                    <SelectItem value="jeans">Jeans</SelectItem>
                    <SelectItem value="moda_praia">Moda Praia</SelectItem>
                    <SelectItem value="moda_geral">Moda Geral</SelectItem>
                    <SelectItem value="moda_masculina">Moda Masculina</SelectItem>
                    <SelectItem value="moda_evangelica">Moda Evangélica</SelectItem>
                    <SelectItem value="moda_fitness">Moda Fitness</SelectItem>
                    <SelectItem value="plus_size">Plus Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Anotações do Cliente</Label>
                <Textarea
                  placeholder="Adicione notas sobre as preferências ou tratativas com este cliente..."
                  className="min-h-[120px] resize-y"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BadgeStatus({ status }: { status: string }) {
  switch (status) {
    case 'new':
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
          Novo
        </span>
      )
    case 'interested':
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
          Interessado
        </span>
      )
    case 'negotiating':
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800">
          Em Negociação
        </span>
      )
    case 'converted':
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
          Convertido
        </span>
      )
    case 'inactive':
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
          Inativo
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
          {status}
        </span>
      )
  }
}
