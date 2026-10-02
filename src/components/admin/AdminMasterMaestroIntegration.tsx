import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { getBrandSettingByKey, saveBrandSettingValue } from '@/services/brandSettings'
import {
  Bot,
  Copy,
  Check,
  RefreshCw,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Layers,
  Code2,
  Info,
  KeyRound,
  Webhook,
  Activity,
  CheckCheck,
} from 'lucide-react'

const TOKEN_SETTING_KEY = 'maestro_integration_token'
const CHECKLIST_SETTING_KEY = 'maestro_checklist_steps'

// Gera token aleatório seguro para o Maestro
function generateSecureToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let token = 'mst_'
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export function AdminMasterMaestroIntegration() {
  const { toast } = useToast()

  // Estados do Token
  const [token, setToken] = useState<string>('')
  const [loadingToken, setLoadingToken] = useState<boolean>(true)
  const [savingToken, setSavingToken] = useState<boolean>(false)
  const [copiedToken, setCopiedToken] = useState<boolean>(false)

  // Estados do Webhook & Teste
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false)
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false)
  const [copiedSummaryUrl, setCopiedSummaryUrl] = useState<boolean>(false)
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: string
    timestamp: string
  } | null>(null)

  // Teste do Endpoint de Leitura do Maestro
  const [testingSummary, setTestingSummary] = useState<boolean>(false)
  const [summaryResult, setSummaryResult] = useState<any | null>(null)

  // Checklist de 4 passos com persistência no banco
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  })

  // URL do Backend e Endpoints
  const backendBaseUrl = window.location.origin
  const webhookUrl = `${backendBaseUrl}/backend/v1/n8n-webhook`
  const summaryApiUrl = `${backendBaseUrl}/backend/v1/maestro/summary`

  // Exemplo de Payload JSON para automação do Maestro
  const payloadExample = JSON.stringify(
    {
      leads: [
        {
          phone: '5562999999999',
          name: 'Maria Vendedora',
          source: 'maestro_adapta',
        },
      ],
    },
    null,
    2,
  )

  // 1. Carregar ou Inicializar o Token e Checklist
  useEffect(() => {
    let isMounted = true
    const initData = async () => {
      try {
        setLoadingToken(true)

        // Token do Maestro
        const tokenRecord = await getBrandSettingByKey(TOKEN_SETTING_KEY)
        if (isMounted) {
          if (tokenRecord?.value_text?.trim()) {
            setToken(tokenRecord.value_text.trim())
          } else {
            // Gera na primeira visita e salva automaticamente
            const newToken = generateSecureToken()
            setToken(newToken)
            await saveBrandSettingValue(
              TOKEN_SETTING_KEY,
              newToken,
              'Token de Integração Maestro (Adapta)',
            )
          }
        }

        // Checklist persistido
        const checklistRecord = await getBrandSettingByKey(CHECKLIST_SETTING_KEY)
        if (isMounted && checklistRecord?.value_text) {
          try {
            const parsed = JSON.parse(checklistRecord.value_text)
            setCompletedSteps((prev) => ({ ...prev, ...parsed }))
          } catch {
            // ignora se json inválido
          }
        }
      } catch (err) {
        console.warn('Erro ao inicializar dados do Maestro:', err)
      } finally {
        if (isMounted) setLoadingToken(false)
      }
    }

    initData()
    return () => {
      isMounted = false
    }
  }, [])

  // Alternar checkbox e salvar progresso
  const toggleStep = async (stepKey: string) => {
    const updated = {
      ...completedSteps,
      [stepKey]: !completedSteps[stepKey],
    }
    setCompletedSteps(updated)

    try {
      await saveBrandSettingValue(
        CHECKLIST_SETTING_KEY,
        JSON.stringify(updated),
        'Progresso do Checklist Maestro',
      )
    } catch (e) {
      console.warn('Falha ao salvar progresso do checklist:', e)
    }
  }

  // Copiar para o Clipboard
  const handleCopy = (text: string, type: 'token' | 'webhook' | 'payload' | 'summary') => {
    navigator.clipboard.writeText(text)
    if (type === 'token') {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    } else if (type === 'webhook') {
      setCopiedWebhook(true)
      setTimeout(() => setCopiedWebhook(false), 2000)
    } else if (type === 'payload') {
      setCopiedPayload(true)
      setTimeout(() => setCopiedPayload(false), 2000)
    } else if (type === 'summary') {
      setCopiedSummaryUrl(true)
      setTimeout(() => setCopiedSummaryUrl(false), 2000)
    }

    toast({
      title: 'Copiado para a área de transferência!',
      description: 'Pronto para colar no painel do Maestro na Adapta.',
    })
  }

  // Regenerar Token com confirmação
  const handleRegenerateToken = async () => {
    if (
      !window.confirm(
        'Atenção: Ao regenerar o token, qualquer automação existente do Maestro que use o token antigo precisará ser atualizada com o novo valor. Deseja continuar?',
      )
    ) {
      return
    }

    setSavingToken(true)
    try {
      const newToken = generateSecureToken()
      await saveBrandSettingValue(
        TOKEN_SETTING_KEY,
        newToken,
        'Token de Integração Maestro (Adapta)',
      )
      setToken(newToken)
      toast({
        title: 'Token regenerado com sucesso!',
        description: 'Copie o novo token e atualize suas configurações no Maestro.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao regenerar token',
        description: err?.message || 'Falha ao atualizar token.',
        variant: 'destructive',
      })
    } finally {
      setSavingToken(false)
    }
  }

  // Testar conexão enviando um lead fictício para o webhook
  const handleTestWebhook = async () => {
    setTestingWebhook(true)
    setTestResult(null)

    const testPayload = {
      leads: [
        {
          name: 'Lead Teste Maestro Adapta',
          phone: '5562999998888',
          source: 'maestro_adapta_teste',
        },
      ],
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      })

      const data = await response.json()
      const now = new Date().toLocaleTimeString('pt-BR')

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Webhook respondendo com 100% de sucesso!',
          details: `Lead de teste processado (${data.action === 'created' ? 'criado' : 'atualizado'} com sucesso na base). O Maestro conseguirá injetar leads normalmente.`,
          timestamp: now,
        })
        toast({
          title: '✅ Conexão Webhook Aprovada!',
          description: 'O endpoint recebeu e processou o lead de teste perfeitamente.',
        })
        // Marca o passo 3 ou 4 como pronto se ainda não estava
        if (!completedSteps.step4) {
          toggleStep('step4')
        }
      } else {
        setTestResult({
          success: false,
          message: `O webhook respondeu com erro (HTTP ${response.status})`,
          details: data.message || data.error || 'Verifique a rota e parâmetros.',
          timestamp: now,
        })
        toast({
          title: '❌ Falha ao testar webhook',
          description: data.message || 'O servidor retornou um status inesperado.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      const now = new Date().toLocaleTimeString('pt-BR')
      setTestResult({
        success: false,
        message: 'Falha de comunicação com o servidor',
        details: err?.message || 'Não foi possível disparar a requisição.',
        timestamp: now,
      })
      toast({
        title: '❌ Falha na conexão',
        description: err?.message || 'Erro ao conectar.',
        variant: 'destructive',
      })
    } finally {
      setTestingWebhook(false)
    }
  }

  // Testar leitura de estatísticas do CRM protegida por Token
  const handleTestSummaryApi = async () => {
    if (!token) return
    setTestingSummary(true)
    setSummaryResult(null)

    try {
      const response = await fetch(`${summaryApiUrl}?token=${encodeURIComponent(token)}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setSummaryResult(data)
        toast({
          title: '✅ Dados do CRM lidos com sucesso!',
          description: `Total de clientes consultados: ${data.summary?.crm?.total_customers_leads?.toLocaleString('pt-BR') || 0}.`,
        })
        if (!completedSteps.step3) {
          toggleStep('step3')
        }
      } else {
        toast({
          title: '❌ Falha ao consultar endpoint',
          description: data.error || 'Token inválido ou recusado.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: '❌ Erro de requisição',
        description: err?.message || 'Falha ao consultar API.',
        variant: 'destructive',
      })
    } finally {
      setTestingSummary(false)
    }
  }

  const allCompleted =
    completedSteps.step1 && completedSteps.step2 && completedSteps.step3 && completedSteps.step4

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Card */}
      <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 shadow-soft">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-primary/10 gap-1.5 py-1 px-3"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Agente de IA Oficial
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Adapta & Skip MCP Nativo
                </Badge>
                {allCompleted && (
                  <Badge className="bg-emerald-600 text-white gap-1 hover:bg-emerald-700">
                    <CheckCheck className="w-3 h-3" />
                    Integração Completa
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-bold font-display text-navy dark:text-white flex items-center gap-2 mt-2">
                Integração Maestro (Adapta) — Agente de Inteligência Artificial
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Conecte o agente de IA <strong>Maestro da Adapta</strong> com o conector nativo MCP
                do Skip. Monitore leads, acione automações de vendas e sincronize este projeto e
                todos os outros desenvolvidos na sua conta Skip.dev.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* SEÇÃO 1: GUIA PASSO A PASSO COM CHECKLIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                <Layers className="w-5 h-5 text-primary" />
                Passo a Passo de Integração (Checklist)
              </h3>
              <span className="text-xs font-semibold text-muted-foreground">
                {Object.values(completedSteps).filter(Boolean).length} de 4 passos concluídos
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Passo 1 */}
              <div
                onClick={() => toggleStep('step1')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  completedSteps.step1
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-muted/40 border-border/60 hover:border-primary/30 hover:bg-muted/60'
                }`}
              >
                <Checkbox
                  checked={completedSteps.step1}
                  onCheckedChange={() => toggleStep('step1')}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      1
                    </span>
                    Ativar o conector MCP do Skip no painel do Maestro
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Acesse seu painel na Adapta, vá na seção de conectores/ferramentas do Maestro e
                    selecione o <strong>conector MCP oficial do Skip</strong>.
                  </p>
                </div>
              </div>

              {/* Passo 2 */}
              <div
                onClick={() => toggleStep('step2')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  completedSteps.step2
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-muted/40 border-border/60 hover:border-primary/30 hover:bg-muted/60'
                }`}
              >
                <Checkbox
                  checked={completedSteps.step2}
                  onCheckedChange={() => toggleStep('step2')}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      2
                    </span>
                    Autorizar o acesso a este projeto
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No fluxo de autorização do Maestro, escolha a sua conta Skip e autorize o acesso
                    a este projeto (<strong>V MODA BRASIL</strong>). Cole o Token de Integração se
                    solicitado.
                  </p>
                </div>
              </div>

              {/* Passo 3 */}
              <div
                onClick={() => toggleStep('step3')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  completedSteps.step3
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-muted/40 border-border/60 hover:border-primary/30 hover:bg-muted/60'
                }`}
              >
                <Checkbox
                  checked={completedSteps.step3}
                  onCheckedChange={() => toggleStep('step3')}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      3
                    </span>
                    Testar pedindo dados reais ao Maestro pelo chat
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No chat do Maestro, digite perguntas como: &ldquo;Quantos leads temos no CRM da
                    V MODA BRASIL?&rdquo; ou &ldquo;Quais as principais cidades dos
                    clientes?&rdquo;.
                  </p>
                </div>
              </div>

              {/* Passo 4 */}
              <div
                onClick={() => toggleStep('step4')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                  completedSteps.step4
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-muted/40 border-border/60 hover:border-primary/30 hover:bg-muted/60'
                }`}
              >
                <Checkbox
                  checked={completedSteps.step4}
                  onCheckedChange={() => toggleStep('step4')}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                      4
                    </span>
                    Criar automação que envia leads via Webhook
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No fluxo do Maestro, adicione a ação de disparo HTTP POST direcionada para a URL
                    do Webhook abaixo, injetando novos leads diretamente no seu CRM.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: CREDENCIAL DEDICADA PARA O MAESTRO */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Token de Integração Dedicado para o Maestro
                </h4>
                <p className="text-xs text-muted-foreground">
                  Chave segura exclusiva para o agente Maestro consultar leitura do CRM (leads,
                  contagens, cidades e produtos) sem expor senhas.
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 self-start"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Ativo & Seguro
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  readOnly
                  value={loadingToken ? 'Carregando credencial...' : token}
                  className="font-mono text-xs pr-10 bg-muted/40 border-border/70"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleCopy(token, 'token')}
                disabled={loadingToken || !token}
                className="gap-1.5"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" /> Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copiar Token
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRegenerateToken}
                disabled={loadingToken || savingToken}
                className="text-muted-foreground hover:text-destructive gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${savingToken ? 'animate-spin' : ''}`} />
                Regenerar Token
              </Button>
            </div>

            {/* Teste do endpoint de leitura do Maestro */}
            <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">
                  Endpoint de Leitura do CRM para o Maestro:
                </p>
                <code className="text-[11px] bg-muted/60 px-1.5 py-0.5 rounded font-mono break-all">
                  GET {summaryApiUrl}?token={token ? '***' : ''}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(`${summaryApiUrl}?token=${token}`, 'summary')}
                  className="text-xs h-8"
                >
                  {copiedSummaryUrl ? (
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 mr-1" />
                  )}
                  Copiar URL da API
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleTestSummaryApi}
                  disabled={testingSummary || !token}
                  className="text-xs h-8"
                >
                  <Activity
                    className={`w-3.5 h-3.5 mr-1 ${testingSummary ? 'animate-spin' : ''}`}
                  />
                  {testingSummary ? 'Consultando...' : 'Testar Leitura'}
                </Button>
              </div>
            </div>

            {summaryResult && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Leitura do Maestro bem-sucedida! Dados retornados:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="block text-[10px]">Total Leads CRM</span>
                    <strong className="text-foreground text-sm">
                      {summaryResult.summary?.crm?.total_customers_leads?.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="block text-[10px]">Produtos Ativos</span>
                    <strong className="text-foreground text-sm">
                      {summaryResult.summary?.catalog?.active_products || 0}
                    </strong>
                  </div>
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="block text-[10px]">Pedidos Totais</span>
                    <strong className="text-foreground text-sm">
                      {summaryResult.summary?.orders?.total_orders || 0}
                    </strong>
                  </div>
                  <div className="bg-background/80 p-2 rounded border">
                    <span className="block text-[10px]">Grupos de WhatsApp</span>
                    <strong className="text-foreground text-sm">
                      {summaryResult.summary?.crm?.unique_whatsapp_groups || 0}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 3: WEBHOOK DE LEADS COM TESTE E PAYLOAD PRONTOS */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                  <Webhook className="w-4 h-4 text-primary" />
                  URL do Webhook para Envio de Leads pelo Maestro
                </h4>
                <p className="text-xs text-muted-foreground">
                  Configure esta URL na ação de envio HTTP do Maestro. Qualquer lead capturado pelo
                  agente (via chat, anúncio, site ou WhatsApp) será salvo automaticamente no seu
                  CRM.
                </p>
              </div>
              <Badge variant="secondary" className="gap-1 self-start">
                <Code2 className="w-3.5 h-3.5" /> Método HTTP POST
              </Badge>
            </div>

            {/* Input da URL do Webhook */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Endereço de Produção do Webhook:
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="font-mono text-xs bg-muted/40 border-border/70 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(webhookUrl, 'webhook')}
                  className="gap-1.5"
                >
                  {copiedWebhook ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar URL
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 min-w-[140px]"
                >
                  <Send className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin' : ''}`} />
                  {testingWebhook ? 'Enviando teste...' : 'Testar Conexão'}
                </Button>
              </div>
            </div>

            {/* Resultado do Teste de Conexão */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-destructive/10 border-destructive/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{testResult.message}</p>
                      <span className="text-[11px] text-muted-foreground">
                        às {testResult.timestamp}
                      </span>
                    </div>
                    {testResult.details && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {testResult.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Formato de Payload JSON Aceito */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Formato de Payload JSON Aceito pelo Webhook:
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(payloadExample, 'payload')}
                  className="text-xs h-7 gap-1"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar JSON
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-muted/60 border border-border/70 font-mono text-xs overflow-x-auto text-foreground">
                  {payloadExample}
                </pre>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dica: O webhook aceita tanto lote no formato{' '}
                <code className="bg-muted px-1 rounded">&#123;&quot;leads&quot;: [...]&#125;</code>{' '}
                quanto lead individual direto{' '}
                <code className="bg-muted px-1 rounded">
                  &#123;&quot;phone&quot;: &quot;...&quot;, &quot;name&quot;: &quot;...&quot;&#125;
                </code>
                .
              </p>
            </div>
          </div>

          {/* SEÇÃO 4: GUIA DE REPLICAÇÃO EM OUTROS PROJETOS SKIP */}
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
            <div className="space-y-1">
              <h4 className="text-base font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                <Sparkles className="w-4 h-4 text-primary" />
                Como Replicar nos Meus Outros Projetos Skip
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Você pode interligar o mesmo agente Maestro da Adapta com todos os aplicativos
                construídos ou em construção na sua conta Skip.dev seguindo este padrão:
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  1. No Maestro
                </span>
                <p className="text-xs text-muted-foreground">
                  No painel do Maestro, adicione uma nova integração MCP ou ferramenta apontando
                  para o novo projeto Skip.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  2. Conectar Projeto
                </span>
                <p className="text-xs text-muted-foreground">
                  Autorize a conexão com o novo projeto da sua conta Skip selecionando-o na lista.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  3. Copiar Webhook
                </span>
                <p className="text-xs text-muted-foreground">
                  Copie a rota de webhook do novo projeto (
                  <code className="text-[10px]">
                    https://[outro-app].goskip.app/backend/v1/n8n-webhook
                  </code>
                  ).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border/60 space-y-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  4. Automação Global
                </span>
                <p className="text-xs text-muted-foreground">
                  Configure o Maestro para direcionar os leads conforme a marca ou produto de cada
                  projeto da conta.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Vantagem do conector nativo MCP Skip:</strong> O Maestro se conecta
                diretamente à sua conta Skip. Quando você cria novos projetos, eles compartilham a
                mesma infraestrutura de segurança do Skip Cloud, permitindo que um único agente de
                IA consulte estoques, clientes e direcione leads entre múltiplas marcas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
