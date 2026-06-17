import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VallenFabricanteChat } from '@/components/manufacturer/VallenFabricanteChat'

export default function ManufacturerMessages() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Estrategista IA</h1>
        <p className="text-muted-foreground">
          Consulte a Vallen para curadoria de produtos, copywriting e gestão de VIPs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VallenFabricanteChat />
        </div>
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Dicas da Vallen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">📱 Copywriting</h4>
                <p className="text-muted-foreground">
                  Peça para eu criar legendas persuasivas com gatilhos mentais para seus novos
                  lançamentos do catálogo.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">⭐ V Club VIPs</h4>
                <p className="text-muted-foreground">
                  Posso identificar clientes VIPs exclusivos inativos e sugerir mensagens de
                  reativação via WhatsApp.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">📦 Curadoria de Catálogo</h4>
                <p className="text-muted-foreground">
                  Otimize suas 8 páginas limitadas pedindo minha análise baseada nas tendências e
                  cliques.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">💰 Otimização de Preços</h4>
                <p className="text-muted-foreground">
                  Avalio se suas exigências de atacado estão muito restritas perante ao mercado para
                  aumentar conversão.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
