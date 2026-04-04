import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Customer } from '@/services/customers'

const CATEGORY_LABELS: Record<string, string> = {
  moda_feminina: 'Moda Feminina',
  jeans: 'Jeans',
  moda_praia: 'Moda Praia',
  moda_geral: 'Moda Geral',
  moda_masculina: 'Moda Masculina',
  moda_evangelica: 'Moda Evangélica',
  moda_country: 'Moda Country',
  moda_infantil: 'Moda Infantil',
  bijouterias_semijoias: 'Bijouterias/Semijoias',
  calcados: 'Calçados',
}

export default function InsightsTab({ customers }: { customers: Customer[] }) {
  const data = useMemo(() => {
    const categoryClicks: Record<string, number> = {}

    customers.forEach((c) => {
      if ((c.whatsapp_clicks || 0) > 0 && c.ranking_category) {
        const cat = CATEGORY_LABELS[c.ranking_category] || c.ranking_category
        categoryClicks[cat] = (categoryClicks[cat] || 0) + (c.whatsapp_clicks || 0)
      }
    })

    return Object.entries(categoryClicks)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
  }, [customers])

  const chartConfig = {
    clicks: { label: 'WhatsApp Clicks', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Performance por Segmento</CardTitle>
          <CardDescription>Categorias com maior engajamento via WhatsApp Clicks</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              Sem dados de cliques suficientes nas categorias.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="clicks"
                  fill="var(--color-clicks)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
