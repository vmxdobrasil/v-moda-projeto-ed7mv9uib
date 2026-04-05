import pb from '@/lib/pocketbase/client'

export interface WhatsappTemplate {
  id: string
  user: string
  name: string
  trigger_event: 'welcome_message' | 'ranking_promotion' | 'benefit_alert' | 'reactivation_campaign'
  content: string
  is_active: boolean
  created: string
  updated: string
}

export const getTemplates = async (userId: string) => {
  return pb.collection('whatsapp_templates').getFullList<WhatsappTemplate>({
    filter: `user = "${userId}"`,
    sort: '-created',
  })
}

export const saveTemplate = async (data: Partial<WhatsappTemplate>) => {
  if (data.id) {
    return pb.collection('whatsapp_templates').update<WhatsappTemplate>(data.id, data)
  }
  return pb.collection('whatsapp_templates').create<WhatsappTemplate>(data)
}

export const deleteTemplate = async (id: string) => {
  return pb.collection('whatsapp_templates').delete(id)
}
