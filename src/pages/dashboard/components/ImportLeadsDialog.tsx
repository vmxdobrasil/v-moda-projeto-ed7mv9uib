import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { useBulkImport } from '@/hooks/use-bulk-import'
import { UploadCloud, CheckCircle2, FileSpreadsheet, DownloadCloud } from 'lucide-react'

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
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [defaultSource, setDefaultSource] = useState<string>('whatsapp_group')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { progress, isImporting, stats, startImport } = useBulkImport()

  useEffect(() => {
    onImportStateChange(isImporting)
  }, [isImporting, onImportStateChange])

  const reset = () => {
    setStep(1)
    setHeaders([])
    setRows([])
    setMapping({})
    if (stats) onImportComplete()
    onOpenChange(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.name.endsWith('.xlsx')) {
      toast.warning(
        'Arquivo XLSX detectado. Recomendamos usar formato .csv se houver erros na leitura.',
      )
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
        if (n.includes('email') || n === 'e-mail') autoMap.email = h
        if (n.includes('cidade') || n === 'city') autoMap.city = h
        if (n === 'uf' || n === 'estado' || n === 'state') autoMap.state = h
        if (n.includes('categoria') || n.includes('ranking')) autoMap.ranking_category = h
        if (n.includes('zona') || n.includes('exclusividade')) autoMap.exclusivity_zone = h
      })
      setMapping(autoMap)
      setStep(2)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ler arquivo. Verifique se é um CSV válido.')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleStart = async () => {
    if (!mapping.phone) {
      toast.error('É obrigatório mapear a coluna de Telefone/WhatsApp.')
      return
    }

    const limit =
      subscription?.import_limit ??
      (subscription?.plan_tier === 'free' ? 50 : subscription?.plan_tier ? 10000 : 50)
    if (customerCount + rows.length > limit) {
      toast.error(
        `Você atingiu o limite de ${limit} leads para o plano ${subscription?.plan_tier || 'Free'}. Faça upgrade para importar mais.`,
      )
      return
    }

    setStep(3)
    await startImport(rows, mapping, defaultSource)
    setStep(4)
  }

  useEffect(() => {
    if (step === 4 && stats) {
      toast.success(
        `Importação concluída! ${stats.success} importados, ${stats.skipped} duplicados/ignorados, ${stats.error} erros.`,
      )
    }
  }, [step, stats])

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
    <Dialog open={open} onOpenChange={(v) => !isImporting && (v ? setStep(1) : reset())}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Importar Leads em Massa</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <DownloadCloud className="w-4 h-4 mr-2" />
                Baixar Template CSV
              </Button>
            </div>
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
              {renderMappingRow('caravan_name', 'Nome do Grupo / Caravana')}
              {renderMappingRow('email', 'E-mail')}
              {renderMappingRow('city', 'Cidade')}
              {renderMappingRow('state', 'Estado (UF)')}
              {renderMappingRow('ranking_category', 'Categoria de Ranking')}
              {renderMappingRow('exclusivity_zone', 'Zona de Exclusividade')}
            </div>
            <Button className="w-full mt-4" onClick={handleStart}>
              Iniciar Importação
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
            <p className="text-base font-medium">Processando importação... ({progress}%)</p>
            <Progress value={progress} className="w-full h-3" />
            <p className="text-sm text-muted-foreground">Por favor, não feche esta janela.</p>
          </div>
        )}

        {step === 4 && stats && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
              <h3 className="text-xl font-bold">Importação Concluída</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-700">{stats.success}</p>
                <p className="text-sm font-medium text-green-600 mt-1">Importados</p>
              </div>
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
                <h4 className="text-sm font-bold mb-2">Detalhes dos Erros (amostra):</h4>
                <div className="max-h-[120px] overflow-y-auto text-xs bg-muted p-3 rounded border">
                  <ul className="list-disc pl-4 space-y-1">
                    {stats.errorDetails.slice(0, 50).map((err, idx) => (
                      <li key={idx} className="text-red-600">
                        <span className="font-semibold text-foreground">Linha {err.row}:</span>{' '}
                        {err.reason}
                      </li>
                    ))}
                    {stats.errorDetails.length > 50 && (
                      <li className="text-muted-foreground mt-2">
                        ...e mais {stats.errorDetails.length - 50} erros.
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
