import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Printer,
  ShoppingCart,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const revenueData = [
  { date: '01/10', revenue: 1200 },
  { date: '05/10', revenue: 2100 },
  { date: '10/10', revenue: 1800 },
  { date: '15/10', revenue: 3200 },
  { date: '20/10', revenue: 2800 },
  { date: '25/10', revenue: 4500 },
  { date: '30/10', revenue: 5100 },
]

const topProducts = [
  { id: '1', name: 'Vestido Seda Longo', category: 'Vestidos', sold: 45, revenue: 56250 },
  { id: '2', name: 'Calça Pantalona', category: 'Calças', sold: 38, revenue: 33820 },
  { id: '3', name: 'Blazer Alfaiataria', category: 'Casacos', sold: 25, revenue: 37500 },
  { id: '4', name: 'Camisa Linho', category: 'Camisas', sold: 22, revenue: 9900 },
  { id: '5', name: 'Scarpin Verniz', category: 'Calçados', sold: 18, revenue: 19800 },
]

export default function Reports() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Analíticos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Visualize métricas avançadas e exporte dados do seu negócio.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Últimos 30 Dias
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Versão para Impressão
          </Button>
        </div>
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">V Moda</h1>
        <h2 className="text-xl font-semibold mt-2">Resumo Mensal - Relatório de Desempenho</h2>
        <p className="text-sm text-muted-foreground">
          Gerado em: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 157.270,00</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Realizados</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground mt-1">+5.2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversão de Carrinho</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.4%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dos carrinhos iniciados viraram pedidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tendência de Receita (Últimos 30 Dias)
            </CardTitle>
            <CardDescription className="print:hidden">
              Acompanhamento de faturamento diário.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer
              config={{
                revenue: {
                  label: 'Receita (R$)',
                  color: 'hsl(var(--primary))',
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    fontSize={12}
                    tickFormatter={(val) => `R$ ${val / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription className="print:hidden">
              Itens mais vendidos no período selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{product.sold}</TableCell>
                      <TableCell className="text-right">
                        R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 print:hidden">
              <Button className="w-full" variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
