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
  trigger_event: 'welcome_message' | 'ranking_promotion' | 'benefit_alert' | 'reactivation_campaign'
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

export const getWhatsappConfigs = async (userId: string) => {
  return pb.collection('whatsapp_configs').getFullList<WhatsappConfig>({
    filter: `user = "${userId}"`,
    sort: '-created',
  })
}

export const deleteWhatsappConfig = async (id: string) => {
  return pb.collection('whatsapp_configs').delete(id)
}

export const saveWhatsappConfig = async (data: Partial<WhatsappConfig>) => {
  if (data.id) {
    return pb.collection('whatsapp_configs').update(data.id, data)
  } else {
    return pb.collection('whatsapp_configs').create(data)
  }
}

export const sendManualWhatsapp = async (customerId: string) => {
  if (!pb.authStore.isValid || !pb.authStore.token) {
    throw new Error('Sessão expirada. Por favor, faça login novamente para enviar mensagens.')
  }
  return pb.send(`/backend/v1/whatsapp/notify/${customerId}`, { method: 'POST' })
}

export const sendReactivationCampaign = async (customerIds: string[]) => {
  if (!pb.authStore.isValid || !pb.authStore.token) {
    throw new Error('Sessão expirada. Por favor, faça login novamente para enviar mensagens.')
  }
  return pb.send('/backend/v1/whatsapp/reactivate', {
    method: 'POST',
    body: JSON.stringify({ customerIds }),
    headers: { 'Content-Type': 'application/json' },
  })
}
