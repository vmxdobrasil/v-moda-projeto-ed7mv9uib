import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { getBrandSettingByKey } from '@/services/brandSettings'
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
  Code2,
  KeyRound,
  Webhook,
  Activity,
  CheckCheck,
  Ban,
  AlertTriangle,
  Lock,
} from 'lucide-react'

const TOKEN_SETTING_KEY = 'maestro_integration_token'
const STATUS_SETTING_KEY = 'maestro_token_status'

interface StepDefinition {
  id: string
  title: string
  description: string
  linkText?: string
  linkUrl?: string
  samplePrompts?: string[]
}

const STEPS: StepDefinition[] = [
  {
    id: 'step1',
    title: 'Passo 1: Ativar o conector MCP do Skip no painel do Maestro',
    description:
      'Acesse o painel do Maestro na Adapta, vá na seção Conectores → Skip → Conectar (OAuth 2.1) e inicie a ativação.',
    linkText: 'Abrir painel Maestro (app.adapta.org)',
    linkUrl: 'https://app.adapta.org',
  },
  {
    id: 'step2',
    title: 'Passo 2: Autorizar o acesso a este projeto no fluxo OAuth',
    description:
      'No popup do Skip Cloud, confirme a permissão para este projeto (V MODA BRASIL) e vincule sua conta de integração.',
  },
  {
    id: 'step3',
    title: 'Passo 3: Testar pedindo dados reais ao Maestro',
    description:
      'No chat do Maestro na Adapta, envie comandos de teste para confirmar a leitura em tempo real do banco de dados.',
    samplePrompts: ['"Liste os projetos da minha conta Skip"', '"Consulte os leads do CRM"'],
  },
  {
    id: 'step4',
    title: 'Passo 4: Criar automação no Maestro que envia leads via webhook',
    description:
      'Crie ou conecte um fluxo de automação no Maestro direcionando os leads capturados para a URL do Webhook exibida abaixo.',
  },
]

