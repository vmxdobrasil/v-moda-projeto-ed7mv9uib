import { usePWA } from '@/components/pwa/PwaProvider'
import { Button } from '@/components/ui/button'
import { DownloadCloud } from 'lucide-react'

export function PwaUpdateBanner() {
  const { updateAvailable, updateApp } = usePWA()

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[100] bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl animate-fade-in-up flex items-center justify-between gap-4 border border-primary/20">
      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/10 p-2 rounded-full">
          <DownloadCloud className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium">Nova versão disponível</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={updateApp}
        className="whitespace-nowrap font-semibold"
      >
        Atualizar
      </Button>
    </div>
  )
}
