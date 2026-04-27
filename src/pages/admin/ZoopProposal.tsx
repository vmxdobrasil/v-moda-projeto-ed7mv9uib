import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Store,
  Users,
  Globe,
  ShieldCheck,
  ArrowRightLeft,
  TrendingUp,
  CreditCard,
  Copy,
  FileText,
  Check,
  Download,
  Loader2,
  GraduationCap,
  Truck,
  ShoppingCart,
  PieChart,
  Cpu,
  Mail,
  Send,
  X,
  AlertCircle,
  MessageCircle,
  Instagram,
} from 'lucide-react'

declare global {
  interface Window {
    html2pdf: any
  }
}

type RecipientOption = {
  id: string
  label: string
  email: string
  phone: string
  instagram: string
  group: string
}

const proposalText = `Proposta Estratégica: Zoop + V MODA Brasil

Fase Atual: Build-up (Tecnologia pronta, aguardando integração financeira).

A Importância da Zoop (Embedded Finance):
1. Conciliação Bancária Automatizada: Backbone financeiro para baixar transações sem controle manual, garantindo escalabilidade operacional.
2. Split de Pagamentos: Roteamento inteligente na fonte. Liquidação para fabricantes, afiliados (guias) e V MODA (Take Rate).

Mercado & Audiência:
- Fabricantes: +16.000 (Goiânia: 44/Fama) com expansão para Brás e Bom Retiro (SP).
- Lojistas/Revendedoras: Base potencial de +5.000.000 em todo o país.

Módulos do Ecossistema:
- Marketplace B2B: Catálogo atacadista com estoque em tempo real.
- Hub Logístico: Integração de transportadoras e caravanas.
- V MODA Academy: Capacitação para a base de revendedoras.

Oportunidades (Business):
- Receita via Take Rate transacional.
- Oferta de crédito B2B e antecipação de recebíveis (CréditoModa).
- Roll-out Nacional para novos polos têxteis.

Stack Tecnológica: Vite, React, TypeScript, TailwindCSS e Skip Cloud.`

