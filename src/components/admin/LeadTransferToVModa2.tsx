import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { startBackgroundOperation, endBackgroundOperation } from '@/lib/background-operations'
import { getBrandSettingByKey, saveBrandSettingValue } from '@/services/brandSettings'
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Download,
  FileSpreadsheet,
  Globe,
  Radio,
  Save,
  RotateCcw,
  Check,
  XCircle,
  Info,
} from 'lucide-react'

// Fallback padrão de referência para o projeto destino
const DEFAULT_TARGET_URL = [
  'https://',
  'v-moda-brasil-d7c0f',
  '.goskip.app',
  '/backend/v1/n8n-webhook',
].join('')
const SETTING_KEY = 'migration_target_webhook_url'

interface TransferSummary {
  success: boolean
  message?: string
  total: number
  processed?: number
  batches_sent: number
  total_batches: number
  created: number
  updated: number
  skipped: number
  failed: number
  errors: string[]
}

export function LeadTransferToVModa2() {
  const [loading, setLoading] = useState(false)
  const [downloadingCsv, setDownloadingCsv] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [savingUrl, setSavingUrl] = useState(false)
  const [targetUrl, setTargetUrl] = useState<string>(DEFAULT_TARGET_URL)
  const [savedTargetUrl, setSavedTargetUrl] = useState<string>(DEFAULT_TARGET_URL)
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean
    statusCode: number
    message: string
    tip?: string
    timestamp: string
  } | null>(null)
  const [result, setResult] = useState<TransferSummary | null>(null)
  const [csvDownloadSummary, setCsvDownloadSummary] = useState<{
    filename: string
    totalRecords: number
  } | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const { toast } = useToast()

  // Carrega URL salva no banco ao abrir a tela
  useEffect(() => {
    let isMounted = true
    const loadSavedUrl = async () => {
      try {
        const record = await getBrandSettingByKey(SETTING_KEY)
        if (isMounted && record?.value_text?.trim()) {
          const val = record.value_text.trim()
          setTargetUrl(val)
          setSavedTargetUrl(val)
        }
      } catch (err) {
        console.warn('Não foi possível carregar a URL salva da migração:', err)
      }
    }
    loadSavedUrl()
    return () => {
      isMounted = false
    }
  }, [])

  // Validação da URL
  const cleanUrl = targetUrl.trim()
  const isUrlEmpty = !cleanUrl
  const hasHttps = cleanUrl.startsWith('https://')
  const hasExpectedSuffix = cleanUrl.endsWith('/backend/v1/n8n-webhook')
  const isMalformed = !isUrlEmpty && (!hasHttps || !hasExpectedSuffix)

  // Mensagens de alerta de validação
  let validationWarning = ''
  if (!isUrlEmpty) {
    if (!hasHttps) {
      validationWarning =
        'Aviso: A URL deve iniciar com "https://". Endereços inseguros (http) ou sem protocolo não funcionarão.'
    } else if (!hasExpectedSuffix) {
      validationWarning =
        'Aviso: A URL deve terminar exatamente com "/backend/v1/n8n-webhook". Verifique se o caminho completo da rota foi informado.'
    }
  }

  const handleSaveUrl = async () => {
    const urlToSave = cleanUrl || DEFAULT_TARGET_URL
    setSavingUrl(true)
    try {
      await saveBrandSettingValue(SETTING_KEY, urlToSave, 'URL Webhook de Migração V MODA 2')
      setTargetUrl(urlToSave)
      setSavedTargetUrl(urlToSave)
      toast({
        title: 'URL salva com sucesso!',
        description:
          'A URL do webhook de destino foi gravada no banco e será usada nas próximas transferências.',
      })
    } catch (err: any) {
      console.error('Erro ao salvar URL de migração:', err)
      toast({
        title: 'Erro ao salvar URL',
        description: err?.message || 'Falha ao persistir no banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setSavingUrl(false)
    }
  }

  const handleResetDefaultUrl = () => {
    setTargetUrl(DEFAULT_TARGET_URL)
  }

  const handleTestConnection = async () => {
    const urlToTest = cleanUrl || DEFAULT_TARGET_URL
    setTestingConnection(true)
    setConnectionTestResult(null)

    try {
      const response: {
        success: boolean
        statusCode: number
        message: string
        tip?: string
        targetUrl?: string
      } = await pb.send('/backend/v1/test-target-webhook', {
        method: 'POST',
        body: {
          target_url: urlToTest,
        },
      })

      const now = new Date().toLocaleTimeString('pt-BR')
      setConnectionTestResult({
        success: response.success,
        statusCode: response.statusCode,
        message: response.message,
        tip: response.tip,
        timestamp: now,
      })

      if (response.success) {
        toast({
          title: '✅ Webhook respondendo!',
          description: `Status HTTP ${response.statusCode}: conexão com ${urlToTest} estabelecida com sucesso.`,
        })
      } else {
        toast({
          title: `❌ Status ${response.statusCode}`,
          description: response.message,
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 0
      const errorMsg =
        err?.data?.message || err?.message || 'Não foi possível alcançar o servidor de destino.'
      const now = new Date().toLocaleTimeString('pt-BR')

      let tip = ''
      if (status === 405 || status === 404) {
        tip =
          'Rota não encontrada no destino. Verifique se a URL é a de PRODUÇÃO do V MODA BRASIL 2 (não a de preview) e se termina em /backend/v1/n8n-webhook'
      }

      setConnectionTestResult({
        success: false,
        statusCode: status,
        message: `Status ${status || 'Erro'} — ${errorMsg}`,
        tip,
        timestamp: now,
      })

      toast({
        title: `❌ Falha no teste de conexão (${status || 'Erro'})`,
        description: tip ? `${errorMsg}. ${tip}` : errorMsg,
        variant: 'destructive',
      })
    } finally {
      setTestingConnection(false)
    }
  }

  const handleDownloadCsv = async () => {
    if (downloadingCsv || loading) return

    setDownloadingCsv(true)
    startBackgroundOperation()

    try {
      const response: {
        csvChunk?: string
        totalRecords?: number
      } = await pb.send('/backend/v1/export-customers-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token || '',
        },
        body: {},
      })

      const rawCsv = response?.csvChunk || ''
      const totalRecords = response?.totalRecords || 0

      if (!rawCsv && totalRecords === 0) {
        toast({
          title: 'Nenhum lead encontrado',
          description: 'A consulta não retornou registros de clientes.',
          variant: 'destructive',
        })
        return
      }

      // Garante o cabeçalho CSV padrão conforme especificação
      const header = 'name,phone,whatsapp_group_name,city,state,source,status,created\n'
      const csvContent = rawCsv.startsWith('name,phone') ? rawCsv : header + rawCsv

      const today = new Date().toISOString().split('T')[0]
      const filename = `leads_vmoda_${today}.csv`

      // Converte em Blob e dispara o download imediato
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 2000)

      setCsvDownloadSummary({
        filename,
        totalRecords,
      })

      toast({
        title: 'Download Concluído!',
        description: `CSV gerado com sucesso contendo ${totalRecords.toLocaleString('pt-BR')} leads (${filename}).`,
      })
    } catch (err: any) {
      console.error('Erro ao baixar CSV de leads:', err)
      const errorMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        'Falha ao gerar o arquivo CSV de leads. Verifique a conexão.'
      toast({
        title: 'Erro ao gerar CSV',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      endBackgroundOperation()
      setDownloadingCsv(false)
    }
  }

  const handleTransfer = async () => {
    if (loading) return

    setLoading(true)
    setResult(null)
    setStatusMessage('Iniciando comunicação com o backend e lendo base de clientes com telefone...')

    try {
      setStatusMessage(
        'Enviando lotes diretamente para "V MODA BRASIL 2"... Aguarde, processando os leads em lotes.',
      )

      startBackgroundOperation()
      const effectiveUrl = cleanUrl || savedTargetUrl || DEFAULT_TARGET_URL

      const response: TransferSummary = await pb.send('/backend/v1/transfer-to-v-moda-2', {
        method: 'POST',
        body: {
          target_url: effectiveUrl,
          batch_size: 500,
        },
      })

      setResult(response)
      setStatusMessage('Transferência concluída!')

      const totalEffectivelySent = (response.created || 0) + (response.updated || 0)

      if (response.batches_sent > 0 && response.failed === 0) {
        toast({
          title: 'Transferência Concluída com Sucesso!',
          description: `${totalEffectivelySent > 0 ? totalEffectivelySent.toLocaleString('pt-BR') : (response.processed || response.total).toLocaleString('pt-BR')} leads enviados (${(response.created || 0).toLocaleString('pt-BR')} novos, ${(response.updated || 0).toLocaleString('pt-BR')} atualizados) em ${response.batches_sent} lotes para o V MODA BRASIL 2.`,
        })
      } else if (response.batches_sent > 0 && response.failed > 0) {
        toast({
          title: 'Transferência concluída com avisos',
          description: `${totalEffectivelySent.toLocaleString('pt-BR')} leads enviados com sucesso em ${response.batches_sent} lotes, mas ${response.failed.toLocaleString('pt-BR')} falharam.`,
          variant: 'destructive',
        })
      } else {
        // batches_sent === 0 ou nenhum lote enviado
        const errorDetail =
          response.errors && response.errors.length > 0
            ? response.errors[0]
            : response.total === 0
              ? 'Nenhum lead com telefone foi encontrado na base para transferir.'
              : 'Nenhum lote pôde ser enviado para o servidor de destino. Verifique os logs e a conexão.'

        toast({
          title: 'Aviso: Nenhum lote enviado',
          description: errorDetail,
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      console.error('Erro na transferência:', err)
      const errorMsg =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        'Falha ao processar transferência. Verifique os logs.'
      setStatusMessage('Erro na transferência: ' + errorMsg)
      toast({
        title: 'Falha na Transferência',
        description: errorMsg,
        variant: 'destructive',
      })
    } finally {
      endBackgroundOperation()
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-soft">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="border-primary/30 text-primary bg-primary/10 gap-1.5 py-1 px-3"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Transferência Direta entre Projetos
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Database className="w-3 h-3" />
                Interno Skip Cloud
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold font-display text-navy dark:text-white flex items-center gap-2 mt-2">
              Migração Automática de Leads para o V MODA BRASIL 2
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Transfere todos os <strong>~30.771 clientes com telefone</strong> diretamente para o
              banco de dados do novo projeto em lotes otimizados de ~500 leads (sem necessidade de
              CSV manual).
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleDownloadCsv}
              disabled={downloadingCsv || loading}
              className="font-semibold border-primary/40 bg-background hover:bg-primary/10 hover:text-primary transition-all text-foreground min-w-[200px] h-12 shadow-sm"
            >
              {downloadingCsv ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin text-primary" />
                  Gerando CSV...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2 text-primary" />
                  Baixar CSV (Leads)
                </>
              )}
            </Button>

            <Button
              size="lg"
              onClick={handleTransfer}
              disabled={loading || downloadingCsv}
              className="font-semibold shadow-md bg-gradient-to-r from-primary to-electric hover:opacity-90 transition-all text-white min-w-[220px] h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Transferindo Leads...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Transferir para V MODA 2
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Configuração Editável da URL de Destino */}
        <div className="p-4 rounded-xl border border-primary/25 bg-background shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <Label htmlFor="webhook-target-url" className="text-sm font-semibold text-foreground">
                URL do Webhook de Destino (V MODA BRASIL 2)
              </Label>
              {cleanUrl === savedTargetUrl && (
                <Badge
                  variant="outline"
                  className="text-[11px] text-emerald border-emerald/30 bg-emerald/5 gap-1 py-0 h-5"
                >
                  <Check className="w-3 h-3" /> Salva no banco
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {cleanUrl !== DEFAULT_TARGET_URL && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDefaultUrl}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar padrão
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Input
                id="webhook-target-url"
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://www.seudominio-vmoda2.com.br/backend/v1/n8n-webhook"
                className={`font-mono text-xs sm:text-sm h-10 ${
                  isMalformed ? 'border-amber-500 focus-visible:ring-amber-500' : ''
                }`}
                disabled={loading || testingConnection}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testingConnection || loading}
                className="h-10 px-3.5 font-medium border-primary/30 hover:bg-primary/10 gap-1.5"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-primary" />
                    Testar Conexão
                  </>
                )}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSaveUrl}
                disabled={savingUrl || loading || testingConnection || cleanUrl === savedTargetUrl}
                className="h-10 px-3.5 font-medium bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-sm"
              >
                {savingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar URL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dica e Validação Inline */}
          {validationWarning ? (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{validationWarning}</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Importante: a URL deve apontar para o domínio de <strong>PRODUÇÃO</strong> do
                  destino (ex:{' '}
                  <code>https://www.&lt;dominio-destino&gt;/backend/v1/n8n-webhook</code>), pois o
                  preview não possui a rota ativada.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Cole a URL de produção do projeto destino. Padrão:{' '}
                <code>https://&lt;dominio-destino&gt;/backend/v1/n8n-webhook</code>
              </span>
            </div>
          )}

          {/* Resultado do Teste de Conexão */}
          {connectionTestResult && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                connectionTestResult.success
                  ? 'bg-emerald/10 border-emerald/30 text-emerald-950 dark:text-emerald-200'
                  : 'bg-destructive/10 border-destructive/30 text-destructive dark:text-destructive-foreground'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {connectionTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  {connectionTestResult.success
                    ? '✅ Webhook respondendo'
                    : `❌ Status ${connectionTestResult.statusCode || 'Falha'} — ${
                        connectionTestResult.statusCode === 405
                          ? 'rota não encontrada neste endereço (HTTP 405)'
                          : connectionTestResult.statusCode === 404
                            ? 'rota não encontrada (HTTP 404)'
                            : 'falha de comunicação'
                      }`}
                </span>
                <span className="font-mono text-[10px] opacity-75">
                  Testado às {connectionTestResult.timestamp}
                </span>
              </div>

              <p className="text-xs leading-relaxed opacity-90">{connectionTestResult.message}</p>

              {connectionTestResult.tip && (
                <div className="pt-1 mt-1 border-t border-current/20 font-medium">
                  💡 {connectionTestResult.tip}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Banner Explicativo */}
        <div className="grid md:grid-cols-3 gap-4 text-sm bg-muted/40 p-4 rounded-xl border border-border/60">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Origem (Este Projeto)</p>
              <p className="text-muted-foreground text-xs">
                Coleção <code className="text-xs bg-background px-1 py-0.5 rounded">customers</code>{' '}
                filtrando registros com telefone válido (ignora registros sem contato).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-electric shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Divisão em Lotes</p>
              <p className="text-muted-foreground text-xs">
                Envio sequencial em blocos de 500 leads via paginação por OFFSET direta e tolerância
                a falhas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center text-emerald shrink-0 mt-0.5">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Destino (V MODA 2)</p>
              <p className="text-muted-foreground text-xs">
                Webhook configurado na URL acima (UPSERT com deduplicação por telefone).
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Carregamento Ativo da Transferência */}
        {loading && (
          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                {statusMessage}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Processando no backend...
              </span>
            </div>
            <Progress value={undefined} className="h-2 w-full bg-primary/20 overflow-hidden" />
          </div>
        )}

        {/* Estado de Carregamento Ativo do Download CSV */}
        {downloadingCsv && (
          <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2 text-primary">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Gerando arquivo CSV completo com toda a base de clientes...
              </span>
              <span className="text-xs text-muted-foreground font-mono">Aguarde o download...</span>
            </div>
            <Progress value={undefined} className="h-2 w-full bg-primary/20 overflow-hidden" />
          </div>
        )}

        {/* Feedback de Download CSV Concluído */}
        {csvDownloadSummary && !downloadingCsv && (
          <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald/20 flex items-center justify-center text-emerald shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                  CSV baixado com sucesso!
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Arquivo: <code className="font-mono">{csvDownloadSummary.filename}</code> • Total
                  de <strong>{csvDownloadSummary.totalRecords.toLocaleString('pt-BR')}</strong>{' '}
                  leads exportados para importação manual no V MODA BRASIL 2.
                </p>
              </div>
            </div>
            <Badge className="bg-emerald text-white hover:bg-emerald/90 self-start sm:self-center shrink-0">
              {csvDownloadSummary.totalRecords.toLocaleString('pt-BR')} registros
            </Badge>
          </div>
        )}

        {/* Resultados da Transferência */}
        {result && (
          <div className="space-y-4 rounded-xl border p-5 bg-background shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-lg flex items-center gap-2">
                {result.batches_sent > 0 && result.failed === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                Resultado da Transferência
              </h4>
              <Badge
                variant={result.batches_sent > 0 && result.failed === 0 ? 'default' : 'outline'}
                className={
                  result.batches_sent > 0 && result.failed === 0
                    ? 'bg-emerald text-white'
                    : result.batches_sent === 0
                      ? 'text-destructive border-destructive'
                      : 'text-amber-500 border-amber-500'
                }
              >
                {result.batches_sent > 0 && result.failed === 0
                  ? '100% Sucesso'
                  : result.batches_sent === 0
                    ? '0 lotes enviados'
                    : `${result.failed} falhas`}
              </Badge>
            </div>

            {/* Progresso de Lotes Concluídos */}
            <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Progresso dos Lotes:</span>
                <span className="font-semibold text-foreground">
                  {result.batches_sent} de {result.total_batches} lotes (
                  {result.total_batches > 0
                    ? Math.round((result.batches_sent / result.total_batches) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <Progress
                value={
                  result.total_batches > 0 ? (result.batches_sent / result.total_batches) * 100 : 0
                }
                className="h-2.5 w-full bg-muted"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">Total Identificado</p>
                <p className="text-xl font-bold font-display text-navy dark:text-white mt-1">
                  {result.total.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">Lotes Enviados</p>
                <p className="text-xl font-bold font-display text-electric mt-1">
                  {result.batches_sent} / {result.total_batches}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald/10 border border-emerald/20 text-center">
                <p className="text-xs text-emerald dark:text-emerald-400 font-medium">
                  Novos Criados
                </p>
                <p className="text-xl font-bold font-display text-emerald mt-1">
                  {result.created.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-xs text-primary font-medium">Atualizados</p>
                <p className="text-xl font-bold font-display text-primary mt-1">
                  {result.updated.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-center">
                <p className="text-xs text-muted-foreground">Sem Alteração</p>
                <p className="text-xl font-bold font-display text-muted-foreground mt-1">
                  {result.skipped.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-xs text-destructive font-medium">Falhas</p>
                <p className="text-xl font-bold font-display text-destructive mt-1">
                  {result.failed.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Ocorrências durante o envio ({result.errors.length}):
                </p>
                <ul className="list-disc pl-4 space-y-0.5 max-h-36 overflow-y-auto font-mono text-[11px]">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
