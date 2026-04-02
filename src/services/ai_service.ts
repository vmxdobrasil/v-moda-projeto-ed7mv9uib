import pb from '@/lib/pocketbase/client'

export interface Channel {
  id: string
  name: string
  type: 'whatsapp' | 'instagram' | 'email'
  status: boolean
  created: string
}

export interface Message {
  id: string
  channel: string
  sender_id: string
  sender_name: string
  content: string
  direction: 'inbound' | 'outbound'
  ai_suggested_reply: string
  status: 'pending' | 'replied' | 'archived'
  created: string
  expand?: {
    channel?: Channel
  }
}

export const getChannels = () => pb.collection('channels').getFullList<Channel>({ sort: 'created' })

export const updateChannel = (id: string, data: Partial<Channel>) =>
  pb.collection('channels').update<Channel>(id, data)

export const getMessages = () =>
  pb.collection('messages').getFullList<Message>({ sort: 'created', expand: 'channel' })

export const sendMessage = (data: Partial<Message>) =>
  pb.collection('messages').create<Message>(data)

export const updateMessage = (id: string, data: Partial<Message>) =>
  pb.collection('messages').update<Message>(id, data)

export const getAiSuggestion = async (message: string) => {
  const res = await pb.send('/backend/v1/ai-assistant', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  })
  return res as { suggested_reply: string }
}
