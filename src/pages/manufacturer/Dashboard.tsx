import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Truck, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ManufacturerDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.name || 'Fabricante'}!</h1>
      <p className="text-muted-foreground">Bem-vindo ao seu portal de gestão do V Moda.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/manufacturer/catalog">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meu Catálogo</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gerenciar</div>
              <p className="text-xs text-muted-foreground mt-1">Produtos e Coleções</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/manufacturer/leads">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CRM & Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Acessar</div>
              <p className="text-xs text-muted-foreground mt-1">Negociações e Clientes</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/manufacturer/logistics">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Logística</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Acompanhar</div>
              <p className="text-xs text-muted-foreground mt-1">Status de Envios</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/manufacturer/v-club">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">V Club</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Configurar</div>
              <p className="text-xs text-muted-foreground mt-1">Cashback e Benefícios</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
