import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Heart, Star } from 'lucide-react'

export default function DashboardHub() {
  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao portal da V MODA. Descubra tendências e coleções.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novas Coleções</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Disponíveis esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Produtos salvos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marcas Recomendadas</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Baseado no seu perfil</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
