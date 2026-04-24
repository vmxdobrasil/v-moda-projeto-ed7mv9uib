import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, Target, Activity, TrendingUp } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

export default function ManufacturerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ leads: 0, products: 0, conversions: 0, referrals: 0 })
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return

        const [customers, projects, notifications, referrals] = await Promise.all([
          pb.collection('customers').getFullList({ filter: `manufacturer = "${user.id}"` }),
          pb.collection('projects').getFullList({ filter: `manufacturer = "${user.id}"` }),
          pb
            .collection('notifications')
            .getList(1, 5, { filter: `user = "${user.id}"`, sort: '-created' }),
          pb.collection('referrals').getFullList({ filter: `brand = "${user.id}"` }),
        ])

        const converted = customers.filter((c) => c.status === 'converted').length

        setStats({
          leads: customers.length,
          products: projects.length,
          conversions: converted,
          referrals: referrals.length,
        })
        setActivities(notifications.items)
      } catch (error) {
        console.error('Error loading dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const chartData = [
    { name: 'Leads', total: stats.leads },
    { name: 'Conversions', total: stats.conversions },
    { name: 'Referrals', total: stats.referrals },
  ]

  return (
    <div className="flex-1 space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard & Analytics</h2>
        <p className="text-muted-foreground">
          Monitor real-time metrics, conversion rates, and sales trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
            <p className="text-xs text-muted-foreground">Active in pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
            <p className="text-xs text-muted-foreground">Successful sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.referrals}</div>
            <p className="text-xs text-muted-foreground">From affiliates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Active catalog</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={{}} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-8">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mr-4 shrink-0 mt-0.5">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.message}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.created).toLocaleDateString('en-US')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
