import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2, Megaphone } from 'lucide-react'

interface BulkReactivationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: Set<string>
  selectAllMatching: boolean
  filterString: string
  onSuccess: () => void
}

export function BulkReactivationModal({
  open,
  onOpenChange,
  selectedIds,
  selectAllMatching,
  filterString,
  onSuccess,
}: BulkReactivationModalProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, text: '' })

  useEffect(() => {
    if (open) {
      pb.collection('whatsapp_templates')
        .getFullList({
          filter: "is_active = true && trigger_event = 'reactivation_campaign'",
          sort: '-created',
        })
        .then(setTemplates)
        .catch(console.error)
      setSelectedTemplate('')
      setProgress({ current: 0, total: 0, text: '' })
    }
  }, [open])

  const handleStart = async () => {
    if (!selectedTemplate) {
      toast({ title: 'Aviso', description: 'Selecione um template.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      let idsToProcess: string[] = []

      if (selectAllMatching) {
        setProgress({ current: 0, total: 100, text: 'Buscando leads...' })
        let page = 1
        let hasMore = true
        while (hasMore) {
          const res = await pb
            .collection('customers')
            .getList(page, 500, { filter: filterString, fields: 'id' })
          idsToProcess.push(...res.items.map((i: any) => i.id))
          if (page >= res.totalPages) hasMore = false
          else page++
        }
      } else {
        idsToProcess = Array.from(selectedIds)
      }

      if (idsToProcess.length === 0) {
        toast({ title: 'Aviso', description: 'Nenhum lead selecionado.' })
        setLoading(false)
        return
      }

      setProgress({ current: 0, total: idsToProcess.length, text: 'Enviando mensagens...' })

      const CHUNK_SIZE = 100
      let processed = 0
      let sentTotal = 0
      let skippedTotal = 0

      for (let i = 0; i < idsToProcess.length; i += CHUNK_SIZE) {
        const chunk = idsToProcess.slice(i, i + CHUNK_SIZE)
        const res = await pb.send('/backend/v1/whatsapp/reactivate', {
          method: 'POST',
          body: JSON.stringify({ customerIds: chunk, templateId: selectedTemplate }),
        })
        processed += chunk.length
        sentTotal += res.count || 0
        skippedTotal += res.skipped || 0
        setProgress({
          current: processed,
          total: idsToProcess.length,
          text: `Processados ${processed} de ${idsToProcess.length}...`,
        })
      }

      toast({
        title: 'Campanha Concluída',
        description: `${sentTotal} mensagens agendadas. ${skippedTotal > 0 ? `(${skippedTotal} ignoradas por limite de taxa)` : ''}`,
      })
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao processar campanha',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={!loading ? onOpenChange : undefined}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Campanha de Reativação em Massa</DialogTitle>
          <DialogDescription>
            {selectAllMatching
              ? 'Todos os leads desta busca serão reativados.'
              : `${selectedIds.size} leads selecionados para reativação.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Template de WhatsApp</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{progress.text}</span>
                {progress.total > 0 && (
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                )}
              </div>
              <Progress
                value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={loading || !selectedTemplate}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Megaphone className="mr-2 h-4 w-4" />
            )}
            Iniciar Campanha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
