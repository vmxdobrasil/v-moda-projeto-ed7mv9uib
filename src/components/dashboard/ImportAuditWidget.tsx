import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { FileUp, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export function ImportAuditWidget() {
  const [importLog, setImportLog] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      // Find the most recent large import (or just the most recent import log)
      const records = await pb.collection('import_logs').getList(1, 1, {
        sort: '-created',
        filter: 'total_records >= 1000',
      })
      if (records.items.length > 0) {
        setImportLog(records.items[0])
      } else {
        const anyRecords = await pb.collection('import_logs').getList(1, 1, {
          sort: '-created',
        })
        setImportLog(anyRecords.items[0] || null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('import_logs', (e) => {
    if (importLog && e.record.id === importLog.id) {
      setImportLog(e.record)
    } else {
      loadData()
    }
  })

  if (loading)
    return (
      <Card className="border-border/50 shadow-sm h-full flex flex-col items-center justify-center min-h-[160px]">
        <Loader2 className="animate-spin w-6 h-6 text-primary/50" />
      </Card>
    )

  if (!importLog) return null

  const progress = importLog.total_records
    ? Math.min(100, Math.round((importLog.processed_records / importLog.total_records) * 100))
    : 0

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'processing':
        return { label: 'Processando', icon: Loader2, color: 'text-blue-500', isSpin: true }
      case 'success':
        return { label: 'Concluído', icon: CheckCircle2, color: 'text-green-500', isSpin: false }
      case 'partial_success':
        return {
          label: 'Concluído com Erros',
          icon: AlertCircle,
          color: 'text-yellow-500',
          isSpin: false,
        }
      case 'failed':
        return { label: 'Falhou', icon: AlertCircle, color: 'text-red-500', isSpin: false }
      default:
        return { label: status, icon: AlertCircle, color: 'text-muted-foreground', isSpin: false }
    }
  }

  const statusDisplay = getStatusDisplay(importLog.status)
  const StatusIcon = statusDisplay.icon

  return (
    <Card className="border-border/50 shadow-sm flex flex-col h-full animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileUp className="h-5 w-5 text-primary" />
          Status de Importação (Lote Atual)
        </CardTitle>
        <CardDescription>Acompanhamento de importação em massa na base</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 flex-1">
        <div className="flex justify-between items-start bg-muted/30 p-3 rounded-lg border border-border/50">
          <div>
            <p className="text-sm font-medium truncate max-w-[200px]" title={importLog.filename}>
              {importLog.filename}
            </p>
            <p className="text-xs mt-1 flex items-center gap-1.5 font-medium">
              <StatusIcon
                className={`w-3.5 h-3.5 ${statusDisplay.color} ${statusDisplay.isSpin ? 'animate-spin' : ''}`}
              />
              <span className={statusDisplay.color}>{statusDisplay.label}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">
              {importLog.processed_records} / {importLog.total_records}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              registros processados
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Progresso da Importação</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
        </div>

        {importLog.error_summary && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md border border-destructive/20 font-medium">
            <AlertCircle className="w-4 h-4 inline mr-1.5 align-text-bottom" />
            {importLog.error_summary}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
