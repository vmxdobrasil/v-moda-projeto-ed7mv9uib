import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function Messages() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensagens</h1>
        <p className="text-muted-foreground">
          Gerencie suas comunicações e conversas com clientes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Caixa de Entrada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Nenhuma mensagem encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Sua caixa de entrada está limpa. Quando seus clientes enviarem mensagens pelos canais
              conectados, elas aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