export default function ZoopProposal() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Send Modal State
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<RecipientOption[]>([])
  const [options, setOptions] = useState<RecipientOption[]>([])
  const [isSending, setIsSending] = useState(false)

  // Channel State
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'instagram'>('email')

  // Templates State
  const [subject, setSubject] = useState('Proposta Estratégica: Zoop + V MODA Brasil')
  const [emailMessage, setEmailMessage] = useState(
    'Olá,\n\nSegue em anexo a proposta estratégica de parceria entre a V MODA Brasil e a Zoop.\n\nFicamos à disposição para agendar uma reunião de alinhamento.\n\nAtenciosamente,\nEquipe V MODA Brasil',
  )
  const [whatsappMessage, setWhatsappMessage] = useState(
    'Olá! 🚀\n\nTemos uma proposta estratégica de parceria entre a V MODA Brasil e a Zoop que vai revolucionar o mercado atacadista.\n\nDá uma olhada no resumo e vamos agendar um bate-papo!',
  )
  const [instagramMessage, setInstagramMessage] = useState(
    'Olá! 🚀 Temos uma proposta estratégica incrível entre a V MODA Brasil e a Zoop. Gostaria de apresentar os detalhes. Podemos agendar uma call?',
  )

  // Real-time Delivery Feedback
  useRealtime('messages', (e) => {
    if (
      e.action === 'update' &&
      (e.record.status === 'replied' || e.record.status === 'archived')
    ) {
      toast({
        title: 'Status da Mensagem Atualizado',
        description: `A mensagem para ${e.record.sender_name} foi marcada como ${e.record.status}.`,
      })
    }
  })

  useEffect(() => {
    async function loadOptions() {
      try {
        const m = await pb.collection('users').getFullList({ filter: 'role="manufacturer"' })
        const c = await pb.collection('customers').getFullList()
        const opts: RecipientOption[] = [
          {
            id: 'zoop',
            label: 'Comercial Zoop',
            email: 'comercial@zoop.com.br',
            phone: '11999999999',
            instagram: 'zoop',
            group: 'Parceiros',
          },
        ]
        m.forEach((x) => {
          opts.push({
            id: x.id,
            label: x.name || 'Sem nome',
            email: x.email || '',
            phone: '',
            instagram: '',
            group: 'Fabricantes',
          })
        })
        c.forEach((x: any) => {
          opts.push({
            id: x.id,
            label: x.name || 'Sem nome',
            email: x.email || '',
            phone: x.phone || '',
            instagram: x.instagram_handle || '',
            group: 'Leads/Clientes',
          })
        })
        setOptions(opts)
      } catch (e) {
        console.error(e)
      }
    }
    if (sendModalOpen && options.length === 0) {
      loadOptions()
    }
  }, [sendModalOpen, options.length])

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalText)
    setCopied(true)
    toast({
      title: 'Texto copiado!',
      description: 'Proposta copiada para a área de transferência.',
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const loadHtml2Pdf = async () => {
    if (!window.html2pdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src =
          'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
  }

  const preparePdfOpt = (element: HTMLElement) => {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '0'
    container.style.left = '-9999px'
    container.style.width = '800px'

    const clone = element.cloneNode(true) as HTMLElement
    clone.style.display = 'block'
    container.appendChild(clone)
    document.body.appendChild(container)

    const opt = {
      margin: [15, 0, 15, 0],
      filename: 'Proposta_Zoop_VMODA.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    return { opt, clone, container }
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      await loadHtml2Pdf()
      const element = document.getElementById('proposal-pdf-content')
      if (!element) throw new Error('Element not found')

      const { opt, clone, container } = preparePdfOpt(element)
      await window.html2pdf().set(opt).from(clone).save()
      document.body.removeChild(container)

      toast({ title: 'PDF Gerado!', description: 'O download foi iniciado com sucesso.' })
    } catch (error) {
      toast({
        title: 'Erro ao gerar PDF',
        description: 'Falha ao processar o documento.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const getOrCreateChannel = async (type: 'email' | 'whatsapp' | 'instagram') => {
    try {
      const channels = await pb
        .collection('channels')
        .getFullList({ filter: `type="${type}"`, requestKey: null })
      if (channels.length > 0) return channels[0]
      return await pb
        .collection('channels')
        .create({ name: `Canal ${type.toUpperCase()}`, type, status: true })
    } catch (e) {
      console.error('Error getting channel:', e)
      return null
    }
  }

  const logMessage = async (
    channelId: string,
    content: string,
    recipientId: string,
    recipientName: string,
  ) => {
    try {
      await pb.collection('messages').create({
        channel: channelId,
        sender_id: recipientId || 'unknown',
        sender_name: recipientName || 'Desconhecido',
        content,
        direction: 'outbound',
        status: 'replied',
      })
    } catch (e) {
      console.error('Failed to log message:', e)
    }
  }

  const handleSendEmail = async () => {
    const validRecipients = selectedRecipients.filter((r) => r.email)
    if (validRecipients.length === 0) {
      return toast({
        title: 'Erro',
        description: 'Nenhum destinatário com e-mail válido selecionado.',
        variant: 'destructive',
      })
    }
    if (!subject) {
      return toast({
        title: 'Erro',
        description: 'O assunto é obrigatório.',
        variant: 'destructive',
      })
    }

    setIsSending(true)
    try {
      await loadHtml2Pdf()
      const element = document.getElementById('proposal-pdf-content')
      if (!element) throw new Error('Element not found')

      const { opt, clone, container } = preparePdfOpt(element)
      const pdfBase64 = await window.html2pdf().set(opt).from(clone).outputPdf('datauristring')
      document.body.removeChild(container)

      const emails = validRecipients.map((r) => r.email)

      await pb.send('/backend/v1/send-proposal', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          message: emailMessage,
          recipients: emails,
          pdfBase64,
        }),
      })

      const channelRecord = await getOrCreateChannel('email')
      if (channelRecord) {
        for (const rec of validRecipients) {
          await logMessage(channelRecord.id, emailMessage, rec.id, rec.label)
        }
      }

      toast({
        title: 'Enviado com Sucesso!',
        description: `Proposta enviada para ${emails.length} destinatário(s) por e-mail.`,
      })
      setSendModalOpen(false)
      setSelectedRecipients([])
      setSubject('Proposta Estratégica: Zoop + V MODA Brasil')
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Falha ao processar o envio.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSendWhatsApp = async (rec: RecipientOption) => {
    if (!rec.phone) return
    const text = encodeURIComponent(whatsappMessage + '\n\n' + proposalText)
    const url = `https://wa.me/${rec.phone.replace(/\D/g, '')}?text=${text}`
    window.open(url, '_blank')

    const channelRecord = await getOrCreateChannel('whatsapp')
    if (channelRecord) {
      await logMessage(channelRecord.id, whatsappMessage, rec.id, rec.label)
    }
  }

  const handleOpenInstagram = async (rec: RecipientOption) => {
    if (!rec.instagram) return
    navigator.clipboard.writeText(instagramMessage + '\n\n' + proposalText)
    toast({ title: 'Texto Copiado!', description: 'Cole o resumo na DM do Instagram.' })

    const handle = rec.instagram.replace('@', '')
    window.open(`https://instagram.com/${handle}`, '_blank')

    const channelRecord = await getOrCreateChannel('instagram')
    if (channelRecord) {
      await logMessage(channelRecord.id, instagramMessage, rec.id, rec.label)
    }
  }

  const toggleRecipient = (rec: RecipientOption) => {
    setSelectedRecipients((prev) =>
      prev.some((r) => r.id === rec.id) ? prev.filter((r) => r.id !== rec.id) : [...prev, rec],
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 via-background to-primary/5 border rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
              Parceria Estratégica
            </Badge>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
              Fase: Build-up
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            V MODA <span className="text-muted-foreground font-normal">x</span> Zoop
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Visão executiva do ecossistema e escalabilidade financeira. A Zoop como backbone para
            viabilizar Conciliação Bancária Automatizada e Split de Pagamentos.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex flex-col gap-3 w-full sm:w-auto min-w-[200px]">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="w-5 h-5" />
                  Enviar Proposta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Enviar Proposta Estratégica</DialogTitle>
                  <DialogDescription>
                    Selecione o canal de comunicação e os destinatários para o envio.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Destinatários</Label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between h-auto min-h-[40px] px-3 py-2 text-left font-normal"
                        >
                          <div className="flex flex-wrap gap-1">
                            {selectedRecipients.length === 0 && (
                              <span className="text-muted-foreground">
                                Selecione ou digite contatos...
                              </span>
                            )}
                            {selectedRecipients.map((rec) => (
                              <Badge key={rec.id} variant="secondary" className="mr-1 mb-1">
                                {rec.label}
                                <button
                                  type="button"
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleRecipient(rec)
                                  }}
                                >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Buscar contatos..."
                            value={inputValue}
                            onValueChange={setInputValue}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {inputValue.length > 2 ? (
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm font-normal px-2 py-1.5 h-auto"
                                  onClick={() => {
                                    const isEmail = inputValue.includes('@')
                                    const newRec: RecipientOption = {
                                      id: `custom-${Date.now()}`,
                                      label: inputValue,
                                      email: isEmail ? inputValue : '',
                                      phone: !isEmail ? inputValue.replace(/\D/g, '') : '',
                                      instagram: !isEmail ? inputValue : '',
                                      group: 'Custom',
                                    }
                                    setSelectedRecipients([...selectedRecipients, newRec])
                                    setInputValue('')
                                    setOpenCombobox(false)
                                  }}
                                >
                                  Adicionar "{inputValue}"
                                </Button>
                              ) : (
                                'Nenhum contato encontrado.'
                              )}
                            </CommandEmpty>
                            {['Parceiros', 'Fabricantes', 'Leads/Clientes'].map((group) => {
                              const groupOpts = options.filter((o) => o.group === group)
                              if (groupOpts.length === 0) return null
                              return (
                                <CommandGroup key={group} heading={group}>
                                  {groupOpts.map((opt) => (
                                    <CommandItem
                                      key={opt.id}
                                      onSelect={() => {
                                        if (!selectedRecipients.some((r) => r.id === opt.id)) {
                                          setSelectedRecipients([...selectedRecipients, opt])
                                        }
                                        setInputValue('')
                                        setOpenCombobox(false)
                                      }}
                                    >
                                      {opt.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )
                            })}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label>Canal de Envio</Label>
                    <RadioGroup
                      value={channel}
                      onValueChange={(v) => setChannel(v as any)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="c-email" />
                        <Label htmlFor="c-email" className="flex items-center cursor-pointer">
                          <Mail className="w-4 h-4 mr-1.5 text-slate-500" /> E-mail
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="whatsapp" id="c-whatsapp" />
                        <Label htmlFor="c-whatsapp" className="flex items-center cursor-pointer">
                          <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-500" /> WhatsApp
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="instagram" id="c-instagram" />
                        <Label htmlFor="c-instagram" className="flex items-center cursor-pointer">
                          <Instagram className="w-4 h-4 mr-1.5 text-pink-500" /> Instagram Direct
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {channel === 'email' && (
                    <div className="space-y-4 border-t pt-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label>Assunto</Label>
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Mensagem</Label>
                        <Textarea
                          rows={5}
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                        />
                      </div>
                      {selectedRecipients.length > 0 &&
                        selectedRecipients.some((r) => !r.email) && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Atenção</AlertTitle>
                            <AlertDescription>
                              Alguns contatos selecionados não possuem E-mail cadastrado e serão
                              ignorados.
                            </AlertDescription>
                          </Alert>
                        )}
                    </div>
                  )}

                  {channel === 'whatsapp' && (
                    <div className="space-y-4 border-t pt-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label>Mensagem Inicial (WhatsApp)</Label>
                        <Textarea
                          rows={4}
                          value={whatsappMessage}
                          onChange={(e) => setWhatsappMessage(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          O resumo estratégico em texto será anexado automaticamente.
                        </p>
                      </div>

                      {selectedRecipients.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <Label>Ações de Envio</Label>
                          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                            {selectedRecipients.map((rec) => (
                              <div
                                key={rec.id}
                                className="flex items-center justify-between p-3 border rounded-md shadow-sm"
                              >
                                <div className="flex flex-col truncate pr-4">
                                  <span className="text-sm font-medium truncate">{rec.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.phone || 'Sem telefone'}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
                                  disabled={!rec.phone}
                                  onClick={() => handleSendWhatsApp(rec)}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Enviar
                                </Button>
                              </div>
                            ))}
                          </div>
                          {selectedRecipients.some((r) => !r.phone) && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Atenção</AlertTitle>
                              <AlertDescription>
                                Alguns contatos não possuem telefone cadastrado.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {channel === 'instagram' && (
                    <div className="space-y-4 border-t pt-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label>Mensagem Inicial (Direct)</Label>
                        <Textarea
                          rows={4}
                          value={instagramMessage}
                          onChange={(e) => setInstagramMessage(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          O resumo completo será copiado para sua área de transferência.
                        </p>
                      </div>

                      {selectedRecipients.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <Label>Ações de Envio</Label>
                          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                            {selectedRecipients.map((rec) => (
                              <div
                                key={rec.id}
                                className="flex items-center justify-between p-3 border rounded-md shadow-sm"
                              >
                                <div className="flex flex-col truncate pr-4">
                                  <span className="text-sm font-medium truncate">{rec.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {rec.instagram || 'Sem @ do Instagram'}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  className="shrink-0 bg-pink-600 hover:bg-pink-700"
                                  disabled={!rec.instagram}
                                  onClick={() => handleOpenInstagram(rec)}
                                >
                                  <Instagram className="w-4 h-4 mr-2" />
                                  Copiar & Abrir
                                </Button>
                              </div>
                            ))}
                          </div>
                          {selectedRecipients.some((r) => !r.instagram) && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Atenção</AlertTitle>
                              <AlertDescription>
                                Alguns contatos não possuem @ do Instagram cadastrado.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSendModalOpen(false)}>
                    {channel === 'email' ? 'Cancelar' : 'Fechar'}
                  </Button>
                  {channel === 'email' && (
                    <Button onClick={handleSendEmail} disabled={isSending}>
                      {isSending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSending ? 'Enviando...' : 'Enviar E-mails'}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              size="lg"
              variant="default"
              className="w-full gap-2 shadow-lg"
              onClick={generatePDF}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isGenerating ? 'Processando...' : 'Baixar PDF'}
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="w-full gap-2 bg-background/50">
                <FileText className="w-5 h-5" />
                Copiar Resumo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Resumo Estratégico (Zoop)</DialogTitle>
                <DialogDescription>
                  Texto formatado e condensado para envio a stakeholders.
                </DialogDescription>
              </DialogHeader>
              <div className="relative mt-4">
                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap font-mono text-muted-foreground border h-80 overflow-y-auto">
                  {proposalText}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-6 h-8 gap-1.5 shadow-sm border"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar Texto'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 h-auto p-1 gap-1 bg-muted/50">
          <TabsTrigger value="overview" className="py-3 text-sm">
            Visão Geral & Zoop
          </TabsTrigger>
          <TabsTrigger value="market" className="py-3 text-sm">
            Mercado & Audiência
          </TabsTrigger>
          <TabsTrigger value="modules" className="py-3 text-sm">
            Módulos Core
          </TabsTrigger>
          <TabsTrigger value="business" className="py-3 text-sm">
            Oportunidades
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral & Zoop */}
        <TabsContent value="overview" className="mt-6 space-y-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-t-4 border-t-blue-600 shadow-sm">
              <CardHeader>
                <ShieldCheck className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Conciliação Bancária Automatizada</CardTitle>
                <CardDescription>A Zoop como backbone financeiro e operacional</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed">
                A integração com a Zoop elimina atritos e o controle manual de boletos e
                transferências. Ao atuar como gateway financeiro, garantimos a baixa automática para
                todas as transações B2B, permitindo escalar o negócio com total transparência e sem
                gargalos de conciliação diária.
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-indigo-500 shadow-sm">
              <CardHeader>
                <ArrowRightLeft className="w-8 h-8 text-indigo-500 mb-2" />
                <CardTitle>Split de Pagamentos</CardTitle>
                <CardDescription>Roteamento inteligente e escalável na fonte</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed">
                Nossa arquitetura multiplataforma exige um Split de Pagamentos transparente. A cada
                transação, a Zoop cuidará da liquidação instantânea e distribuição automática:
                repasse imediato aos <strong>fabricantes</strong>, comissionamento de{' '}
                <strong>afiliados/agentes</strong>, e a retenção do <strong>Take Rate</strong> da
                plataforma.
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 text-slate-50 border-slate-800 shadow-lg">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
              <CardTitle className="text-slate-100">Fase de Build-Up & Escalabilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed text-sm">
                O ecossistema V MODA encontra-se em um estágio estratégico de "build-up". A
                infraestrutura de front-end (Vite, React, Tailwind) e back-end (Skip Cloud) já está
                madura. O acoplamento com os SDKs e APIs da Zoop é o último passo fundamental para
                destrancar a engrenagem e absorver de imediato a demanda financeira bilionária do
                mercado atacadista.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mercado & Audiência */}
        <TabsContent value="market" className="mt-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader>
                <Store className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle className="text-2xl">16.000+</CardTitle>
                <CardDescription className="font-bold text-foreground">
                  Fabricantes em Goiânia
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Concentração massiva e comprovada no Polo da Região da 44 e Fama (GO), garantindo
                onboarding veloz e catálogo B2B imediato.
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500 shadow-sm">
              <CardHeader>
                <Globe className="w-8 h-8 text-violet-500 mb-2" />
                <CardTitle className="text-2xl">Mapeados</CardTitle>
                <CardDescription className="font-bold text-foreground">
                  Brás e Bom Retiro (SP)
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Mapeamento ativo para integrar milhares de fabricantes adicionais nos maiores hubs
                têxteis de confecção atacadista de São Paulo.
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
              <CardHeader>
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400">
                  5.000.000+
                </CardTitle>
                <CardDescription className="font-bold text-foreground">
                  Lojistas e Revendedoras
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Audiência alvo massiva nacional. Público que demanda e atua como uma força de vendas
                descentralizada, necessitando de crédito e parcelamento unificado.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Módulos Core */}
        <TabsContent value="modules" className="mt-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <ShoppingCart className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Marketplace B2B</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Catálogo atacadista online com gestão de estoque em tempo real. O verdadeiro hub que
                conecta as confecções parceiras aos revendedores de todo o Brasil.
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <Truck className="w-8 h-8 text-amber-500 mb-2" />
                <CardTitle>Hub Logístico</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Gestão centralizada de fretes, connecting a inteligência de envio com as
                transportadoras locais e "caravanas" de ônibus que cruzam o país.
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <GraduationCap className="w-8 h-8 text-indigo-500 mb-2" />
                <CardTitle>V MODA Academy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Portal E-learning dedicado à capacitação. Qualifica lojistas e treina novos agentes
                e afiliados para expandirem a rede orgânica da V MODA.
              </CardContent>
            </Card>

            <Card className="md:col-span-3 shadow-sm bg-muted/30">
              <CardHeader>
                <Cpu className="w-6 h-6 text-slate-500 mb-2" />
                <CardTitle>Stack Tecnológica Pronta e Auditável</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Toda a infraestrutura já está funcional. Desenvolvido com{' '}
                <strong>Vite, React, TypeScript, TailwindCSS</strong> e apoiado pelo robusto{' '}
                <strong>Skip Cloud</strong>, garantindo Motor de Regras de Acesso (RLS) estrito a
                nível de banco de dados. Estamos preparados para iniciar o acoplamento seguro via
                Webhooks e APIs REST da Zoop.
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Oportunidades */}
        <TabsContent value="business" className="mt-6 animate-fade-in">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-t-4 border-t-primary shadow-sm">
              <CardHeader>
                <PieChart className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Take Rate (Fee)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                A principal fonte de monetização atrelada ao sucesso das vendas B2B. A plataforma
                reterá um percentual sobre todo o Volume Bruto de Mercadorias (GMV) transacionado.
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 shadow-sm">
              <CardHeader>
                <CreditCard className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle>Crédito B2B</CardTitle>
                <CardDescription>Embedded Finance</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ponto focal de inovação ("CréditoModa"): concessão de limites de crédito
                customizados para alavancar a revenda de lojistas e soluções de antecipação de
                recebíveis (FIDC) para fabricantes.
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-emerald-500 shadow-sm">
              <CardHeader>
                <Globe className="w-8 h-8 text-emerald-500 mb-2" />
                <CardTitle>Expansão Nacional</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Um ecossistema concebido digital-first que permite plugar novos polos de moda e hubs
                têxteis em todo território nacional sem gargalos operacionais massivos.
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Hidden PDF Content */}
      <div id="proposal-pdf-content" style={{ display: 'none' }}>
        <div className="w-[800px] p-10 bg-white text-slate-900 font-sans mx-auto">
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">V MODA Brasil</h1>
              <p className="text-xl text-slate-500 mt-1">Parceria Estratégica com Zoop</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 border border-slate-300 rounded text-xs uppercase tracking-widest font-bold text-slate-600">
                Uso Interno
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="bg-slate-100 border-l-4 border-blue-600 p-5 mb-8 rounded-r-lg">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-2">
              Fase de Build-Up & Escalabilidade
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              O ecossistema V MODA encontra-se em um estágio de "build-up". A infraestrutura
              tecnológica front-end e back-end está madura e pronta para capturar o massivo market
              share do setor atacadista assim que a integração financeira (Zoop) for implementada.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              A Zoop como Backbone Financeiro
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Conciliação Bancária Automatizada</h4>
                <p className="text-sm text-slate-600">
                  Elimina o controle manual de operações diárias, garantindo baixa automática de
                  recebíveis e suporte a um alto volume transacional sem atritos operacionais.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Split de Pagamentos</h4>
                <p className="text-sm text-slate-600">
                  Roteamento na fonte que viabiliza repasses automáticos de liquidez aos{' '}
                  <strong>fabricantes</strong>, comissionamento imediato para{' '}
                  <strong>afiliados/guias</strong>, e retenção inteligente do{' '}
                  <strong>Take Rate</strong> da V MODA.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Mercado & Audiência Alvo
            </h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                <p className="text-3xl font-black text-slate-900 mb-1">16.000+</p>
                <p className="font-bold text-slate-800 text-sm">Fabricantes (Goiânia)</p>
                <p className="text-xs text-slate-600 mt-2">Polo da 44 e Região da Fama.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                <p className="text-3xl font-black text-slate-900 mb-1">Brás & Bom Retiro</p>
                <p className="font-bold text-slate-800 text-sm">Expansão de Hubs (SP)</p>
                <p className="text-xs text-slate-600 mt-2">Mapeamento em andamento.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 text-center">
                <p className="text-3xl font-black text-emerald-700 mb-1">5.000.000+</p>
                <p className="font-bold text-emerald-900 text-sm">Lojistas & Revendedoras</p>
                <p className="text-xs text-emerald-700 mt-2">Público-alvo ativo em todo o país.</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Módulos Core Funcionais
            </h2>
            <ul className="space-y-3 text-slate-700 text-sm">
              <li>
                <strong>• Marketplace B2B:</strong> Catálogo consolidado com gestão de estoque em
                tempo real ligando fabricantes a compradores.
              </li>
              <li>
                <strong>• Hub Logístico:</strong> Integração tecnológica com transportadoras e
                caravanas de excursões de compras atacadistas.
              </li>
              <li>
                <strong>• V MODA Academy:</strong> Portal de e-learning para captação e
                profissionalização de afiliados/agentes parceiros do ecossistema.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 border-b pb-2">
              Oportunidades de Monetização & Negócio
            </h2>
            <ul className="space-y-3 text-slate-700 text-sm">
              <li>
                <strong>• Take Rate (Revenue Core):</strong> Cobrança de percentual (fee) sobre todo
                o GMV transacionado que atravessa a plataforma.
              </li>
              <li>
                <strong>• Embedded Finance (CréditoModa):</strong> Limites de crédito pré-aprovados
                para lojistas alavancarem suas compras e antecipação de liquidez para fabricantes.
              </li>
              <li>
                <strong>• Escala Nacional:</strong> Modelo arquitetado para adoção rápida
                (plug-and-play) em novos polos atacadistas do Brasil.
              </li>
            </ul>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-slate-100 text-center">
            <div className="inline-block bg-slate-900 text-white px-6 py-4 rounded-xl">
              <p className="text-lg font-bold">V MODA Brasil</p>
              <p className="text-sm text-slate-300 mt-1">Contato Estratégico e Parcerias</p>
              <p className="text-sm text-slate-400 mt-2 font-mono">
                contato@vmoda.com.br | www.vmoda.com.br
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
