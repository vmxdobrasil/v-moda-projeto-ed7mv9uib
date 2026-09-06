import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { useToast } from '@/hooks/use-toast'
import { Loader2, RefreshCw, Shuffle, Plus, ExternalLink } from 'lucide-react'
import {
  getWhatsappConfigs,
  saveWhatsappConfig,
  getEvolutionStatus,
  getEvolutionConnect,
  type WhatsappConfig,
} from '@/services/whatsapp'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export function WhatsAppConnection() {
  const [configs, setConfigs] = useState<WhatsappConfig[]>([])
  const [selectedInstance, setSelectedInstance] = useState<string>('')
  const [apiUrl, setApiUrl] = useState('')
  const [instanceId, setInstanceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [connStatus, setConnStatus] = useState<any>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setIsLoading(true)
      const list = await getWhatsappConfigs()
      setConfigs(list)
      if (list.length > 0) {
        const first = list[0]
        setApiUrl(first.api_url || '')
        setInstanceId(first.instance_id || '')
        setSelectedInstance(first.instance_id || '')
        checkStatus(first.instance_id)
      }
    } catch {
      /* intentionally ignored */
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async (instOverride?: string) => {
    const inst = instOverride || selectedInstance || instanceId
    try {
      const res = await getEvolutionStatus(inst)
      setConnStatus(res)
      if (res?.state !== 'open' && res?.state !== 'connecting') {
        fetchQrCode(inst)
      } else {
        setQrCode(null)
      }
    } catch (err) {
      setConnStatus({ state: 'offline' })
    }
  }

  const fetchQrCode = async (instOverride?: string) => {
    const inst = instOverride || selectedInstance || instanceId
    try {
      const res = await getEvolutionConnect(inst)
      if (res?.base64) setQrCode(res.base64)
      else if (res?.qrcode) setQrCode(res.qrcode)
    } catch {
      /* intentionally ignored */
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveWhatsappConfig({ api_url: apiUrl, instance_id: instanceId })
      toast({ title: 'Sucesso', description: 'Configurações salvas.' })
      checkStatus(instanceId)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {configs.length > 1 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 text-sm">
            <Shuffle className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Rodízio de Números Ativo:</strong> Você possui {configs.length} números
              cadastrados.
            </span>
          </div>
          <Button variant="outline" size="sm" asChild className="h-8 text-xs bg-white">
            <Link to="/dashboard/settings">
              Gerenciar Números <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Instância</CardTitle>
            <CardDescription>
              Configure a URL e o ID da instância do seu servidor Evolution API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API URL</Label>
              <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Instance ID</Label>
              <Input value={instanceId} onChange={(e) => setInstanceId(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Configurações
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/settings">Painel Completo de Rodízio</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Status da Conexão
              <Button variant="outline" size="icon" onClick={() => checkStatus()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Escaneie o QR Code para autenticar ou veja o status atual.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-3 w-3 rounded-full ${connStatus?.state === 'open' ? 'bg-green-500' : 'bg-red-500'}`}
                  />
                  <span className="font-medium text-lg">
                    {connStatus?.state === 'open'
                      ? 'Conectado'
                      : connStatus?.state === 'connecting'
                        ? 'Conectando...'
                        : 'Desconectado'}
                  </span>
                </div>
                {connStatus?.state !== 'open' && qrCode && (
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-border mt-4 flex flex-col items-center">
                    {qrCode.startsWith('data:image') ? (
                      <img src={qrCode} alt="QR Code" className="w-64 h-64 object-contain" />
                    ) : (
                      <QRCodeDisplay data={qrCode} size={256} />
                    )}
                    <p className="text-sm text-muted-foreground mt-4">Escaneie com o WhatsApp</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
