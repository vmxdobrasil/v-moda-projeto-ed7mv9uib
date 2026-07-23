import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AlertTriangle, Info } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { parseCSV } from '@/lib/csv-parser'
import useImportStore from '@/stores/use-import-store'
import { analyzeDuplicates, checkReimport, normalizePhoneBR } from '@/services/import-tools'
import { UploadCloud, CheckCircle2, FileSpreadsheet, DownloadCloud, Loader2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

export default function ImportLeadsDialog({
  open,
  onOpenChange,
  onImportStateChange,
  onImportComplete,
  subscription,
  customerCount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportStateChange: (state: boolean) => void
  onImportComplete: () => void
  subscription: any
  customerCount: number
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [defaultSource, setDefaultSource] = useState('whatsapp_group')
  const [filename, setFilename] = useState('importacao_leads.csv')
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<any>(null)
  const [duplicateAction, setDuplicateAction] = useState('ignore')
  const [isReimport, setIsReimport] = useState(false)
  const [reimportInfo, setReimportInfo] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    progress,
    processedCount,
    totalCount,
    isImporting,
    stats,
    startImport,
    reset: resetStore,
  } = useImportStore()

  useEffect(() => {
    onImportStateChange(isImporting)
    if (isImporting && open) setStep(4)
    if (stats && open) setStep(5)
  }, [isImporting, stats, open, onImportStateChange])

  const reset = () => {
    if (!isImporting) {
      setStep(1)
      setHeaders([])
      setRows([])
      setMapping({})
      setDuplicateAnalysis(null)
      setDuplicateAction('ignore')
      setIsReimport(false)
      setReimportInfo(null)
      setFilename('importacao_leads.csv')
    }
    if (stats) {
      onImportComplete()
      resetStore()
    }
    onOpenChange(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFilename(selected.name)
    try {
      const reimportResult = await checkReimport(selected.name)
      setIsReimport(reimportResult.isReimport)
      setReimportInfo(reimportResult.previousImport || null)
    } catch {
      setIsReimport(false)
    }
    if (selected.name.endsWith('.xlsx')) {
      toast.warning('Arquivo XLSX detectado. Recomendamos usar formato .csv.')
    }
    try {
      const data = await parseCSV(selected)
      setHeaders(data.headers)
      setRows(data.rows)
      const autoMap: Record<string, string> = {}
      const norm = (s: string) => s.toLowerCase().trim()
      data.headers.forEach((h) => {
        const n = norm(h)
        if (n.includes('nome') || n === 'name') autoMap.name = h
        if (
          n.includes('telefone') ||
          n.includes('celular') ||
          n === 'phone' ||
          n.includes('whatsapp') ||
          n.includes('wpp')
        )
          autoMap.phone = h
        if (n.includes('grupo') || n.includes('caravana') || n.includes('group'))
          autoMap.caravan_name = h
        if (n.includes('origem') || n.includes('loja') || n.includes('store'))
          autoMap.origin_store_name = h
        if (n.includes('email') || n === 'e-mail') autoMap.email = h
        if (n.includes('cidade') || n === 'city') autoMap.city = h
        if (n === 'uf' || n === 'estado' || n === 'state') autoMap.state = h
        if (n.includes('categoria') || n.includes('ranking')) autoMap.ranking_category = h
        if (n.includes('zona') || n.includes('exclusividade')) autoMap.exclusivity_zone = h
        if (n.includes('obs') || n.includes('nota') || n.includes('note')) autoMap.notes = h
        if (n === 'ddd' || n.includes('ddd')) autoMap.ddd = h
        if (n === 'status' || n.includes('status')) autoMap.status = h
        if (n.includes('tag') || n.includes('etiqueta')) autoMap.tags = h
      })
      setMapping(autoMap)
      setStep(2)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ler arquivo.')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAnalyze = async () => {
    if (!mapping.phone) {
      toast.error('É obrigatório mapear a coluna de Telefone/WhatsApp.')
      return
    }
    const isAdmin =
      pb.authStore.record?.email === 'valterpmendonca@gmail.com' ||
      pb.authStore.record?.role === 'admin' ||
      pb.authStore.record?.role === 'manufacturer'
    const limit = isAdmin
      ? Infinity
      : (subscription?.import_limit ??
        (subscription?.plan_tier === 'free' ? 50 : subscription?.plan_tier ? 10000 : 50))
    if (customerCount + rows.length > limit && limit !== Infinity) {
      toast.error(
        `Limite Excedido: Você atingiu o limite de ${limit} leads para o plano ${subscription?.plan_tier || 'Free'}.`,
      )
      return
    }
    setAnalyzing(true)
    try {
      const phones = rows
        .map((row) => {
          const colName = mapping.phone
          if (!colName) return ''
          return normalizePhoneBR(String(row[colName] || ''))
        })
        .filter(Boolean)
      const analysis = await analyzeDuplicates(phones)
      setDuplicateAnalysis(analysis)
      if (isReimport) setDuplicateAction('ignore')
      setStep(3)
    } catch {
      toast.error('Erro ao analisar duplicatas. Tente novamente.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleConfirmImport = async () => {
    setStep(4)
    await startImport(
      rows,
      mapping,
      defaultSource,
      filename,
      isReimport ? 'ignore' : duplicateAction,
    )
    setStep(5)
  }

  useEffect(() => {
    if (step === 5 && stats) {
      const msg = isReimport
        ? `Importação concluída: ${stats.success} novos registros adicionados, ${stats.skipped} duplicatas ignoradas.`
        : `Importação concluída! ${stats.success} importados, ${stats.updated} atualizados, ${stats.skipped} duplicados/ignorados, ${stats.error} erros.`
      toast.success(msg)
    }
  }, [step, stats, isReimport])

  const renderMappingRow = (field: string, label: string, required = false) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
      <Label className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={mapping[field] || ''}
        onValueChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecionar coluna..." />
        </SelectTrigger>
        <SelectContent>
          {headers.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const downloadTemplate = () => {
    const csv =
      'Nome,Telefone,Email,Origem\nJoão Silva,11999999999,joao@email.com,manual\nMaria Souza,11888888888,maria@email.com,whatsapp_group'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'modelo_importacao_leads.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setStep(isImporting ? 4 : stats ? 5 : 1) : reset())}
    >
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Importar Leads em Massa</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <DownloadCloud className="w-4 h-4 mr-2" /> Baixar Template CSV
              </Button>
            </div>
            {isReimport && reimportInfo && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">
                    Este arquivo já foi importado anteriormente.
                  </p>
                  <p className="text-amber-700 mt-1">
                    Duplicatas serão automaticamente ignoradas e apenas novos registros serão
                    adicionados.
                  </p>
                </div>
              </div>
            )}
            <div
              className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-base font-medium">Clique para selecionar ou arraste o arquivo</p>
              <p className="text-sm text-muted-foreground mt-1">Suporta .csv e .xlsx</p>
              <input
                type="file"
                className="hidden"
                accept=".csv, .xlsx"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {isReimport && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <Info className="w-4 h-4" /> Reimportação detectada — duplicatas serão ignoradas
                automaticamente.
              </div>
            )}
            <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 bg-muted p-2 rounded">
              <FileSpreadsheet className="w-4 h-4" /> {rows.length} registros encontrados. Mapeie as
              colunas:
            </div>
            {rows.length > 0 && (
              <div className="border rounded-md overflow-x-auto mb-4 max-h-[150px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h) => (
                        <TableHead key={h} className="whitespace-nowrap text-xs">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 3).map((row, i) => (
                      <TableRow key={i}>
                        {headers.map((h) => (
                          <TableCell
                            key={h}
                            className="whitespace-nowrap truncate max-w-[150px] text-xs"
                          >
                            {row[h]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card">
              <Label className="font-medium text-primary">Origem Padrão dos Leads</Label>
              <Select value={defaultSource} onValueChange={setDefaultSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp_group">Grupo de WhatsApp</SelectItem>
                  <SelectItem value="manual">Importação Manual</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Individual</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="site">Site / Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 mt-4">
              {renderMappingRow('phone', 'WhatsApp / Telefone', true)}
              {renderMappingRow('name', 'Nome do Lead')}
              {renderMappingRow('origin_store_name', 'Loja de Origem (Extração)')}
              {renderMappingRow('caravan_name', 'Nome do Grupo / Caravana')}
              {renderMappingRow('email', 'E-mail')}
              {renderMappingRow('city', 'Cidade')}
              {renderMappingRow('state', 'Estado (UF)')}
              {renderMappingRow('ranking_category', 'Categoria de Ranking')}
              {renderMappingRow('exclusivity_zone', 'Zona de Exclusividade')}
              {renderMappingRow('notes', 'Observações / Notas')}
              {renderMappingRow('ddd', 'DDD')}
              {renderMappingRow('status', 'Status do Lead')}
              {renderMappingRow('tags', 'Tags (separadas por vírgula)')}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button className="w-full" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {analyzing ? 'Analisando...' : 'Avançar'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && duplicateAnalysis && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h3 className="text-lg font-bold">Análise de Duplicatas</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Revise os dados antes de confirmar a importação
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-700">{duplicateAnalysis.total}</p>
                <p className="text-sm font-medium text-blue-600 mt-1">Total no Arquivo</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-700">{duplicateAnalysis.newRecords}</p>
                <p className="text-sm font-medium text-green-600 mt-1">Novos Registros</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-yellow-700">{duplicateAnalysis.duplicates}</p>
                <p className="text-sm font-medium text-yellow-600 mt-1">Duplicatas</p>
              </div>
            </div>
            {isReimport ? (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Este arquivo já foi importado antes. As duplicatas serão automaticamente ignoradas
                  e apenas novos registros serão adicionados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="font-medium">Como tratar duplicatas?</Label>
                <RadioGroup
                  value={duplicateAction}
                  onValueChange={setDuplicateAction}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-card">
                    <RadioGroupItem value="ignore" id="ignore" />
                    <Label htmlFor="ignore" className="cursor-pointer">
                      <span className="font-medium">Ignorar duplicatas</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pula registros com telefone já existente (padrão)
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg bg-card">
                    <RadioGroupItem value="overwrite" id="overwrite" />
                    <Label htmlFor="overwrite" className="cursor-pointer">
                      <span className="font-medium">Sobrescrever existentes</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Atualiza registros existentes com os novos dados
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button className="w-full" onClick={handleConfirmImport}>
                Confirmar Importação
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <p className="text-base font-medium">Processando importação... ({progress}%)</p>
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm font-medium text-primary">
              {processedCount} / {totalCount} registros processados
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Você pode fechar esta janela e continuar usando o sistema.
              <br />A importação continuará em segundo plano.
            </p>
            <Button variant="outline" className="mt-2" onClick={() => onOpenChange(false)}>
              Minimizar para o fundo
            </Button>
          </div>
        )}

        {step === 5 && stats && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-4 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
              <h3 className="text-xl font-bold">Importação Concluída</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {totalCount} | Novos: {stats.success} | Atualizados: {stats.updated} |
                Ignorados: {stats.skipped} | Erros: {stats.error}
              </p>
            </div>
            <div className={`grid grid-cols-${stats.updated > 0 ? '4' : '3'} gap-4 text-center`}>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-700">{stats.success}</p>
                <p className="text-sm font-medium text-green-600 mt-1">Importados</p>
              </div>
              {stats.updated > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-700">{stats.updated}</p>
                  <p className="text-sm font-medium text-indigo-600 mt-1">Atualizados</p>
                </div>
              )}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-yellow-700">{stats.skipped}</p>
                <p className="text-sm font-medium text-yellow-600 mt-1">Duplicados</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-red-700">{stats.error}</p>
                <p className="text-sm font-medium text-red-600 mt-1">Erros</p>
              </div>
            </div>
            {stats.errorDetails && stats.errorDetails.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-bold mb-2 text-red-600">Detalhes dos Erros:</h4>
                <div className="max-h-[180px] overflow-y-auto text-xs bg-red-50 p-3 rounded border border-red-100">
                  <ul className="list-disc pl-4 space-y-1">
                    {stats.errorDetails.slice(0, 100).map((err, idx) => (
                      <li key={idx} className="text-red-700">
                        <span className="font-semibold text-foreground">Linha {err.row}:</span>{' '}
                        {err.reason}
                        {err.phone && ` (Tel: ${err.phone})`}
                      </li>
                    ))}
                    {stats.errorDetails.length > 100 && (
                      <li className="text-red-500 font-medium mt-2">
                        ...e mais {stats.errorDetails.length - 100} erros.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            <Button className="w-full mt-4" variant="outline" onClick={reset}>
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
