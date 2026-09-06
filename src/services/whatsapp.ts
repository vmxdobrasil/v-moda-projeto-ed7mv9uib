import pb from '@/lib/pocketbase/client'

export interface WhatsappConfig {
  id?: string
  user?: string
  api_url?: string
  token?: string
  instance_id?: string
  label?: string
  phone_number?: string
  is_active?: boolean
  throttle_interval_sec?: number
  last_used_at?: string
  created?: string
  updated?: string
}

export interface WhatsappTemplate {
  id?: string
  user?: string
  name: string
  trigger_event: 'welcome_message' | 'ranking_promotion' | 'benefit_alert' | 'reactivation_campaign'
  content: string
  is_active: boolean
}

export const getWhatsappConfigs = async (userId?: string): Promise<WhatsappConfig[]> => {
  try {
    const filter = userId ? `user = "${userId}"` : ''
    const configs = await pb.collection('whatsapp_configs').getFullList({
      filter,
      sort: '-created',
    })
    return configs as unknown as WhatsappConfig[]
  } catch {
    return []
  }
}

export const getWhatsappConfig = async (userId?: string): Promise<WhatsappConfig | null> => {
  try {
    const configs = await getWhatsappConfigs(userId)
    return configs[0] || null
  } catch {
    return null
  }
}

export const createWhatsappConfig = async (
  data: Partial<WhatsappConfig>,
): Promise<WhatsappConfig> => {
  const currentUserId = pb.authStore.record?.id
  const payload = {
    ...data,
    user: data.user || currentUserId,
    is_active: data.is_active !== undefined ? data.is_active : true,
    throttle_interval_sec: data.throttle_interval_sec || 8,
  }
  const res = await pb.collection('whatsapp_configs').create(payload)
  return res as unknown as WhatsappConfig
}

export const updateWhatsappConfig = async (
  id: string,
  data: Partial<WhatsappConfig>,
): Promise<WhatsappConfig> => {
  const res = await pb.collection('whatsapp_configs').update(id, data)
  return res as unknown as WhatsappConfig
}

export const deleteWhatsappConfig = async (id: string): Promise<boolean> => {
  return pb.collection('whatsapp_configs').delete(id)
}

// Mantido para compatibilidade com telas legadas que salvam a primeira config
export const saveWhatsappConfig = async (data: any) => {
  const configs = await getWhatsappConfigs()
  if (configs.length > 0 && configs[0].id) {
    return pb.collection('whatsapp_configs').update(configs[0].id, data)
  } else {
    return pb.collection('whatsapp_configs').create({
      ...data,
      user: pb.authStore.record?.id,
      is_active: true,
      throttle_interval_sec: 8,
    })
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

export const getEvolutionStatus = async (instance?: string) => {
  const url = instance
    ? `/backend/v1/evolution_api/status?instance=${encodeURIComponent(instance)}`
    : `/backend/v1/evolution_api/status`
  return pb.send(url, { method: 'GET' })
}

export const getEvolutionConnect = async (instance?: string) => {
  const url = instance
    ? `/backend/v1/evolution_api/connect?instance=${encodeURIComponent(instance)}`
    : `/backend/v1/evolution_api/connect`
  return pb.send(url, { method: 'GET' })
}

export const disconnectEvolutionInstance = async (instance?: string) => {
  return pb.send('/backend/v1/evolution_api/logout', {
    method: 'POST',
    body: JSON.stringify({ instance }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export interface SendWhatsappMessageOptions {
  phone: string
  message: string
  instance_id?: string
  config_id?: string
}

export const sendWhatsappMessage = async (
  phoneOrOptions: string | SendWhatsappMessageOptions,
  message?: string,
  instance_id?: string,
) => {
  let body: any
  if (typeof phoneOrOptions === 'object') {
    body = phoneOrOptions
  } else {
    body = {
      phone: phoneOrOptions,
      message,
      instance_id,
    }
  }

  return pb.send('/backend/v1/evolution_api/send', {
    method: 'POST',
    body: JSON.stringify(body),
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
