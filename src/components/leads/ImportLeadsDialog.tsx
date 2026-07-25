import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { parseCSV } from '@/lib/csv-parser'
import { UploadCloud, Loader2, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import type { LeadCollection } from '@/services/unified-leads'

const COLLECTION_OPTIONS = [
  { value: 'leads_fabricantes', label: 'Fabricantes' },
  { value: 'leads_retailers', label: 'Retailers' },
  { value: 'leads_venda', label: 'Vendas' },
]

export function ImportLeadsDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onImported?: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [collection, setCollection] = useState<LeadCollection>('leads_fabricantes')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [duplicateAction, setDuplicateAction] = useState('ignore')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep(1)
    setHeaders([])
    setRows([])
    setMapping({})
    setResult(null)
    onOpenChange(false)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await parseCSV(file)
      setHeaders(data.headers)
      setRows(data.rows)
      const auto: Record<string, string> = {}
      data.headers.forEach((h) => {
        const n = h.toLowerCase().trim()
        if (n.includes('nome') || n === 'name') auto.name = h
        if (n.includes('whatsapp') || n.includes('telefone') || n === 'phone') auto.phone = h
        if (n.includes('email') || n === 'e-mail') auto.email = h
        if (n.includes('categoria') || n.includes('category')) auto.category = h
        if (n.includes('cidade') || n === 'city') auto.city = h
        if (n === 'uf' || n === 'estado') auto.state = h
        if (n.includes('cnpj')) auto.cnpj = h
        if (n.includes('contato') || n.includes('contact')) auto.contact_name = h
        if (n.includes('loja') || n.includes('store')) auto.store_name = h
        if (n.includes('mensagem') || n.includes('message')) auto.message = h
        if (n.includes('origem') || n.includes('source')) auto.utm_source = h
        if (n.includes('nota') || n.includes('note')) auto.notes = h
      })
      setMapping(auto)
      setStep(2)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ler arquivo')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleImport = async () => {
    setStep(3)
    setLoading(true)
    try {
      const records = rows.map((row) => {
        const obj: Record<string, any> = {}
        Object.entries(mapping).forEach(([field, col]) => {
          if (col) obj[field] = row[col] || ''
        })
        return obj
      })
      const res = await pb.send('/backend/v1/leads/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ collection, records, duplicate_action: duplicateAction }),
        headers: { 'Content-Type': 'application/json' },
      })
      setResult(res)
      toast.success('Importação concluída!')
      onImported?.()
    } catch (err: any) {
      toast.error('Erro na importação: ' + (err?.message || ''))
      setResult({ error: err?.message || 'Erro desconhecido' })
    } finally {
      setLoading(false)
    }
  }

  const renderMapping = (field: string, label: string, required = false) => (
    <div key={field} className="flex items-center justify-between p-2 border rounded-lg">
      <Label className="text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={mapping[field] || ''}
        onValueChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Coluna..." />
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

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setStep(result ? 3 : 1) : reset())}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Leads</DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Coleção de Destino</Label>
              <Select value={collection} onValueChange={(v) => setCollection(v as LeadCollection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLLECTION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className="flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
              onClick={() => fileRef.current?.click()}
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="font-medium">Selecione um arquivo CSV</p>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                ref={fileRef}
                onChange={handleFile}
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {rows.length} registros. Mapeie as colunas:
            </p>
            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {collection === 'leads_fabricantes' && (
                <>
                  {renderMapping('name', 'Nome', true)}
                  {renderMapping('category', 'Categoria', true)}
                  {renderMapping('phone', 'WhatsApp', true)}
                  {renderMapping('email', 'Email')}
                  {renderMapping('utm_source', 'Origem')}
                  {renderMapping('notes', 'Notas')}
                </>
              )}
              {collection === 'leads_retailers' && (
                <>
                  {renderMapping('store_name', 'Loja', true)}
                  {renderMapping('contact_name', 'Contato', true)}
                  {renderMapping('phone', 'Telefone', true)}
                  {renderMapping('cnpj', 'CNPJ')}
                  {renderMapping('email', 'Email')}
                  {renderMapping('city', 'Cidade')}
                  {renderMapping('state', 'Estado')}
                  {renderMapping('notes', 'Notas')}
                </>
              )}
              {collection === 'leads_venda' && (
                <>
                  {renderMapping('message', 'Mensagem')}
                  {renderMapping('notes', 'Notas')}
                </>
              )}
            </div>
            <div className="space-y-2">
              <Label>Duplicatas:</Label>
              <RadioGroup
                value={duplicateAction}
                onValueChange={setDuplicateAction}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ignore" id="ig" />
                  <Label htmlFor="ig">Ignorar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwrite" id="ow" />
                  <Label htmlFor="ow">Sobrescrever</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button className="flex-1" onClick={handleImport}>
                Importar
              </Button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4 py-4">
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Importando...</p>
              </div>
            ) : result?.error ? (
              <p className="text-destructive text-center">{result.error}</p>
            ) : result ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-2xl font-bold text-green-700">{result.success}</p>
                    <p className="text-xs">Novos</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-2xl font-bold text-yellow-700">{result.skipped}</p>
                    <p className="text-xs">Ignorados</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                    <p className="text-xs">Atualizados</p>
                  </div>
                </div>
                {result.error > 0 && <p className="text-sm text-red-600">{result.error} erros</p>}
              </div>
            ) : null}
            {!loading && (
              <Button className="w-full" variant="outline" onClick={reset}>
                Fechar
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
