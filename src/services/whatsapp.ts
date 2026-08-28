import pb from '@/lib/pocketbase/client'

export interface WhatsappConfig {
  id?: string
  user?: string
  api_url?: string
  token?: string
  instance_id?: string
}

export interface WhatsappTemplate {
  id?: string
  user?: string
  name: string
  trigger_event: 'welcome_message' | 'ranking_promotion' | 'benefit_alert' | 'reactivation_campaign'
  content: string
  is_active: boolean
}

export const getWhatsappConfigs = () =>
  pb.collection('whatsapp_configs').getFullList({ sort: '-created' })

export const getWhatsappConfig = async (userId?: string): Promise<WhatsappConfig | null> => {
  try {
    const filter = userId ? `user = "${userId}"` : ''
    const configs = await pb.collection('whatsapp_configs').getFullList({
      filter,
      sort: '-created',
    })
    return (configs[0] as unknown as WhatsappConfig) || null
  } catch {
    return null
  }
}

export const getWhatsappTemplates = async (userId?: string): Promise<WhatsappTemplate[]> => {
  try {
    const filter = userId ? `user = "${userId}"` : ''
    const tpls = await pb.collection('whatsapp_templates').getFullList({
      filter,
      sort: '-created',
    })
    return tpls as unknown as WhatsappTemplate[]
  } catch {
    return []
  }
}

export const saveWhatsappTemplate = async (
  data: Partial<WhatsappTemplate>,
): Promise<WhatsappTemplate> => {
  if (data.id) {
    const res = await pb.collection('whatsapp_templates').update(data.id, data)
    return res as unknown as WhatsappTemplate
  }
  const res = await pb
    .collection('whatsapp_templates')
    .create({ ...data, user: pb.authStore.record?.id })
  return res as unknown as WhatsappTemplate
}

export const saveWhatsappConfig = async (data: any) => {
  const configs = await getWhatsappConfigs()
  if (configs.length > 0) {
    return pb.collection('whatsapp_configs').update(configs[0].id, data)
  } else {
    return pb.collection('whatsapp_configs').create({ ...data, user: pb.authStore.record?.id })
  }
}

export const getEvolutionStatus = async (instance?: string) => {
  const url = instance
    ? `/backend/v1/evolution_api/status?instance=${instance}`
    : `/backend/v1/evolution_api/status`
  return pb.send(url, { method: 'GET' })
}

export const getEvolutionConnect = async (instance?: string) => {
  const url = instance
    ? `/backend/v1/evolution_api/connect?instance=${instance}`
    : `/backend/v1/evolution_api/connect`
  return pb.send(url, { method: 'GET' })
}

export const sendWhatsappMessage = async (phone: string, message: string, instance_id?: string) => {
  return pb.send('/backend/v1/evolution_api/send', {
    method: 'POST',
    body: JSON.stringify({ phone, message, instance_id }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getTemplates = () =>
  pb.collection('whatsapp_templates').getFullList({ sort: '-created' })

export const createTemplate = (data: any) =>
  pb.collection('whatsapp_templates').create({ ...data, user: pb.authStore.record?.id })

export const updateTemplate = (id: string, data: any) =>
  pb.collection('whatsapp_templates').update(id, data)

export const deleteTemplate = (id: string) => pb.collection('whatsapp_templates').delete(id)
