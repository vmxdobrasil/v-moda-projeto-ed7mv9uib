import { useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MockCRMPage() {
  const location = useLocation()
  const pageName =
    location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageName}</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas configurações e dados do módulo {pageName.toLowerCase()}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de {pageName}</CardTitle>
          <CardDescription>
            Esta é uma página de demonstração para o módulo {pageName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/10">
            <p className="text-muted-foreground text-sm">
              O conteúdo para {pageName} será exibido aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
