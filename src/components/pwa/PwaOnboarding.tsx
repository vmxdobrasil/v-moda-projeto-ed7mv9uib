import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { QrCode, WifiOff, BellRing } from 'lucide-react'
import { usePWA } from '@/components/pwa/PwaProvider'

export function PwaOnboarding() {
  const [open, setOpen] = useState(false)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const { requestPushPermission } = usePWA()

  useEffect(() => {
    const hasSeen = localStorage.getItem('vmoda-pwa-onboarding')
    if (!hasSeen) {
      const timer = setTimeout(() => setOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const handleFinish = async () => {
    await requestPushPermission()
    localStorage.setItem('vmoda-pwa-onboarding', 'true')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden rounded-2xl overflow-hidden p-0 border-0">
        <div className="bg-gradient-to-br from-primary/10 to-background pt-6 pb-2">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              <CarouselItem>
                <div className="flex flex-col items-center text-center px-8 py-6 space-y-5">
                  <div className="bg-white dark:bg-zinc-800 p-5 rounded-full text-primary shadow-xl shadow-primary/20 mb-2">
                    <QrCode className="h-10 w-10" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Leitor QR Code</DialogTitle>
                    <DialogDescription className="text-base">
                      Acesse as coleções instantaneamente lendo os QR Codes nas lojas ou crachás de
                      consultoras parceiras.
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex flex-col items-center text-center px-8 py-6 space-y-5">
                  <div className="bg-white dark:bg-zinc-800 p-5 rounded-full text-primary shadow-xl shadow-primary/20 mb-2">
                    <WifiOff className="h-10 w-10" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Catálogo Offline</DialogTitle>
                    <DialogDescription className="text-base">
                      Ficou sem sinal? Navegue pelas <strong>TOP 60 MARCAS</strong> e salve
                      favoritos mesmo offline. Nós sincronizamos quando voltar.
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex flex-col items-center text-center px-8 py-6 space-y-5">
                  <div className="bg-white dark:bg-zinc-800 p-5 rounded-full text-primary shadow-xl shadow-primary/20 mb-2">
                    <BellRing className="h-10 w-10" />
                  </div>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-serif">Notificações</DialogTitle>
                    <DialogDescription className="text-base">
                      Fique por dentro! Receba alertas sobre o status dos seus pedidos, logística e
                      novas coleções.
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </CarouselItem>
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-2 mb-4">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${current === idx ? 'w-6 bg-primary' : 'w-2 bg-primary/20'}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
        <DialogFooter className="flex flex-row justify-between items-center p-6 bg-background">
          <Button
            variant="ghost"
            onClick={handleFinish}
            className="text-muted-foreground hover:text-foreground px-2"
          >
            Pular
          </Button>
          {current < 2 ? (
            <Button onClick={() => api?.scrollNext()} className="px-8 rounded-full shadow-md">
              Próximo
            </Button>
          ) : (
            <Button onClick={handleFinish} className="px-8 rounded-full shadow-md">
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
