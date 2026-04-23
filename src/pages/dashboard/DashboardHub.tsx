import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, TrendingUp, Activity } from 'lucide-react'

export default function DashboardHub() {
  const [metrics, setMetrics] = useState({
    customers: 0,
    projects: 0,
    loading: true,
  })

  useEffect(() => {
    let isMounted = true

    const fetchMetrics = async () => {
      try {
        const [customersRes, projectsRes] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('projects').getList(1, 1),
        ])

        if (isMounted) {
          setMetrics({
            customers: customersRes.totalItems,
            projects: projectsRes.totalItems,
            loading: false,
          })
        }
      } catch (error) {
        console.error('Erro ao buscar métricas:', error)
        if (isMounted) {
          setMetrics((m) => ({ ...m, loading: false }))
        }
      }
    }

    fetchMetrics()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Bem-vindo ao painel de controle da V Moda.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.loading ? '-' : metrics.customers}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.loading ? '-' : metrics.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">Catálogo de produtos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Resumo</div>
            <p className="text-xs text-muted-foreground mt-1">Métricas de conversão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Visão Geral</div>
            <p className="text-xs text-muted-foreground mt-1">Análise de tendências</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
