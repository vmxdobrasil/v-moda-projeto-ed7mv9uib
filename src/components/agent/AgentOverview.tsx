import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Activity, Wallet } from 'lucide-react'

export function AgentOverview({
  customers,
  referrals,
  user,
}: {
  customers: any[]
  referrals: any[]
  user: any
}) {
  const totalClients = customers.length

  const getRefValue = (ref: any) => {
    if (ref.metadata?.commission_value) return Number(ref.metadata.commission_value)
    if (ref.metadata?.amount)
      return Number(ref.metadata.amount) * ((user?.commission_rate || 0) / 100)
    return 0
  }

  const pendingCommissions = referrals
    .filter((r) => !r.is_paid)
    .reduce((acc, r) => acc + getRefValue(r), 0)
  const paidCommissions = referrals
    .filter((r) => r.is_paid)
    .reduce((acc, r) => acc + getRefValue(r), 0)

  const converted = customers.filter((c) => ['converted', 'closed'].includes(c.status))
  const totalValue = converted.reduce((acc, c) => acc + (c.estimated_value || 0), 0)
  const avgTicket = converted.length > 0 ? totalValue / converted.length : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clientes Indicados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClients}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Comissões a Receber</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            R$ {pendingCommissions.toFixed(2)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">R$ {paidCommissions.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio (Convertidos)</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {avgTicket.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
