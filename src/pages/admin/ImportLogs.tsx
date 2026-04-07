import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

interface ImportLog {
  id: string
  filename: string
  status: 'processing' | 'success' | 'partial_success' | 'failed'
  total_records: number
  processed_records: number
  error_summary: string
  created: string
  expand?: {
    user: any
  }
}

export default function AdminImportLogs() {
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await pb.collection('import_logs').getFullList<ImportLog>({
        sort: '-created',
        expand: 'user',
      })
      setLogs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('import_logs', () => {
    loadData()
  })

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando logs...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Logs de Importação</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Acompanhe o histórico e status de importações de dados do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registros (Proc./Total)</TableHead>
                  <TableHead>Resumo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">{log.filename}</TableCell>
                    <TableCell>
                      {log.expand?.user?.name || log.expand?.user?.email || 'Sistema'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === 'success'
                            ? 'default'
                            : log.status === 'failed'
                              ? 'destructive'
                              : log.status === 'partial_success'
                                ? 'secondary'
                                : 'outline'
                        }
                        className={
                          log.status === 'success'
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : log.status === 'partial_success'
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : ''
                        }
                      >
                        {log.status === 'processing' && 'Processando'}
                        {log.status === 'success' && 'Sucesso'}
                        {log.status === 'partial_success' && 'Parcial'}
                        {log.status === 'failed' && 'Falhou'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.processed_records || 0} / {log.total_records || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {log.error_summary || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum log de importação encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
