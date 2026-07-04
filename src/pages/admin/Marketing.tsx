import { MagazineGenerator } from '@/components/admin/MagazineGenerator'
import { patchCrossOriginStylesheets } from '@/lib/safe-css-rules'
import { Button } from '@/components/ui/button'
import { Instagram } from 'lucide-react'

patchCrossOriginStylesheets()

export default function AdminMarketing() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gerador de Revista</h2>
          <p className="text-muted-foreground">Crie materiais com o template "MODA ATUAL".</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open('https://www.instagram.com/revistamodaatual', '_blank')}
        >
          <Instagram className="w-4 h-4 mr-2" />
          Abrir Instagram @revistamodaatual
        </Button>
      </div>
      <MagazineGenerator />
    </div>
  )
}
