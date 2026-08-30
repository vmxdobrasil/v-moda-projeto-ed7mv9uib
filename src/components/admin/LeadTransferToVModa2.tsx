import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { startBackgroundOperation, endBackgroundOperation } from '@/lib/background-operations'
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react'

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
  const [result, setResult] = useState<TransferSummary | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const { toast } = useToast()

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
      const response: TransferSummary = await pb.send('/backend/v1/transfer-to-v-moda-2', {
        method: 'POST',
        body: {
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

          <Button
            size="lg"
            onClick={handleTransfer}
            disabled={loading}
            className="font-semibold shadow-md bg-gradient-to-r from-primary to-electric hover:opacity-90 transition-all text-white min-w-[240px] h-12"
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
      </CardHeader>

      <CardContent className="space-y-6">
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
                Envio sequencial em blocos de 500 leads com cursor indexado e tolerância a falhas.
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
                <code className="text-xs bg-background px-1 py-0.5 rounded">
                  v-moda-brasil-d7c0f.goskip.app
                </code>{' '}
                com deduplicação automática e enriquecimento de dados.
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Carregamento Ativo */}
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
