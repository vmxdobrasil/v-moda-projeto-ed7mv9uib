import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getExports, downloadExportFile, type ExportRecord } from '@/services/exports'
import { useCustomerExport } from '@/hooks/use-customer-export'
import { Link } from 'react-router-dom'
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
import {
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Database,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function CrmExportacoes() {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { exportLeads, isExporting } = useCustomerExport()

  const loadExports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const records = await getExports()
      setExports(records)
    } catch (err: any) {
      console.error('Failed to load exports:', err)
      setError('Não foi possível carregar o histórico de exportações.')
      toast.error('Erro ao carregar exportações.')
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
      toast.success(`Download iniciado: ${record.filename}`)
    } catch (err: any) {
      console.error('Download error:', err)
      toast.error('Falha ao baixar arquivo CSV.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-electric flex items-center justify-center cta-glow">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Exportações de Leads</h1>
              <p className="text-sm text-white/50">
                Histórico e download de arquivos CSV gerados para campanhas e integrações externas.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={loadExports}
            disabled={loading}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              toast.info('Iniciando exportação completa de leads...')
              const res = await exportLeads()
              if (res.success) {
                toast.success(
                  `Exportação concluída com sucesso! ${res.total_records?.toLocaleString('pt-BR') || ''} leads exportados.`,
                )
                await loadExports()
              } else if (res.error) {
                toast.error(res.error)
              }
            }}
            disabled={isExporting || loading}
            className="bg-electric hover:bg-electric/90 text-white shadow-glow"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar Todos os Leads (CSV)'}
          </Button>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Link to="/crm/leads">
              Filtrar na Base de Leads
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="crm-card p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-white">Falha ao carregar exportações</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto mt-1">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadExports}
            className="border-white/10 bg-white/5 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="crm-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-white font-display">
                Arquivos Exportados
              </h2>
            </div>
            <Badge variant="outline" className="border-white/10 text-white/70 bg-white/5">
              {exports.length} arquivo(s)
            </Badge>
          </div>

          <div className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/40 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Carregando histórico de exportações...</p>
              </div>
            ) : exports.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-white/30">
                  <Database className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-base font-semibold text-white">
                    Nenhuma exportação encontrada
                  </h3>
                  <p className="text-sm text-white/50">
                    Você ainda não gerou nenhuma exportação de leads. Acesse a lista de leads para
                    filtrar e exportar dados em formato CSV.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      toast.info('Iniciando exportação completa de leads...')
                      const res = await exportLeads()
                      if (res.success) {
                        toast.success(
                          `Exportação concluída com sucesso! ${res.total_records?.toLocaleString('pt-BR') || ''} leads exportados.`,
                        )
                        await loadExports()
                      } else if (res.error) {
                        toast.error(res.error)
                      }
                    }}
                    disabled={isExporting}
                    className="bg-electric hover:bg-electric/90 text-white shadow-glow"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isExporting ? 'Exportando...' : 'Exportar Todos os Leads (CSV)'}
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Link to="/crm/leads">
                      Ir para Leads
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60 font-display">Arquivo</TableHead>
                      <TableHead className="text-white/60 font-display">Data de Geração</TableHead>
                      <TableHead className="text-white/60 font-display">Parte / Lote</TableHead>
                      <TableHead className="text-white/60 font-display">
                        Total de Registros
                      </TableHead>
                      <TableHead className="text-right text-white/60 font-display">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exports.map((exp) => (
                      <TableRow
                        key={exp.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="font-medium text-white">
                          <span className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                            <span className="truncate max-w-[260px]">{exp.filename}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-white/70">
                          {exp.created ? format(new Date(exp.created), 'dd/MM/yyyy HH:mm:ss') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-white/10 text-white/70 bg-white/5"
                          >
                            {exp.part_number || 1} / {exp.total_parts || 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-white/90 font-medium">
                          {exp.record_count?.toLocaleString('pt-BR') ?? 0} leads
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(exp)}
                            disabled={downloadingId === exp.id}
                            className="border-white/10 bg-white/5 text-white hover:bg-primary hover:text-white hover:border-primary transition-all"
                          >
                            {downloadingId === exp.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            Baixar CSV
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
