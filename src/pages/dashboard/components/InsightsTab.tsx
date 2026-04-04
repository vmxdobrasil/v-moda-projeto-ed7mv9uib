import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Customer } from '@/services/customers'

export default function InsightsTab({ customers }: { customers: Customer[] }) {
  const data = useMemo(() => {
    return customers
      .filter((c) => (c.whatsapp_clicks || 0) > 0)
      .map((c) => ({
        name: c.name,
        clicks: c.whatsapp_clicks || 0,
      }))
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
          <CardTitle>Partner Performance Insights</CardTitle>
          <CardDescription>Most engaged partners based on WhatsApp clicks</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
              No click data available yet.
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
