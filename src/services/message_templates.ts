import pb from '@/lib/pocketbase/client'

export interface MessageTemplate {
  id: string
  name: string
  content: string
  channel_type: 'email' | 'whatsapp' | 'instagram'
  category: 'initial_pitch' | 'follow_up' | 'partnership_details' | 'closure'
  created: string
  updated: string
}

export const getMessageTemplates = async () => {
  return pb.collection('message_templates').getFullList<MessageTemplate>({ sort: '-created' })
}