export function AdminMasterMaestroIntegration() {
  const { toast } = useToast()

  // Estados do Token / Credencial
  const [token, setToken] = useState<string>('')
  const [maskedToken, setMaskedToken] = useState<string>('sk-mst-••••••••••••')
  const [tokenStatus, setTokenStatus] = useState<'active' | 'revoked'>('active')
  const [loadingToken, setLoadingToken] = useState<boolean>(true)
  const [processingAction, setProcessingAction] = useState<boolean>(false)
  const [copiedToken, setCopiedToken] = useState<boolean>(false)
  const [isRevealedOnce, setIsRevealedOnce] = useState<boolean>(false)

  // Estados do Webhook & Teste
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false)
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false)
  const [copiedLeadsApi, setCopiedLeadsApi] = useState<boolean>(false)
  const [copiedCountApi, setCopiedCountApi] = useState<boolean>(false)
  const [copiedGroupsApi, setCopiedGroupsApi] = useState<boolean>(false)
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    status: number
    message: string
    details?: string
    timestamp: string
  } | null>(null)

  // Testes de Endpoints de Leitura
  const [testingLeads, setTestingLeads] = useState<boolean>(false)
  const [leadsResult, setLeadsResult] = useState<any | null>(null)

  // Checklist persistido em integration_state (tabela dedicada: step, done_at)
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  })

  // URL do Backend e Endpoints
  const backendBaseUrl = window.location.origin
  const webhookUrl = `${backendBaseUrl}/backend/v1/n8n-webhook`
  const leadsApiUrl = `${backendBaseUrl}/backend/v1/leads?limit=50`
  const countApiUrl = `${backendBaseUrl}/backend/v1/leads/count?periodo=hoje`
  const groupsApiUrl = `${backendBaseUrl}/backend/v1/groups`

  // Exemplo de Payload exato pedido pelo usuário
  const payloadExample = JSON.stringify(
    {
      leads: [
        {
          nome: 'Maria Vendedora',
          phone: '+5511999990000',
          email: 'maria@exemplo.com',
          source: 'maestro',
          mensagem: 'Gostaria de revender atacado',
          data: new Date().toISOString(),
        },
      ],
    },
    null,
    2,
  )

  // 1. Carregar Token, Status e Checklist da integration_state
  useEffect(() => {
    let isMounted = true
    const initData = async () => {
      try {
        setLoadingToken(true)

        // Carregar Token
        const tokenRecord = await getBrandSettingByKey(TOKEN_SETTING_KEY)
        const statusRecord = await getBrandSettingByKey(STATUS_SETTING_KEY)

        if (isMounted) {
          const currentToken = tokenRecord?.value_text?.trim() || ''
          setToken(currentToken)
          if (currentToken) {
            const last4 = currentToken.slice(-4)
            setMaskedToken(`sk-mst-••••••••${last4}`)
          }
          if (statusRecord?.value_text?.trim() === 'revoked') {
            setTokenStatus('revoked')
          } else {
            setTokenStatus('active')
          }
        }

        // Carregar Checklist da coleção integration_state
        try {
          const states = await pb.collection('integration_state').getFullList({
            filter: "integration = 'maestro'",
          })
          if (isMounted && states.length > 0) {
            const stepMap: { [key: string]: boolean } = {
              step1: false,
              step2: false,
              step3: false,
              step4: false,
            }
            states.forEach((item: any) => {
              if (item.step && item.done_at) {
                stepMap[item.step] = true
              }
            })
            setCompletedSteps((prev) => ({ ...prev, ...stepMap }))
          }
        } catch {
          // Fallback silencioso
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

  // Alternar checkbox e salvar na tabela integration_state (step, done_at)
  const toggleStep = async (stepKey: string) => {
    const nextState = !completedSteps[stepKey]
    setCompletedSteps((prev) => ({ ...prev, [stepKey]: nextState }))

    try {
      const existing = await pb
        .collection('integration_state')
        .getFirstListItem(`integration = 'maestro' && step = '${stepKey}'`)
        .catch(() => null)

      if (existing) {
        await pb.collection('integration_state').update(existing.id, {
          done_at: nextState ? new Date().toISOString() : null,
        })
      } else {
        await pb.collection('integration_state').create({
          integration: 'maestro',
          step: stepKey,
          done_at: nextState ? new Date().toISOString() : null,
        })
      }
    } catch (e) {
      console.warn('Falha ao persistir em integration_state:', e)
    }
  }

  // Copiar para o Clipboard
  const handleCopy = (
    text: string,
    type: 'token' | 'webhook' | 'payload' | 'leads' | 'count' | 'groups',
  ) => {
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
    } else if (type === 'leads') {
      setCopiedLeadsApi(true)
      setTimeout(() => setCopiedLeadsApi(false), 2000)
    } else if (type === 'count') {
      setCopiedCountApi(true)
      setTimeout(() => setCopiedCountApi(false), 2000)
    } else if (type === 'groups') {
      setCopiedGroupsApi(true)
      setTimeout(() => setCopiedGroupsApi(false), 2000)
    }

    toast({
      title: 'Copiado para a área de transferência!',
      description: 'Pronto para uso nas configurações do Maestro.',
    })
  }

  // Regenerar Token via endpoint /backend/v1/maestro-token (somente admin)
  const handleRegenerateToken = async () => {
    if (
      !window.confirm(
        'Atenção: Ao regenerar o token, a credencial anterior deixará de funcionar imediatamente. O novo JWT/Bearer será exibido em tela uma única vez. Deseja continuar?',
      )
    ) {
      return
    }

    setProcessingAction(true)
    try {
      const response = await fetch(`${backendBaseUrl}/backend/v1/maestro-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
        },
        body: JSON.stringify({ action: 'regenerate' }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setToken(data.token) // exibido uma única vez
        setMaskedToken(data.masked_token || 'sk-mst-••••••••XXXX')
        setTokenStatus('active')
        setIsRevealedOnce(true)

        toast({
          title: '✅ Token Regenerado com Sucesso!',
          description:
            'A nova credencial foi gerada e está visível agora. Copie e guarde-a com segurança.',
        })
      } else {
        throw new Error(data.error || 'Falha ao regenerar credencial')
      }
    } catch (err: any) {
      toast({
        title: '❌ Erro ao regenerar token',
        description: err?.message || 'Falha ao atualizar token.',
        variant: 'destructive',
      })
    } finally {
      setProcessingAction(false)
    }
  }

  // Revogar Token via endpoint /backend/v1/maestro-token
  const handleRevokeToken = async () => {
    if (
      !window.confirm(
        'Atenção: Revogar o token desativará imediatamente o acesso do usuário de serviço. Todas as chamadas retornarão HTTP 401. Confirmar revogação?',
      )
    ) {
      return
    }

    setProcessingAction(true)
    try {
      const response = await fetch(`${backendBaseUrl}/backend/v1/maestro-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
        },
        body: JSON.stringify({ action: 'revoke' }),
      })

      const data = await response.json()
      if (response.ok && data.success) {
        setTokenStatus('revoked')
        setIsRevealedOnce(false)
        toast({
          title: '🚫 Token Revogado com Sucesso!',
          description: 'A credencial foi desativada. As chamadas futuras retornarão 401.',
        })
      } else {
        throw new Error(data.error || 'Falha ao revogar token')
      }
    } catch (err: any) {
      toast({
        title: '❌ Erro ao revogar token',
        description: err?.message || 'Falha ao revogar credencial.',
        variant: 'destructive',
      })
    } finally {
      setProcessingAction(false)
    }
  }

  // Testar Conexão enviando lead de teste (origem maestro-test)
  const handleTestWebhook = async () => {
    setTestingWebhook(true)
    setTestResult(null)

    const testPayload = {
      leads: [
        {
          nome: 'Lead Teste Maestro Adapta',
          phone: '+5511999990001',
          email: 'maestro-teste@adapta.org',
          source: 'maestro-test',
          mensagem: 'Validação de conexão ponta a ponta',
          data: new Date().toISOString(),
        },
      ],
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(testPayload),
      })

      const data = await response.json().catch(() => ({}))
      const now = new Date().toLocaleTimeString('pt-BR')

      let detailExplanation = ''
      if (response.status === 200) {
        detailExplanation = '200 OK: Payload aceito e lead processado com sucesso na base de dados.'
      } else if (response.status === 401) {
        detailExplanation =
          '401 Não Autorizado: Token ausente, inválido ou revogado. Verifique a credencial Bearer.'
      } else if (response.status === 400) {
        detailExplanation =
          '400 Payload Inválido: Estrutura JSON ou campos obrigatórios incorretos.'
      } else if (response.status >= 500) {
        detailExplanation = `5xx Erro no Backend: Falha interna no servidor (${response.status}).`
      } else {
        detailExplanation = `Status HTTP ${response.status}: ${data.message || data.error || 'Retorno inesperado'}.`
      }

      const success = response.ok && data.success
      setTestResult({
        success,
        status: response.status,
        message: success
          ? 'Conexão Webhook Aprovada (200 OK)!'
          : `Erro de Conexão (HTTP ${response.status})`,
        details: detailExplanation,
        timestamp: now,
      })

      if (success) {
        toast({
          title: '✅ Conexão Webhook Aprovada!',
          description: 'O endpoint recebeu e processou o lead de teste perfeitamente.',
        })
        if (!completedSteps.step4) {
          toggleStep('step4')
        }
      } else {
        toast({
          title: `❌ Falha ao testar webhook (HTTP ${response.status})`,
          description: detailExplanation,
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      const now = new Date().toLocaleTimeString('pt-BR')
      setTestResult({
        success: false,
        status: 0,
        message: 'Falha de comunicação de rede',
        details: err?.message || 'Não foi possível disparar a requisição.',
        timestamp: now,
      })
      toast({
        title: '❌ Falha de Rede',
        description: err?.message || 'Erro ao conectar ao servidor.',
        variant: 'destructive',
      })
    } finally {
      setTestingWebhook(false)
    }
  }

  // Testar leitura de Leads protegida pelo Bearer token
  const handleTestLeadsApi = async () => {
    if (!token) return
    setTestingLeads(true)
    setLeadsResult(null)

    try {
      const response = await fetch(`${backendBaseUrl}/backend/v1/leads?limit=5`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setLeadsResult(data)
        toast({
          title: '✅ Leitura de Leads bem-sucedida!',
          description: `Retornados ${data.total} leads da base com permissão somente-leitura.`,
        })
        if (!completedSteps.step3) {
          toggleStep('step3')
        }
      } else {
        toast({
          title: '❌ Falha ao consultar endpoint',
          description: data.error || `HTTP ${response.status} - Acesso recusado.`,
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
      setTestingLeads(false)
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
                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-600 bg-blue-500/10 gap-1"
                >
                  <Lock className="w-3 h-3" />
                  svc-maestro@integracao.local (Leitura)
                </Badge>
                {allCompleted && (
                  <Badge className="bg-emerald-600 text-white gap-1 hover:bg-emerald-700">
                    <CheckCheck className="w-3 h-3" />
                    Integração Concluída
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-bold font-display text-navy dark:text-white flex items-center gap-2 mt-2">
                Integração Maestro (Adapta)
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Conecte o agente de IA <strong>Maestro da Adapta</strong> com conector MCP nativo e
                usuário de serviço dedicado (somente-leitura). Sincronize leads, consulte contagens
                e automações com segurança.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* SEÇÃO 1: CHECKLIST DE 4 PASSOS DE CONEXÃO COM O MAESTRO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Checklist de Conexão com o Maestro
              </h3>
              <span className="text-xs font-semibold text-muted-foreground">
                {Object.values(completedSteps).filter(Boolean).length} de 4 passos concluídos
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {STEPS.map((stepItem, idx) => {
                const isDone = completedSteps[stepItem.id]
                return (
                  <div
                    key={stepItem.id}
                    onClick={() => toggleStep(stepItem.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-muted/40 border-border/60 hover:border-primary/30 hover:bg-muted/60'
                    }`}
                  >
                    <Checkbox
                      checked={isDone}
                      onCheckedChange={() => toggleStep(stepItem.id)}
                      className="mt-1"
                    />
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                          {idx + 1}
                        </span>
                        {stepItem.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {stepItem.description}
                      </p>

                      {stepItem.linkUrl && (
                        <div className="pt-1">
                          <a
                            href={stepItem.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                          >
                            {stepItem.linkText}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {stepItem.samplePrompts && (
                        <div className="pt-1 space-y-1">
                          <span className="text-[11px] font-medium text-foreground block">
                            Exemplos de teste no chat do Maestro:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {stepItem.samplePrompts.map((p, pIdx) => (
                              <code
                                key={pIdx}
                                className="text-[11px] bg-background/80 px-2 py-0.5 rounded border text-foreground"
                              >
                                {p}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DE CONEXÃO & TESTAR CONEXÃO */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                  <Webhook className="w-4 h-4 text-primary" />
                  Dados de Conexão do Webhook
                </h4>
                <p className="text-xs text-muted-foreground">
                  URL completa para o Maestro injetar leads capturados via automação ou conversa.
                </p>
              </div>
              <Badge variant="secondary" className="gap-1 self-start">
                <Code2 className="w-3.5 h-3.5" /> POST com Bearer Token
              </Badge>
            </div>

            {/* Input da URL do Webhook */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                URL Completa do Webhook:
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
                  disabled={testingWebhook || tokenStatus === 'revoked'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 min-w-[150px]"
                >
                  <Send className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin' : ''}`} />
                  {testingWebhook ? 'Testando...' : 'Testar Conexão'}
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
                  Formato de Payload Exigido pelo Webhook:
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
                Campos suportados: <code>nome</code> (ou <code>name</code>), <code>phone</code> (com
                DDD), <code>email</code>, <code>source</code> (padrão: <code>maestro</code>),{' '}
                <code>mensagem</code> e <code>data</code>.
              </p>
            </div>
          </div>

          {/* SEÇÃO 3: CREDENCIAL DEDICADA & ENDPOINTS DE LEITURA */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display flex items-center gap-2 text-navy dark:text-white">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Credencial Dedicada do Usuário de Serviço (svc-maestro)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Usuário de serviço <code>svc-maestro@integracao.local</code> sem login humano, com
                  permissão exclusiva de leitura (SELECT) em leads, contagens e grupos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {tokenStatus === 'active' ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Ativo
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <Ban className="w-3.5 h-3.5" /> Revogado (401)
                  </Badge>
                )}
              </div>
            </div>

            {/* Aviso de Segurança Prescrito */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Aviso de Segurança:</strong> Este token permite apenas LEITURA de leads,
                contagens e grupos. Ele não possui permissão para alterar regras do sistema.
              </span>
            </div>

            {/* Input do Token com Máscara e Botões Copiar / Regenerar / Revogar */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                Token JWT / Bearer ({isRevealedOnce ? 'Visível (Copie Agora)' : 'Mascarado'}):
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  type="text"
                  readOnly
                  value={
                    loadingToken ? 'Carregando credencial...' : isRevealedOnce ? token : maskedToken
                  }
                  className="font-mono text-xs bg-muted/40 border-border/70 select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(token, 'token')}
                  disabled={loadingToken || !token || tokenStatus === 'revoked'}
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
                  variant="secondary"
                  size="sm"
                  onClick={handleRegenerateToken}
                  disabled={loadingToken || processingAction}
                  className="gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${processingAction ? 'animate-spin' : ''}`} />
                  Regenerar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRevokeToken}
                  disabled={loadingToken || processingAction || tokenStatus === 'revoked'}
                  className="text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Revogar
                </Button>
              </div>
            </div>

            {/* ENDPOINTS DE LEITURA DISPONÍVEIS PARA O MAESTRO */}
            <div className="pt-3 border-t border-border/40 space-y-3">
              <span className="text-xs font-bold text-foreground block">
                Endpoints de Leitura Prontos para o Maestro:
              </span>

              <div className="grid gap-2.5">
                {/* 1. GET /backend/v1/leads */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">
                      Últimos Leads (?limit= e ?source=):
                    </span>
                    <code className="text-[11px] block text-muted-foreground font-mono">
                      GET {leadsApiUrl}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(leadsApiUrl, 'leads')}
                      className="h-7 text-xs gap-1"
                    >
                      {copiedLeadsApi ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copiar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleTestLeadsApi}
                      disabled={testingLeads || !token || tokenStatus === 'revoked'}
                      className="h-7 text-xs gap-1"
                    >
                      <Activity className={`w-3 h-3 ${testingLeads ? 'animate-spin' : ''}`} />
                      {testingLeads ? 'Lendo...' : 'Testar Leitura'}
                    </Button>
                  </div>
                </div>

                {/* 2. GET /backend/v1/leads/count */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">
                      Contagem Total e Período (?periodo=hoje|7d|30d):
                    </span>
                    <code className="text-[11px] block text-muted-foreground font-mono">
                      GET {countApiUrl}
                    </code>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(countApiUrl, 'count')}
                    className="h-7 text-xs gap-1 self-end sm:self-auto"
                  >
                    {copiedCountApi ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copiar
                  </Button>
                </div>

                {/* 3. GET /backend/v1/groups */}
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">
                      Grupos de WhatsApp de Leads:
                    </span>
                    <code className="text-[11px] block text-muted-foreground font-mono">
                      GET {groupsApiUrl}
                    </code>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(groupsApiUrl, 'groups')}
                    className="h-7 text-xs gap-1 self-end sm:self-auto"
                  >
                    {copiedGroupsApi ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copiar
                  </Button>
                </div>
              </div>

              {/* Resultado do Testar Leitura */}
              {leadsResult && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    Leitura de Leads autorizada! Total retornado: {leadsResult.total}
                  </div>
                  <div className="space-y-1">
                    {leadsResult.leads?.slice(0, 3).map((lead: any, i: number) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-background/80 border text-[11px] flex justify-between"
                      >
                        <span className="font-medium text-foreground">
                          {lead.nome || lead.name}
                        </span>
                        <span className="text-muted-foreground font-mono">{lead.phone}</span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {lead.source}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
