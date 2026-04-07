import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react'

export default function ImportHistoryTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const loadLogs = async () => {
    try {
      if (!pb.authStore.record?.id) return
      const res = await pb.collection('import_logs').getList(1, 50, {
        sort: '-created',
        filter: `user = "${pb.authStore.record.id}"`,
      })
      setLogs(res.items)
    } catch (err) {
      console.error('Failed to load import logs', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  useRealtime('import_logs', () => {
    loadLogs()
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>
      case 'partial_success':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Sucesso Parcial</Badge>
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Falha</Badge>
      case 'processing':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processando
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Carregando histórico...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  Nenhum histórico de importação encontrado.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-sm">
                    {new Date(log.created).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                      {log.filename}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium">{log.processed_records || 0}</span> /{' '}
                    {log.total_records || 0} registros
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!log.error_details || log.error_details.length === 0}
                      onClick={() => setSelectedLog(log)}
                      className={
                        log.error_details?.length > 0
                          ? 'text-red-600 border-red-200 hover:bg-red-50'
                          : ''
                      }
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Ver Erros
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes dos Erros da Importação</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 mt-4">
            {selectedLog?.error_summary && (
              <p className="text-sm font-medium text-red-600 mb-4 p-3 bg-red-50 rounded-md border border-red-100">
                {selectedLog.error_summary}
              </p>
            )}

            {selectedLog?.error_details && Array.isArray(selectedLog.error_details) ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground/80">Linhas com problema:</h4>
                <ul className="text-sm space-y-2">
                  {selectedLog.error_details.map((err: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-2.5 border rounded-md bg-muted/20"
                    >
                      <Badge variant="outline" className="w-fit">
                        Linha {err.row}
                      </Badge>
                      <span className="text-muted-foreground">{err.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum detalhe específico disponível.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
