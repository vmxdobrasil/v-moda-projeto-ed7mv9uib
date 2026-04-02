import pb from '@/lib/pocketbase/client'

export interface WhatsappConfig {
  id?: string
  user: string
  api_url: string
  token?: string
  instance_id?: string
}

export interface WhatsappTemplate {
  id?: string
  user: string
  name: string
  trigger_event: 'welcome_message' | 'ranking_promotion' | 'benefit_alert'
  content: string
  is_active: boolean
}

export const getWhatsappTemplates = async (userId: string) => {
  return pb.collection('whatsapp_templates').getFullList<WhatsappTemplate>({
    filter: `user = "${userId}"`,
    sort: '-created',
  })
}

export const saveWhatsappTemplate = async (data: Partial<WhatsappTemplate>) => {
  if (data.id) {
    return pb.collection('whatsapp_templates').update(data.id, data)
  } else {
    return pb.collection('whatsapp_templates').create(data)
  }
}

export const deleteWhatsappTemplate = async (id: string) => {
  return pb.collection('whatsapp_templates').delete(id)
}

export const getWhatsappConfig = async (userId: string) => {
  try {
    return await pb
      .collection('whatsapp_configs')
      .getFirstListItem<WhatsappConfig>(`user = "${userId}"`)
  } catch (e) {
    return null
  }
}

export const saveWhatsappConfig = async (data: Partial<WhatsappConfig>) => {
  if (data.id) {
    return pb.collection('whatsapp_configs').update(data.id, data)
  } else {
    return pb.collection('whatsapp_configs').create(data)
  }
}

export const sendManualWhatsapp = async (customerId: string) => {
  return pb.send(`/backend/v1/whatsapp/notify/${customerId}`, { method: 'POST' })
}
