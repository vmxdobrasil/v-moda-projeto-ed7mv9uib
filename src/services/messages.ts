import pb from '@/lib/pocketbase/client'

export const logMessage = async (data: {
  channel: string
  sender_id: string
  content: string
  direction: 'inbound' | 'outbound'
  status: 'pending' | 'replied' | 'archived'
}) => {
  return pb.collection('messages').create(data)
}

export const getChannels = async () => {
  return pb.collection('channels').getFullList({ filter: 'type = "whatsapp"' })
}

export const ensureWhatsappChannel = async () => {
  const channels = await getChannels()
  if (channels.length > 0) return channels[0].id

  const newChannel = await pb.collection('channels').create({
    name: 'WhatsApp Principal',
    type: 'whatsapp',
    status: true,
  })
  return newChannel.id
}
