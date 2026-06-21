import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BrainCircuit } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { ScrollArea } from '@/components/ui/scroll-area'

export function OODAAgentDialog({
  agent,
  contextId,
  contextType,
  prompt,
}: {
  agent: string
  contextId: string
  contextType: string
  prompt: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !suggestion) {
      setLoading(true)
      try {
        const res = await pb.send('/backend/v1/ask-agent', {
          method: 'POST',
          body: JSON.stringify({
            agent,
            message: `${prompt} Context ID: ${contextId} (${contextType}). Analise e responda no formato OODA (Observe, Orient, Decide, Act). Seja direto e estratégico.`,
          }),
        })
        setSuggestion(res.content)
      } catch (err) {
        console.error(err)
        setSuggestion(
          'Erro ao gerar análise OODA. Verifique se o agente está configurado e disponível.',
        )
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
          className="h-7 text-xs flex items-center justify-center gap-1 mt-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 transition-colors bg-white w-fit"
        >
          <BrainCircuit className="h-3 w-3" />
          OODA Insight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <BrainCircuit className="h-5 w-5" />
            Análise OODA - {agent}
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-[200px] flex items-center justify-center bg-muted/30 rounded-lg p-5 border shadow-inner text-sm relative">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
              <BrainCircuit className="h-6 w-6" />
              <span>OODA analisando contexto...</span>
            </div>
          ) : (
            <ScrollArea className="w-full h-[300px] pr-4">
              <div className="flex flex-col gap-3 animate-fade-in">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground font-medium">
                  {suggestion}
                </p>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
