import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Building2,
  Package,
  Activity,
  LayoutDashboard,
  Settings,
  CheckCircle2,
} from 'lucide-react'

export default function Index() {
  const [stats, setStats] = useState({
    customers: 0,
    manufacturers: 0,
    projects: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const [customersRes, usersRes, projectsRes] = await Promise.all([
          pb.collection('customers').getList(1, 1),
          pb.collection('users').getList(1, 1, { filter: 'role="manufacturer"' }),
          pb.collection('projects').getList(1, 1),
        ])

        if (isMounted) {
          setStats({
            customers: customersRes.totalItems,
            manufacturers: usersRes.totalItems,
            projects: projectsRes.totalItems,
          })
        }
      } catch (err: any) {
        console.error('Error loading dashboard data:', err)
        if (isMounted) {
          setError(
            err?.message ||
              'Não foi possível carregar os dados do painel. Verifique sua conexão com o banco de dados.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-white">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            V Moda Dash
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-md text-sm font-medium"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4" />
            Clientes
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Fabricantes
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors"
          >
            <Package className="w-4 h-4" />
            Produtos
          </a>
        </nav>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Visão Geral</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
              <Users className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Bem-vindo ao Painel
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Aqui está o resumo das atividades da sua plataforma conectada ao PocketBase.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-3 text-sm font-medium">
                <Activity className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Total de Clientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-[100px] mt-1" />
                  ) : (
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {stats.customers}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">Registrados no sistema</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Fabricantes
                  </CardTitle>
                  <Building2 className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-[100px] mt-1" />
                  ) : (
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {stats.manufacturers}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">Parceiros ativos</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Projetos / Produtos
                  </CardTitle>
                  <Package className="h-4 w-4 text-zinc-400" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-[100px] mt-1" />
                  ) : (
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {stats.projects}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">Cadastrados no catálogo</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>
                  Verificação de conexão com a base de dados e renderização da interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-sm text-zinc-900 dark:text-white">
                          Conexão PocketBase
                        </span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-sm text-zinc-900 dark:text-white">
                          Interface de Renderização
                        </span>
                      </div>
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Ativa
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
