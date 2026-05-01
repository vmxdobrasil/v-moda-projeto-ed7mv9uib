import { Globe, Play, Apple, BookOpen, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function Magazine() {
  const { user } = useAuth()

  const handleTrackClick = (destination: string) => {
    if (user) {
      pb.collection('referrals')
        .create({
          affiliate: user.id,
          type: 'click',
          source_channel: 'social_profile',
          metadata: { destination },
        })
        .catch(console.error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Revista Moda Atual
        </h1>
        <p className="text-muted-foreground mt-2">
          Acesse o portal oficial ou baixe nosso aplicativo para acompanhar as últimas tendências e
          novidades do mundo da moda.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex gap-3 text-sm">
        <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
        <p>
          Para garantir sua segurança e evitar bloqueios de navegação (X-Frame-Options), o conteúdo
          da revista e as lojas de aplicativos agora são acessados em abas externas isoladas.
        </p>
      </div>

      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
          <CardTitle className="text-2xl text-primary">Plataformas Disponíveis</CardTitle>
          <CardDescription className="text-base">
            Selecione uma das opções abaixo para ser redirecionado com segurança para o destino
            desejado.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            asChild
            className="h-auto py-8 flex flex-col items-center justify-center gap-4 bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-1"
          >
            <a
              href="https://revistamodaatual.com.br"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackClick('official_site')}
            >
              <Globe className="h-12 w-12" />
              <div className="text-center space-y-1">
                <div className="font-bold text-lg">Site Oficial</div>
                <div className="text-xs opacity-90 font-normal">Abrir no navegador</div>
              </div>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-8 flex flex-col items-center justify-center gap-4 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 shadow-lg transition-all hover:-translate-y-1"
          >
            <a
              href="https://play.google.com/store/apps/details?id=com.revista-moda-atual.app"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackClick('google_play')}
            >
              <Play className="h-12 w-12" />
              <div className="text-center space-y-1">
                <div className="font-bold text-lg">Play Store</div>
                <div className="text-xs font-normal">Baixar para Android</div>
              </div>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-auto py-8 flex flex-col items-center justify-center gap-4 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-all hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
          >
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackClick('app_store')}
            >
              <Apple className="h-12 w-12" />
              <div className="text-center space-y-1">
                <div className="font-bold text-lg">App Store</div>
                <div className="text-xs font-normal">Baixar para iOS</div>
              </div>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
