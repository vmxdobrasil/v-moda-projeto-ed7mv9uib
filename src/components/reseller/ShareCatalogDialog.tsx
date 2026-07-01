import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Check, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

export function ShareCatalogDialog({
  resellerCode,
  products,
}: {
  resellerCode: string
  products: any[]
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = window.location.origin

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopied(id)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(null), 2000)
  }

  const shareWhatsApp = (url: string, name: string) => {
    const text = encodeURIComponent(`Olha essa peça incrível da V MODA: ${name}!\n${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <Share2 className="w-4 h-4 mr-2" /> Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compartilhar Catálogo</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Links personalizados com seu código de revendedora:
          </p>
          {products.slice(0, 10).map((p) => {
            const link = `${baseUrl}/colecoes?ref=${resellerCode}&product=${p.id}`
            return (
              <div
                key={p.id}
                className="flex items-center gap-2 p-2 rounded-lg border bg-background"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{link}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyLink(link, p.id)}
                  className="shrink-0"
                >
                  {copied === p.id ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => shareWhatsApp(link, p.name)}
                  className="shrink-0 text-green-600"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            )
          })}
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Nenhum produto disponível.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
