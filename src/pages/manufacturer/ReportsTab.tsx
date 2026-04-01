import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { formatPrice } from '@/lib/data'

const mockSalesData = [
  { date: '01/05', sales: 4500, quantity: 45, orders: 3 },
  { date: '08/05', sales: 6200, quantity: 60, orders: 4 },
  { date: '15/05', sales: 3100, quantity: 28, orders: 2 },
  { date: '22/05', sales: 8400, quantity: 82, orders: 6 },
  { date: '29/05', sales: 5900, quantity: 55, orders: 5 },
]

export function ReportsTab() {
  const [range, setRange] = useState('30days')

  const { totalSales, totalQty, totalOrders } = useMemo(() => {
    const factor = range === '7days' ? 0.3 : range === 'month' ? 0.8 : 1
    const ts = mockSalesData.reduce((acc, curr) => acc + curr.sales, 0) * factor
    const tq = mockSalesData.reduce((acc, curr) => acc + curr.quantity, 0) * factor
    const to = mockSalesData.reduce((acc, curr) => acc + curr.orders, 0) * factor
    return { totalSales: ts, totalQty: Math.round(tq), totalOrders: Math.round(to) }
  }, [range])

  const chartConfig = {
    sales: { label: 'Vendas (R$)', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Desempenho</h2>
          <p className="text-muted-foreground">Acompanhe suas vendas no atacado.</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="month">Mês Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peças Vendidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQty} un</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={mockSalesData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickFormatter={(val) => `R$${val}`} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
