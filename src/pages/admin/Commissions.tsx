import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DollarSign, Truck, Save, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'

const rulesSchema = z
  .object({
    marketplace_total_commission: z.number().min(0, 'O valor não pode ser negativo'),
    gateway_fee_fixed: z.number().min(0, 'O valor não pode ser negativo'),
    gateway_fee_variable_max: z.number().min(0, 'O valor não pode ser negativo'),
    influencer_commission_rate: z.number().min(0, 'O valor não pode ser negativo'),
    shopping_guide_commission_rate: z.number().min(0, 'O valor não pode ser negativo'),
  })
  .refine(
    (data) => {
      const sum =
        data.gateway_fee_variable_max +
        data.influencer_commission_rate +
        data.shopping_guide_commission_rate
      return sum <= data.marketplace_total_commission
    },
    {
      message:
        'A soma das taxas (Gateway Máx + Influenciador + Guia) não pode exceder a Comissão Total.',
      path: ['marketplace_total_commission'],
    },
  )

type RulesFormValues = z.infer<typeof rulesSchema>

export default function AdminCommissions() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any[]>([])

  const rulesForm = useForm<RulesFormValues>({
    resolver: zodResolver(rulesSchema),
    defaultValues: {
      marketplace_total_commission: 13.89,
      gateway_fee_fixed: 2.99,
      gateway_fee_variable_max: 3.89,
      influencer_commission_rate: 1.0,
      shopping_guide_commission_rate: 2.0,
    },
  })

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        filter: 'freight_value > 0 || logistics_status != "" || shipping_method != ""',
        sort: '-updated',
        expand: 'manufacturer',
      })
      setCustomers(records)
    } catch (error) {
      console.error('Error loading commissions', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const records = await pb.collection('brand_settings').getFullList()
      setSettings(records)

      const values: any = {}
      records.forEach((r) => {
        if (
          [
            'marketplace_total_commission',
            'gateway_fee_fixed',
            'gateway_fee_variable_max',
            'influencer_commission_rate',
            'shopping_guide_commission_rate',
          ].includes(r.key)
        ) {
          values[r.key] = parseFloat(r.value_text) || 0
        }
      })
      if (Object.keys(values).length > 0) {
        rulesForm.reset({ ...rulesForm.getValues(), ...values })
      }
    } catch (error) {
      console.error('Error loading brand settings', error)
    }
  }

  useEffect(() => {
    loadData()
    loadSettings()
  }, [])

  useRealtime('customers', () => loadData())

  const { totalFreight, totalCommission } = useMemo(() => {
    let f = 0
    let c = 0
    customers.forEach((cust) => {
      const val = cust.freight_value || 0
      const rate = cust.expand?.manufacturer?.freight_commission_rate || 0
      f += val
      c += val * (rate / 100)
    })
    return { totalFreight: f, totalCommission: c }
  }, [customers])

  const formatPayer = (payer?: string) => {
    if (payer === 'manufacturer') return 'Fabricante'
    if (payer === 'retailer') return 'Loja/Revendedora'
    return '-'
  }

  const formatMethod = (method?: string) => {
    if (method === 'transportadora') return 'Transportadora'
    if (method === 'correios') return 'Correios'
    if (method === 'caravana_onibus') return 'Caravana/Ônibus'
    if (method === 'agente_credenciado') return 'Agente Credenciado'
    return '-'
  }

  const onRulesSubmit = async (data: RulesFormValues) => {
    try {
      const toUpdate = [
        {
          key: 'marketplace_total_commission',
          value: data.marketplace_total_commission,
          name: 'Comissão Total do Marketplace (%)',
        },
        {
          key: 'gateway_fee_fixed',
          value: data.gateway_fee_fixed,
          name: 'Taxa Fixa do Gateway (R$)',
        },
        {
          key: 'gateway_fee_variable_max',
          value: data.gateway_fee_variable_max,
          name: 'Taxa Variável Máxima do Gateway (%)',
        },
        {
          key: 'influencer_commission_rate',
          value: data.influencer_commission_rate,
          name: 'Comissão de Influenciador (%)',
        },
        {
          key: 'shopping_guide_commission_rate',
          value: data.shopping_guide_commission_rate,
          name: 'Comissão de Guia de Compras (%)',
        },
      ]

      const currentAdminId = pb.authStore.model?.id

      for (const item of toUpdate) {
        const record = settings.find((s) => s.key === item.key)
        const oldValStr = record ? record.value_text : '0'
        const newValStr = item.value.toString()

        if (oldValStr !== newValStr) {
          if (record) {
            await pb.collection('brand_settings').update(record.id, { value_text: newValStr })
          } else {
            await pb.collection('brand_settings').create({
              name: item.name,
              key: item.key,
              value_text: newValStr,
            })
          }

          if (currentAdminId) {
            await pb.collection('commission_audit_logs').create({
              admin_user: currentAdminId,
              target_partner: currentAdminId,
              previous_rate: parseFloat(oldValStr),
              new_rate: item.value,
            })
          }
        }
      }

      // Update all users with affiliate and agent roles
      const usersToUpdate = await pb
        .collection('users')
        .getFullList({ filter: 'role = "affiliate" || role = "agent"' })
      for (const user of usersToUpdate) {
        const isAffiliate = user.role === 'affiliate'
        const newRate = isAffiliate
          ? data.influencer_commission_rate
          : data.shopping_guide_commission_rate
        if (user.commission_rate !== newRate) {
          await pb.collection('users').update(user.id, { commission_rate: newRate })
        }
      }

      toast.success('Sucesso', {
        description: 'Regras de comissionamento atualizadas com sucesso.',
      })
      loadSettings()
    } catch (error) {
      console.error(error)
      toast.error('Erro', {
        description: 'Falha ao salvar as regras de comissionamento.',
      })
    }
  }

  const values = rulesForm.watch()
  const platformBalance =
    values.marketplace_total_commission -
    values.gateway_fee_variable_max -
    values.influencer_commission_rate -
    values.shopping_guide_commission_rate

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Comissões</h2>
        <p className="text-muted-foreground">
          Gerencie as comissões de logística e parâmetros globais do marketplace.
        </p>
      </div>

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rules">Regras Globais</TabsTrigger>
          <TabsTrigger value="logistics">Logística</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Configurações de Split</CardTitle>
                <CardDescription>
                  Defina como os {values.marketplace_total_commission}% de comissão total serão
                  divididos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...rulesForm}>
                  <form onSubmit={rulesForm.handleSubmit(onRulesSubmit)} className="space-y-4">
                    <FormField
                      control={rulesForm.control}
                      name="marketplace_total_commission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comissão Total do Marketplace (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={rulesForm.control}
                        name="gateway_fee_fixed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taxa Fixa Gateway (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rulesForm.control}
                        name="gateway_fee_variable_max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Taxa Variável Gateway (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={rulesForm.control}
                        name="influencer_commission_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Influenciadores (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={rulesForm.control}
                        name="shopping_guide_commission_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guias de Compra (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Save className="w-4 h-4 mr-2" /> Salvar Configurações
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Balanço da Plataforma</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    O que sobra para a administração (Lucro Líquido Estimado)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{platformBalance.toFixed(2)}%</div>
                  <p className="text-sm mt-2 opacity-90 flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                      <Info className="w-4 h-4" /> Fórmula calculada como:
                    </span>
                    <span>
                      Total ({values.marketplace_total_commission}%) - Gateway Máx (
                      {values.gateway_fee_variable_max}%) - Influenciador (
                      {values.influencer_commission_rate}%) - Guia (
                      {values.shopping_guide_commission_rate}%)
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Impacto nas Contas
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>Ao salvar estas configurações, o sistema irá:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                    <li>Atualizar a taxa de comissão global para referência futura.</li>
                    <li>
                      Aplicar a taxa de <strong>{values.influencer_commission_rate}%</strong> a
                      todos os usuários com papel de <em>Afiliado/Influenciador</em>.
                    </li>
                    <li>
                      Aplicar a taxa de <strong>{values.shopping_guide_commission_rate}%</strong> a
                      todos os usuários com papel de <em>Guia de Compras</em>.
                    </li>
                    <li>Registrar todas as mudanças no Log de Auditoria.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total em Fretes</CardTitle>
                <Truck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalFreight.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Comissão Gerada</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalCommission.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Método de Envio</TableHead>
                    <TableHead>Pagador do Frete</TableHead>
                    <TableHead className="text-right">Valor do Frete</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Nenhum registro de logística encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c) => {
                      const val = c.freight_value || 0
                      const rate = c.expand?.manufacturer?.freight_commission_rate || 0
                      const comm = val * (rate / 100)

                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.expand?.manufacturer?.name || '-'}</TableCell>
                          <TableCell>{formatMethod(c.shipping_method)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted">
                              {formatPayer(c.freight_payer)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">R$ {val.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            R$ {comm.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
