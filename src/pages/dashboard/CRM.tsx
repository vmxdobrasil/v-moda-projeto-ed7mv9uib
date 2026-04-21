import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getCustomers, updateCustomer, type Customer } from '@/services/customers'
import { useRealtime } from '@/hooks/use-realtime'
import { Users, UserCheck, Clock, Ban, UserPlus, Pencil, MessageSquare } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const isManufacturer = pb.authStore.record?.role === 'manufacturer'

  const loadData = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', () => loadData())

  const stats = useMemo(() => {
    const counts = { new: 0, interested: 0, negotiating: 0, converted: 0, inactive: 0 }
    customers.forEach((c) => {
      if (c.status && counts[c.status as keyof typeof counts] !== undefined) {
        counts[c.status as keyof typeof counts]++
      }
    })
    return counts
  }, [customers])

  const total = customers.length

  const chartData = [
    { name: 'Novos', value: stats.new, fill: 'hsl(var(--chart-1))', status: 'new' },
    {
      name: 'Interessados',
      value: stats.interested,
      fill: 'hsl(var(--chart-2))',
      status: 'interested',
    },
    {
      name: 'Em Negociação',
      value: stats.negotiating,
      fill: 'hsl(var(--chart-3))',
      status: 'negotiating',
    },
    {
      name: 'Convertidos',
      value: stats.converted,
      fill: 'hsl(var(--chart-4))',
      status: 'converted',
    },
    { name: 'Inativos', value: stats.inactive, fill: 'hsl(var(--chart-5))', status: 'inactive' },
  ]

  const chartConfig = {
    value: { label: 'Clientes' },
    new: { label: 'Novos', color: 'hsl(var(--chart-1))' },
    interested: { label: 'Interessados', color: 'hsl(var(--chart-2))' },
    negotiating: { label: 'Em Negociação', color: 'hsl(var(--chart-3))' },
    converted: { label: 'Convertidos', color: 'hsl(var(--chart-4))' },
    inactive: { label: 'Inativos', color: 'hsl(var(--chart-5))' },
  }

  const handleUpdateCustomer = async () => {
    if (!editingCustomer) return
    try {
      await updateCustomer(editingCustomer.id, {
        status: editingCustomer.status,
        notes: editingCustomer.notes,
      })
      toast.success('Lead atualizado com sucesso!')
      setEditingCustomer(null)
    } catch (e) {
      toast.error('Erro ao atualizar lead.')
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      new: {
        label: 'Novo',
        className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
      },
      interested: {
        label: 'Interessado',
        className: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
      },
      negotiating: {
        label: 'Em Negociação',
        className: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20',
      },
      converted: {
        label: 'Convertido',
        className: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20',
      },
      inactive: {
        label: 'Inativo',
        className: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20',
      },
    }
    const config = map[status] || { label: status || 'Novo', className: 'bg-gray-100' }
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">Carregando CRM...</div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {isManufacturer ? 'Meu CRM' : 'CRM & Vendas'}
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o funil de conversão e gerencie os leads direcionados à sua marca.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.new / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interessados</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.interested}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.interested / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Negociação</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.negotiating}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.negotiating / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.converted / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {total ? Math.round((stats.inactive / total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Funil</CardTitle>
            <CardDescription>Visão geral dos leads por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume por Status</CardTitle>
            <CardDescription>Comparativo do volume em cada etapa</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Clientes / Leads</CardTitle>
          <CardDescription>
            Atualize o status da negociação e faça anotações importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        {customer.email && (
                          <span className="text-xs text-muted-foreground">{customer.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <a
                          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 hover:underline"
                        >
                          <MessageSquare className="w-3 h-3" />
                          {customer.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status || 'new')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.created ? format(new Date(customer.created), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCustomer(customer)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Lead</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Status da Negociação</Label>
                <Select
                  value={editingCustomer.status || 'new'}
                  onValueChange={(v: any) => setEditingCustomer({ ...editingCustomer, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Anotações Internas</Label>
                <Textarea
                  value={editingCustomer.notes || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, notes: e.target.value })
                  }
                  placeholder="Ex: Cliente tem interesse na nova coleção de jeans..."
                  className="min-h-[100px]"
                />
              </div>
              <Button className="w-full mt-4" onClick={handleUpdateCustomer}>
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
