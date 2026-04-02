import pb from '@/lib/pocketbase/client'

export interface WhatsappConfig {
  id?: string
  user: string
  api_url: string
  token?: string
  instance_id?: string
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
