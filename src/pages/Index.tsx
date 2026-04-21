import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen w-full animate-fade-in">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 lg:py-48 bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://img.usecurling.com/p/1920/1080?q=fashion&color=black"
            alt="Fashion background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            V Moda
          </h1>
          <p className="mx-auto max-w-[800px] text-lg text-gray-300 md:text-xl lg:text-2xl font-light">
            A principal plataforma conectando fabricantes de moda, lojistas e afiliados. Descubra as
            melhores marcas e expanda seus negócios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mt-6">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base w-full sm:w-auto bg-white text-black hover:bg-gray-200"
            >
              <Link to="/cadastro">Começar Agora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-black"
            >
              <Link to="/sobre-nos">Conheça a Plataforma</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Como a V Moda funciona
            </h2>
            <p className="max-w-[700px] text-gray-500 md:text-lg">
              Ecossistema completo para impulsionar suas vendas e simplificar a gestão de pedidos no
              atacado e varejo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Para Fabricantes</h3>
                <p className="text-gray-500">
                  Gerencie seu catálogo, alcance novos lojistas em todo o Brasil e aumente seu
                  faturamento com nosso CRM integrado.
                </p>
                <Button variant="link" asChild className="mt-4">
                  <Link to="/cadastro?role=manufacturer">
                    Vender na plataforma <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Para Lojistas</h3>
                <p className="text-gray-500">
                  Compre diretamente das melhores fábricas, descubra novas coleções e aproveite as
                  melhores condições de pagamento.
                </p>
                <Button variant="link" asChild className="mt-4">
                  <Link to="/cadastro?role=retailer">
                    Comprar para minha loja <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Para Afiliados</h3>
                <p className="text-gray-500">
                  Indique fabricantes e lojistas para a plataforma e ganhe comissões recorrentes
                  sobre as vendas realizadas.
                </p>
                <Button variant="link" asChild className="mt-4">
                  <Link to="/afiliados">
                    Seja um afiliado <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-gray-500 md:text-lg">
              Junte-se a milhares de marcas e lojistas que já estão revolucionando o mercado da moda
              com a V Moda.
            </p>
            <Button asChild size="lg" className="h-14 px-8 text-lg mt-4">
              <Link to="/cadastro">Crie sua conta gratuitamente</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
