import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BrainCircuit, MessageCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export function OODASuggestionDialog({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !suggestion) {
      setLoading(true)
      try {
        const res = await pb.send('/backend/v1/ooda/whatsapp-analysis', {
          method: 'POST',
          body: JSON.stringify({ customer_id: customerId }),
        })
        setSuggestion(res.content)
      } catch (err) {
        console.error(err)
        setSuggestion('Erro ao gerar análise OODA. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex items-center justify-center gap-1 w-full mt-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors bg-white"
        >
          <BrainCircuit className="h-3 w-3" />
          OODA Action
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-orange-500" />
            Análise OODA - Copilot WhatsApp
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[120px] flex items-center justify-center bg-muted/30 rounded-lg p-5 border shadow-inner text-sm relative">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
              <BrainCircuit className="h-6 w-6" />
              <span>OODA analisando contexto e templates do lead...</span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col gap-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                <p className="whitespace-pre-wrap leading-relaxed text-foreground font-medium">
                  {suggestion}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
