import pb from '@/lib/pocketbase/client'

export const getWhatsappConfigs = () =>
  pb.collection('whatsapp_configs').getFullList({ sort: '-created' })

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
