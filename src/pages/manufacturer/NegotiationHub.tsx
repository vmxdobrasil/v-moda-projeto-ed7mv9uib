import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Video, Send, Bot, PhoneCall, ArrowLeft } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ManufacturerNegotiationHub() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [customer, setCustomer] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (customerId) {
      loadCustomer()
    }
  }, [customerId])

  const loadCustomer = async () => {
    try {
      const data = await pb.collection('customers').getOne(customerId!)
      setCustomer(data)
      loadMessages(data)
      loadSessions(data)
    } catch (err) {
      toast.error('Customer not found')
    }
  }

  const loadMessages = async (cust: any) => {
    try {
      const phoneFilter = cust.phone ? `sender_id = "${cust.phone}"` : `sender_id = "UNKNOWN"`
      const nameFilter = `sender_name = "${cust.name}"`
      const filter = `(${phoneFilter} || ${nameFilter})`

      const msgs = await pb.collection('messages').getFullList({
        filter,
        sort: 'created',
      })
      setMessages(msgs)
    } catch (err) {
      console.error(err)
    }
  }

  const loadSessions = async (cust: any) => {
    try {
      const sess = await pb.collection('video_sessions').getFullList({
        filter: `room_name ~ "${cust.name}"`,
        sort: '-created',
      })
      setSessions(sess)
    } catch (err) {
      console.error(err)
    }
  }

  useRealtime('messages', () => {
    if (customer) loadMessages(customer)
  })

  useRealtime('video_sessions', () => {
    if (customer) loadSessions(customer)
  })

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !customer) return

    try {
      const channels = await pb.collection('channels').getFullList()
      const channelId = channels.length > 0 ? channels[0].id : null

      if (!channelId) {
        toast.error('No communication channel configured.')
        return
      }

      await pb.collection('messages').create({
        channel: channelId,
        sender_id: customer.phone || customer.id,
        sender_name: customer.name,
        content: replyText,
        direction: 'outbound',
        status: 'replied',
      })
      setReplyText('')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const startVideoSession = async () => {
    if (!customer) return
    try {
      let participantId = ''
      const emailToSearch = customer.email || `retailer_${customer.id}@vmoda.com`

      try {
        const users = await pb
          .collection('users')
          .getFullList({ filter: `email = "${emailToSearch}"` })
        if (users.length > 0) {
          participantId = users[0].id
        }
      } catch {
        /* intentionally ignored */
      }

      if (!participantId) {
        const dummyUser = await pb.collection('users').create({
          email: emailToSearch,
          password: 'Skip@Pass123',
          passwordConfirm: 'Skip@Pass123',
          name: customer.name,
          role: 'retailer',
          is_verified: true,
        })
        participantId = dummyUser.id
      }

      await pb.collection('video_sessions').create({
        host: user?.id,
        participant: participantId,
        status: 'pending',
        room_name: `Negotiation with ${customer.name}`,
      })

      toast.success('Video session created!')
    } catch (err) {
      toast.error('Failed to start video session')
    }
  }

  if (!customer) return <div className="p-8">Loading...</div>

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col animate-fade-in-up max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Negotiation Hub</h2>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span>{customer.name}</span>
              <Badge variant="outline" className="capitalize">
                {customer.status || 'New'}
              </Badge>
              {customer.ranking_category && (
                <Badge variant="secondary" className="capitalize">
                  {customer.ranking_category.replace('_', ' ')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="chat"
        className="flex-1 flex flex-col min-h-0 overflow-hidden bg-card border rounded-lg shadow-sm"
      >
        <div className="border-b px-4 py-2 bg-muted/20">
          <TabsList>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Real-time Chat
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="w-4 h-4" /> Video Room
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="chat"
          className="flex-1 flex flex-col m-0 p-0 outline-none overflow-hidden"
        >
          <ScrollArea className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex flex-col gap-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  No messages yet. Send a message to start the negotiation.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg p-3 text-sm shadow-sm',
                        msg.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground ml-auto rounded-tr-sm'
                          : 'bg-card border rounded-tl-sm',
                      )}
                    >
                      <div className="font-semibold text-xs opacity-70 mb-1">
                        {msg.sender_name || 'Customer'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={cn(
                          'text-[10px] mt-2 opacity-70',
                          msg.direction === 'outbound' ? 'text-right' : 'text-left',
                        )}
                      >
                        {new Date(msg.created).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {msg.direction === 'inbound' &&
                      msg.ai_suggested_reply &&
                      msg.status === 'pending' && (
                        <div className="mt-2 self-start w-[80%]">
                          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900 text-sm">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium mb-2 text-xs">
                              <Bot size={14} /> AI Suggested Reply
                            </div>
                            <p
                              className="text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                              onClick={() => setReplyText(msg.ai_suggested_reply)}
                              title="Click to apply this suggestion"
                            >
                              {msg.ai_suggested_reply}
                            </p>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="mt-3 h-7 text-xs"
                              onClick={() => setReplyText(msg.ai_suggested_reply)}
                            >
                              Apply AI Suggestion
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-card">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message to the retailer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!replyText.trim()}>
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="video" className="flex-1 p-6 m-0 outline-none overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-primary" />
                  Start Video Negotiation
                </CardTitle>
                <CardDescription>
                  Invite {customer.name} to a secure video room to showcase products and close the
                  deal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={startVideoSession} className="w-full sm:w-auto">
                  <Video className="w-4 h-4 mr-2" /> Create Video Session
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Session History</h3>
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No video sessions created yet.</p>
              ) : (
                sessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-medium">{session.room_name}</div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <span>Created: {new Date(session.created).toLocaleString()}</span>
                          <Badge
                            variant={
                              session.status === 'active'
                                ? 'default'
                                : session.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="ml-2"
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        {(session.status === 'pending' || session.status === 'active') && (
                          <Button onClick={() => navigate(`/negotiation/video/${session.id}`)}>
                            Join Video Room
                          </Button>
                        )}
                        {session.status === 'ended' && session.negotiation_notes && (
                          <Button
                            variant="outline"
                            onClick={() => toast.info(session.negotiation_notes)}
                          >
                            View Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
