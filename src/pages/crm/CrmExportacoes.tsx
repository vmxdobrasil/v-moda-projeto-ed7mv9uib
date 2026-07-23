import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getExports, downloadExportFile, type ExportRecord } from '@/services/exports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function CrmExportacoes() {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const loadExports = useCallback(async () => {
    try {
      const records = await getExports()
      setExports(records)
    } catch (err) {
      console.error('Failed to load exports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExports()
  }, [loadExports])

  useRealtime('exports', () => {
    loadExports()
  })

  const handleDownload = async (record: ExportRecord) => {
    setDownloadingId(record.id)
    try {
      await downloadExportFile(record)
    } catch {
      toast.error('Falha ao baixar arquivo.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Exportações</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Arquivos CSV de leads gerados para campanhas externas.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {exports.length} arquivo(s)
        </Badge>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Arquivos Exportados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma exportação encontrada. Gere uma exportação na página de Leads.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Parte</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exports.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[200px]">{exp.filename}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {exp.created ? format(new Date(exp.created), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {exp.part_number} / {exp.total_parts}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{exp.record_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(exp)}
                        disabled={downloadingId === exp.id}
                      >
                        {downloadingId === exp.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Baixar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
