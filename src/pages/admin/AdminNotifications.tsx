import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Server, MessageSquare, AlertTriangle } from 'lucide-react'

export default function AdminNotifications() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Central de Notificações & Custos
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os disparos automáticos e controle os custos de infraestrutura.
        </p>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Server className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary font-semibold">
          Custo de Infraestrutura: Fixo
        </AlertTitle>
        <AlertDescription className="text-muted-foreground mt-1">
          A VPS com a Evolution API possui custo fixo (ex: $49/mês). Notificações internas do
          sistema são <strong className="text-foreground">Totalmente Gratuitas</strong>. Gatilhos
          que geravam cobrança por mensagem em outras plataformas foram desativados.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <CardTitle>Gatilhos do WhatsApp (Evolution API)</CardTitle>
            </div>
            <CardDescription>
              Custo zero por mensagem enviada (Custo apenas do servidor).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Mensagem de Boas-Vindas</Label>
                <p className="text-sm text-muted-foreground">Dispara ao converter um novo lead.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Campanha de Reativação</Label>
                <p className="text-sm text-muted-foreground">
                  Dispara para clientes inativos há 30 dias.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4 opacity-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label className="text-base">Alerta de Liquidação</Label>
                  <Badge variant="secondary">Desativado</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Suprimido para evitar custos e limites abusivos.
                </p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle>Notificações do Sistema (Push/PWA)</CardTitle>
            </div>
            <CardDescription>Notificações direto no navegador/app. Gratuitas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Aviso de Novo Pedido</Label>
                <p className="text-sm text-muted-foreground">
                  Push notification para o fabricante.
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Atualização de V CLUB</Label>
                <p className="text-sm text-muted-foreground">Alerta de liberação de cartão.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
