import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { Loader2, Users, Send, RefreshCw, AlertCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export function WhatsappTools({ instances }: { instances: string[] }) {
  const isAuthenticated = pb.authStore.isValid
  const [selectedInstance, setSelectedInstance] = useState<string>('')

  const [groups, setGroups] = useState<any[]>([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [extracting, setExtracting] = useState(false)

  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Olá! Este é um disparo de teste do sistema.')
  const [sendingTest, setSendingTest] = useState(false)
  const [rotationEnabled, setRotationEnabled] = useState(false)

  useEffect(() => {
    if (instances.length > 0 && (!selectedInstance || !instances.includes(selectedInstance))) {
      setSelectedInstance(instances[0])
    }
  }, [instances, selectedInstance])

  const fetchGroups = async () => {
    if (!selectedInstance) {
      toast.error('Selecione uma instância primeiro.')
      return
    }
    setLoadingGroups(true)
    try {
      const res = await pb.send(`/backend/v1/whatsapp/groups?instance=${selectedInstance}`, {
        method: 'GET',
      })
      if (Array.isArray(res)) {
        setGroups(res)
      } else {
        toast.error('Formato de resposta inesperado.')
      }
    } catch (e: any) {
      toast.error('Erro ao buscar grupos. ' + (e.message || ''))
    } finally {
      setLoadingGroups(false)
    }
  }

  const handleExtractGroup = async () => {
    if (!selectedInstance || !selectedGroup) {
      toast.error('Selecione uma instância e um grupo (ou insira o Group ID).')
      return
    }
    setExtracting(true)
    try {
      const res = await pb.send('/backend/v1/whatsapp/extract-group', {
        method: 'POST',
        body: JSON.stringify({
          instance: selectedInstance,
          groupId: selectedGroup,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success(
        `Extração concluída! ${res.added} novos leads adicionados. (${res.skipped} ignorados/duplicados)`,
      )
    } catch (e: any) {
      const errorMsg = getErrorMessage(e)
      toast.error(errorMsg || 'Erro na extração.')
    } finally {
      setExtracting(false)
    }
  }

  const handleTestMessage = async () => {
    if (!testPhone || !testMessage) {
      toast.error('Preencha o telefone e a mensagem.')
      return
    }

    let normalizedPhone = testPhone.replace(/\D/g, '')
    if (normalizedPhone.length === 10 || normalizedPhone.length === 11) {
      normalizedPhone = '55' + normalizedPhone
    }
    if (normalizedPhone.length < 12) {
      toast.error('Número de telefone inválido. O formato esperado é 55 + DDD + 9 dígitos.')
      return
    }

    let instanceToSend = selectedInstance
    if (rotationEnabled && instances.length > 0) {
      const randomIdx = Math.floor(Math.random() * instances.length)
      instanceToSend = instances[randomIdx]
    }

    if (!instanceToSend) {
      toast.error(
        'Erro: Configuração da instância incompleta. Por favor, adicione e selecione uma instância.',
      )
      return
    }

    setSendingTest(true)
    try {
      await pb.send('/backend/v1/whatsapp/send', {
        method: 'POST',
        body: JSON.stringify({
          instance_id: instanceToSend,
          phone: normalizedPhone,
          message: testMessage,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success(`Mensagem de teste enviada com sucesso! (Via ${instanceToSend})`)
    } catch (e: any) {
      const errorMsg = getErrorMessage(e)
      toast.error(errorMsg || 'Erro ao enviar mensagem de teste.')
    } finally {
      setSendingTest(false)
    }
  }

  if (instances.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md bg-muted/20">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
        <p>
          Você precisa configurar pelo menos uma instância na aba "Gerenciamento de Instâncias" para
          usar as ferramentas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
        <Label className="font-semibold whitespace-nowrap">Instância Ativa:</Label>
        <Select value={selectedInstance} onValueChange={setSelectedInstance}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecione a instância..." />
          </SelectTrigger>
          <SelectContent>
            {instances.map((inst) => (
              <SelectItem key={inst} value={inst}>
                {inst}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Extrator de Grupos
            </CardTitle>
            <CardDescription>
              Extraia todos os participantes de um grupo (ignorando administradores) e salve como
              novos Leads no CRM.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Selecionar Grupo da Instância</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchGroups}
                    disabled={loadingGroups || !selectedInstance}
                    className="h-8"
                  >
                    {loadingGroups ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Atualizar Lista
                  </Button>
                </div>
                <Select
                  value={selectedGroup}
                  onValueChange={setSelectedGroup}
                  disabled={groups.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        groups.length === 0
                          ? 'Busque os grupos ou cole o ID abaixo...'
                          : 'Selecione o grupo...'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.subject || g.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou insira manualmente</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Group ID (JID)</Label>
                <Input
                  placeholder="ex: 1234567890-12345@g.us"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleExtractGroup}
              disabled={extracting || !selectedGroup}
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extraindo...
                </>
              ) : (
                <>Extrair e Importar Leads</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              A extração criará um log no Histórico de Importações.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Disparo de Teste
            </CardTitle>
            <CardDescription>
              Valide se a instância está conectada corretamente enviando uma mensagem de teste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Número do WhatsApp</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none pointer-events-none text-sm">
                  🇧🇷 +
                </span>
                <Input
                  placeholder="5511999999999"
                  className="pl-[3.5rem]"
                  value={testPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    setTestPhone(digits)
                  }}
                  onBlur={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    if (digits.length === 10 || digits.length === 11) {
                      setTestPhone('55' + digits)
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O código 55 será adicionado automaticamente caso omitido.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite a mensagem de teste..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="resize-none h-20"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 border rounded-md">
              <input
                type="checkbox"
                id="rotation-toggle"
                checked={rotationEnabled}
                onChange={(e) => setRotationEnabled(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <Label htmlFor="rotation-toggle" className="text-sm cursor-pointer leading-tight">
                Ativar Rotação Aleatória (Usa uma instância aleatória entre as cadastradas)
              </Label>
            </div>

            {!isAuthenticated ? (
              <div className="p-4 bg-muted/50 rounded-md text-center border">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Faça login para utilizar as ferramentas de teste.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/login">Ir para Login</a>
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleTestMessage}
                disabled={sendingTest || !testPhone}
              >
                {sendingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>Enviar Mensagem de Teste</>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
