import pb from '@/lib/pocketbase/client'

export interface ActionExecution {
  id: string
  insight?: string
  admin_user?: string
  service_provider: 'firebase_fcm' | 'asaas_api' | 'whatsapp_evolution' | 'email'
  status: 'pending' | 'success' | 'failed'
  payload?: any
  response_log?: any
  created: string
  updated: string
}

export const createActionExecution = (data: Partial<ActionExecution>) =>
  pb.collection('action_executions').create<ActionExecution>(data)
