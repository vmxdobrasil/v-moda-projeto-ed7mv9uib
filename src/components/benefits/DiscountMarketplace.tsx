import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export function DiscountMarketplace() {
  const courses = [
    {
      title: 'Gestão Financeira para Lojistas e Sacoleiras',
      original: 497,
      current: 99,
      code: 'VMODA80',
      img: 'finance%20business',
    },
    {
      title: 'Marketing de Moda no Instagram e Reels',
      original: 397,
      current: 79,
      code: 'VMODA80',
      img: 'instagram%20marketing',
    },
    {
      title: 'Atendimento e Fechamento de Vendas Rápidas',
      original: 297,
      current: 59,
      code: 'VMODA80',
      img: 'customer%20service',
    },
  ]

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Cupom ${code} copiado com sucesso! Use no checkout.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 bg-card p-6 rounded-xl border shadow-sm">
        <div className="p-4 bg-primary/10 rounded-full">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">HUB V MODA Academy</h2>
          <p className="text-muted-foreground mt-1">
            Avance sua carreira e negócio com treinamentos e capacitações com{' '}
            <strong>até 80% de desconto</strong> exclusivos para nossos parceiros e clientes.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((c, i) => (
          <Card
            key={i}
            className="flex flex-col hover:shadow-lg transition-shadow border-primary/10"
          >
            <img
              src={`https://img.usecurling.com/p/400/250?q=${c.img}&color=blue`}
              alt={c.title}
              className="w-full h-44 object-cover rounded-t-xl"
            />
            <CardHeader className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <Badge className="bg-green-600 hover:bg-green-700">80% OFF</Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{c.title}</CardTitle>
              <CardDescription>
                Aprenda técnicas validadas pelo mercado atacadista e varejista.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground line-through">
                  De R$ {c.original},00
                </span>
                <span className="text-2xl font-bold text-primary">Por R$ {c.current},00</span>
              </div>
              <div className="bg-muted p-3 rounded-lg flex items-center justify-between border border-primary/20">
                <span className="font-mono font-bold tracking-wider">{c.code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(c.code)}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar Cupom
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
