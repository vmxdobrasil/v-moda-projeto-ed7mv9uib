import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Crown, Store } from 'lucide-react'
import { VallenGuiaModaChat } from '@/components/guia-de-moda/VallenGuiaModaChat'
import { GuideDirectory } from '@/components/guia-de-moda/GuideDirectory'
import { TopMarcasSection } from '@/components/guia-de-moda/TopMarcasSection'

export default function GuiaDeModa() {
  return (
    <div className="container py-12 animate-fade-in mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
            Guia de Moda
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Descubra as melhores marcas do Polo de Moda. Navegue pelo diretório completo de
            fabricantes ou conheça as marcas elite do TOP V MODA.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 rounded-full shadow-lg h-12 px-6 bg-azul hover:bg-azul/90 text-azul-foreground hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
              Falar com Vallen
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0 border-none">
            <VallenGuiaModaChat />
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 bg-muted/30 border">
          <TabsTrigger
            value="guide"
            className="data-[state=active]:bg-azul data-[state=active]:text-azul-foreground font-semibold"
          >
            <Store className="w-4 h-4 mr-2" />
            Guia de Compras
          </TabsTrigger>
          <TabsTrigger
            value="top"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
          >
            <Crown className="w-4 h-4 mr-2" />
            Top Marcas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="guide" className="mt-0">
          <GuideDirectory />
        </TabsContent>
        <TabsContent value="top" className="mt-0">
          <TopMarcasSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
