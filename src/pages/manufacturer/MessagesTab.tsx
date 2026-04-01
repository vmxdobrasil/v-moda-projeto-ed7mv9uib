import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Search, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  text: string
  sender: 'me' | 'them'
  time: string
}

interface Chat {
  id: string
  resellerName: string
  unread: number
  messages: ChatMessage[]
}

const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    resellerName: 'Boutique Elegance',
    unread: 2,
    messages: [
      {
        id: 'm1',
        text: 'Olá, gostaria de saber se a nova coleção já está disponível para pedido.',
        sender: 'them',
        time: '10:30',
      },
      { id: 'm2', text: 'Bom dia! Sim, já liberamos no catálogo.', sender: 'me', time: '10:35' },
      {
        id: 'm3',
        text: 'Perfeito, vou fazer o pedido agora. Qual o prazo de entrega?',
        sender: 'them',
        time: '10:36',
      },
      { id: 'm4', text: 'Para o seu CEP, cerca de 5 dias úteis.', sender: 'me', time: '10:40' },
      { id: 'm5', text: 'Obrigada!', sender: 'them', time: '10:45' },
    ],
  },
  {
    id: 'c2',
    resellerName: 'Studio Moda',
    unread: 0,
    messages: [
      { id: 'm1', text: 'Tive um problema com o pedido #1024', sender: 'them', time: 'Ontem' },
      { id: 'm2', text: 'Olá! Poderia me passar mais detalhes?', sender: 'me', time: 'Ontem' },
    ],
  },
]

export function MessagesTab() {
  const [activeChatId, setActiveChatId] = useState<string>(MOCK_CHATS[0].id)
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS)
  const [newMessage, setNewMessage] = useState('')

  const activeChat = chats.find((c) => c.id === activeChatId)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          messages: [
            ...chat.messages,
            {
              id: Date.now().toString(),
              text: newMessage,
              sender: 'me',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }
      }
      return chat
    })

    setChats(updatedChats)
    setNewMessage('')
  }

  const handleSelectChat = (id: string) => {
    setActiveChatId(id)
    setChats(chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-card overflow-hidden animate-in fade-in">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/3 border-r flex flex-col bg-muted/20">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." className="pl-9 bg-background" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {chats.map((chat) => {
                const lastMsg = chat.messages[chat.messages.length - 1]
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={cn(
                      'flex items-start gap-3 p-4 text-left transition-colors border-b hover:bg-muted/50',
                      activeChatId === chat.id ? 'bg-muted' : '',
                    )}
                  >
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {chat.resellerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm truncate">{chat.resellerName}</span>
                        <span className="text-xs text-muted-foreground">{lastMsg.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lastMsg.text}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        {activeChat ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b flex items-center gap-3 bg-card">
              <Avatar className="w-10 h-10 border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {activeChat.resellerName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{activeChat.resellerName}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> Revendedor Verificado
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'max-w-[80%] rounded-lg p-3 text-sm',
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground self-end rounded-tr-sm'
                        : 'bg-muted self-start rounded-tl-sm',
                    )}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={cn(
                        'text-[10px] mt-1 block opacity-70',
                        msg.sender === 'me' ? 'text-right' : 'text-left',
                      )}
                    >
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Selecione uma conversa para começar
          </div>
        )}
      </div>
    </div>
  )
}
