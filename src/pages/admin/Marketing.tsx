import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Download, Image as ImageIcon, Loader2 } from 'lucide-react'
import { PRODUCTS, formatPrice } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'

export default function AdminMarketing() {
  const [prodId, setProdId] = useState('')
  const [format, setFormat] = useState<'web' | 'app'>('web')
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()
  const prod = PRODUCTS.find((p) => p.id === prodId)

  const download = async () => {
    if (!prod) return
    setGenerating(true)
    try {
      const cvs = document.createElement('canvas')
      const ctx = cvs.getContext('2d')
      if (!ctx) return
      const [w, h] = format === 'web' ? [1080, 1517] : [1080, 1920]
      cvs.width = w
      cvs.height = h
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, w, h)

      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = prod.image
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
      })

      const hh = Math.floor(h * 0.1),
        fh = Math.floor(h * 0.2),
        fy = h - fh
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, hh)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 60px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('MODA ATUAL', w / 2, hh / 2)

      const ih = h - hh - fh,
        ir = img.width / img.height,
        ar = w / ih
      let dw = w,
        dh = ih,
        ox = 0,
        oy = hh
      if (ir > ar) {
        dh = w / ir
        oy = hh + (ih - dh) / 2
      } else {
        dw = ih * ir
        ox = (w - dw) / 2
      }
      ctx.drawImage(img, ox, oy, dw, dh)

      ctx.fillStyle = '#f9fafb'
      ctx.fillRect(0, fy, w, fh)
      ctx.fillStyle = '#000'
      ctx.font = 'bold 48px sans-serif'
      ctx.fillText(prod.name, w / 2, fy + fh * 0.4)
      ctx.fillStyle = '#6b7280'
      ctx.font = '500 36px sans-serif'
      ctx.fillText(formatPrice(prod.price), w / 2, fy + fh * 0.7)

      const link = document.createElement('a')
      link.download = `revista-${prod.id}-${format}.jpg`
      link.href = cvs.toDataURL('image/jpeg', 0.9)
      link.click()
      toast({ title: 'Sucesso', description: 'Imagem gerada com sucesso.' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao gerar imagem.', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gerador de Revista</h2>
        <p className="text-muted-foreground">Crie materiais com o template "MODA ATUAL".</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Selecione o produto e formato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Produto</Label>
              <Select value={prodId} onValueChange={setProdId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Formato</Label>
              <RadioGroup
                value={format}
                onValueChange={(v: any) => setFormat(v)}
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="web"
                  className={`flex flex-col items-center p-4 border-2 rounded-md cursor-pointer ${format === 'web' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-accent'}`}
                >
                  <RadioGroupItem value="web" id="web" className="sr-only" />
                  <ImageIcon className="mb-2 h-6 w-6" />
                  <span className="font-medium">Web Vertical</span>
                  <span className="text-xs text-muted-foreground">21 x 29.5 cm</span>
                </Label>
                <Label
                  htmlFor="app"
                  className={`flex flex-col items-center p-4 border-2 rounded-md cursor-pointer ${format === 'app' ? 'border-primary bg-primary/5' : 'border-muted hover:bg-accent'}`}
                >
                  <RadioGroupItem value="app" id="app" className="sr-only" />
                  <ImageIcon className="mb-2 h-6 w-6" />
                  <span className="font-medium">App Version</span>
                  <span className="text-xs text-muted-foreground">9:16 Mobile</span>
                </Label>
              </RadioGroup>
            </div>
            <Button className="w-full" size="lg" disabled={!prod || generating} onClick={download}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Baixar Imagem
            </Button>
          </CardContent>
        </Card>
        <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border border-dashed">
          <Label className="mb-4 text-muted-foreground">Pré-visualização</Label>
          <div
            className={`relative bg-white border shadow-xl flex flex-col transition-all ${format === 'web' ? 'w-[300px] aspect-[21/29.5]' : 'w-[280px] aspect-[9/16]'}`}
          >
            <div className="h-[10%] bg-black text-white flex items-center justify-center font-serif text-lg font-bold tracking-[0.2em]">
              MODA ATUAL
            </div>
            <div className="flex-1 relative bg-white flex items-center justify-center p-2">
              {prod ? (
                <img src={prod.image} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">Nenhum produto</span>
              )}
            </div>
            <div className="h-[20%] bg-gray-50 flex flex-col items-center justify-center p-4 text-center border-t">
              {prod ? (
                <>
                  <h3 className="font-bold text-[1rem] line-clamp-2">{prod.name}</h3>
                  <p className="text-muted-foreground font-medium mt-1 text-sm">
                    {formatPrice(prod.price)}
                  </p>
                </>
              ) : (
                <div className="w-full space-y-2 flex flex-col items-center opacity-50">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
