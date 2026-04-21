import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Users,
  Truck,
  ShieldCheck,
  PlayCircle,
} from 'lucide-react'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-background animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion%20models&color=black"
            alt="V Moda Hero"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-32 lg:py-48 flex flex-col items-center text-center">
          <Badge className="mb-6 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium">
            O Maior Hub de Moda do Brasil
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
            Conectando{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Fabricantes
            </span>{' '}
            e{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Revendedores
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl leading-relaxed">
            Descubra as melhores marcas, negocie diretamente com fabricantes e impulsione suas
            vendas com a plataforma V Moda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              className="text-base h-14 px-8 shadow-lg transition-transform hover:scale-105"
              asChild
            >
              <Link to="/cadastro">
                Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-14 px-8 bg-transparent text-white border-white/30 hover:bg-white/10 transition-transform hover:scale-105"
              asChild
            >
              <Link to="/colecoes">Explorar Coleções</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher a V Moda?</h2>
            <p className="text-muted-foreground text-lg">
              Oferecemos um ecossistema completo para o mercado atacadista de moda, unindo
              tecnologia, logística e os melhores fornecedores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShoppingBag className="h-10 w-10 text-primary" />}
              title="Acesso Direto"
              description="Compre diretamente dos maiores polos de moda do Brasil (44 Goiânia, Brás, Bom Retiro) sem intermediários."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-10 w-10 text-primary" />}
              title="Compra Segura"
              description="Fornecedores verificados e avaliados pela comunidade para garantir a qualidade e entrega dos seus pedidos."
            />
            <FeatureCard
              icon={<Truck className="h-10 w-10 text-primary" />}
              title="Logística Integrada"
              description="Acompanhamento em tempo real das suas mercadorias, das excursões até a sua loja."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Programa de Benefícios"
              description="Desbloqueie vantagens exclusivas conforme seu volume de compras aumenta em nossa plataforma."
            />
            <FeatureCard
              icon={<PlayCircle className="h-10 w-10 text-primary" />}
              title="Negociação em Vídeo"
              description="Converse ao vivo com os fabricantes, veja as peças em detalhes e feche negócios como se estivesse lá."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Programa de Afiliados"
              description="Indique novos revendedores ou fabricantes e ganhe comissões recorrentes sobre as transações."
            />
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Categorias Populares</h2>
              <p className="text-muted-foreground">Encontre exatamente o que seu público procura</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link to="/colecoes">
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <CategoryCard
              title="Moda Feminina"
              image="https://img.usecurling.com/p/400/500?q=women%20fashion"
            />
            <CategoryCard
              title="Jeans"
              image="https://img.usecurling.com/p/400/500?q=denim%20jeans"
            />
            <CategoryCard
              title="Moda Fitness"
              image="https://img.usecurling.com/p/400/500?q=fitness%20clothing"
            />
            <CategoryCard
              title="Moda Evangélica"
              image="https://img.usecurling.com/p/400/500?q=modest%20fashion"
            />
          </div>

          <Button variant="ghost" className="w-full mt-8 sm:hidden" asChild>
            <Link to="/colecoes">
              Ver todas categorias <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/600?q=abstract%20texture')] mix-blend-overlay opacity-20 bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de lojistas e fabricantes que já estão revolucionando o atacado de
            moda no Brasil.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="text-primary h-14 px-8 text-lg font-semibold"
              asChild
            >
              <Link to="/cadastro">Sou Revendedor</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 h-14 px-8 text-lg font-semibold"
              asChild
            >
              <Link to="/cadastro?role=manufacturer">Sou Fabricante</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm">
      <CardContent className="p-8 text-center flex flex-col items-center">
        <div className="mb-6 p-4 bg-primary/10 rounded-full inline-flex">{icon}</div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function CategoryCard({ title, image }: { title: string; image: string }) {
  return (
    <Link to={`/colecoes`} className="group relative rounded-xl overflow-hidden aspect-[4/5] block">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-white text-xl font-semibold translate-y-2 group-hover:translate-y-0 transition-transform">
          {title}
        </h3>
        <div className="h-0.5 w-12 bg-primary mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </div>
    </Link>
  )
}
