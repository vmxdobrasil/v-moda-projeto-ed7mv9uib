import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Analíticos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Visualize métricas avançadas e exporte dados do seu negócio.
          </p>
        </div>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Últimos 30 Dias
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Relatório de Vendas
            </CardTitle>
            <CardDescription>
              Análise detalhada de faturamento, ticket médio e conversão por período.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button className="w-full" variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Desempenho de Produtos
            </CardTitle>
            <CardDescription>
              Métricas de itens mais vendidos, margem de lucro e giro de estoque.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button className="w-full" variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório (PDF)
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-8 border border-dashed rounded-lg bg-muted/10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Novos Relatórios em Breve</h3>
        <p className="text-muted-foreground max-w-md">
          Estamos desenvolvendo novos relatórios gráficos interativos para oferecer insights ainda
          mais profundos sobre a V Moda.
        </p>
      </div>
    </div>
  )
}
