import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VallenFabricanteChat } from '@/components/manufacturer/VallenFabricanteChat'

const TEMPLATES = [
  {
    title: 'Lançamento de Coleção (WhatsApp)',
    content:
      'Olá! ✨ Acabamos de lançar nossa nova coleção no catálogo digital V MODA. Peças exclusivas com mínimo de atacado reduzido esta semana. Confira as 8 páginas de novidades: [Link]',
  },
  {
    title: 'Reativação de VIP (V Club)',
    content:
      'Oi sumida! ❤️ Sentimos sua falta. Como você é cliente VIP no V Club, liberamos 5% de cashback extra na sua próxima compra no nosso catálogo. Vem conferir!',
  },
  {
    title: 'Promoção de Estoque (Instagram)',
    content:
      'Últimas peças com preço especial de atacado! 👗 Arraste para cima e veja nosso catálogo digital. Condições exclusivas para revendedoras.',
  },
]

export default function ManufacturerDashboard() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Painel do Fabricante</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo(a), {user?.name || 'Fabricante'}. Gerencie seu catálogo, V Club e converse com a
          Vallen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Vallen - Consultora Especialista</CardTitle>
            </CardHeader>
            <CardContent className="h-[600px] p-0 overflow-hidden rounded-b-lg border-t">
              <VallenFabricanteChat />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Biblioteca de Templates</h2>
          <p className="text-sm text-muted-foreground">Copie e cole mensagens de alta conversão.</p>

          <div className="space-y-4">
            {TEMPLATES.map((tpl, i) => (
              <Card key={i}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">{tpl.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md italic">
                    "{tpl.content}"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => navigator.clipboard.writeText(tpl.content)}
                  >
                    Copiar Texto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
