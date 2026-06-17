import pb from '@/lib/pocketbase/client'

export interface UserBehaviorLog {
  id: string
  user: string
  action_type: string
  metadata: any
  path: string
  device_info: any
  created: string
  updated: string
  expand?: { user?: any }
}

export interface MarketInsight {
  id: string
  entity_type: string
  entity_id: string
  insight_type: string
  score: number
  suggested_action: string
  is_resolved: boolean
  created: string
  updated: string
}

export interface ActionExecution {
  id: string
  insight: string
  admin_user: string
  service_provider: string
  status: string
  payload: any
  response_log: any
  created: string
  updated: string
  expand?: { insight?: MarketInsight; admin_user?: any }
}

export const getBehaviorLogs = async (page = 1, perPage = 50) => {
  return pb.collection('user_behavior_logs').getList<UserBehaviorLog>(page, perPage, {
    sort: '-created',
    expand: 'user',
  })
}

export const getMarketInsights = async (page = 1, perPage = 50, filter = '') => {
  return pb.collection('market_insights').getList<MarketInsight>(page, perPage, {
    sort: '-created',
    filter,
  })
}

export const getActionExecutions = async (page = 1, perPage = 50) => {
  return pb.collection('action_executions').getList<ActionExecution>(page, perPage, {
    sort: '-created',
    expand: 'insight,admin_user',
  })
}

export const getInsightsStats = async () => {
  const logsRes = await pb.collection('user_behavior_logs').getList(1, 1, { requestKey: null })
  const pendingInsightsRes = await pb
    .collection('market_insights')
    .getList(1, 1, { filter: 'is_resolved = false', requestKey: null })
  const totalExecsRes = await pb.collection('action_executions').getList(1, 1, { requestKey: null })
  const successExecsRes = await pb
    .collection('action_executions')
    .getList(1, 1, { filter: 'status = "success"', requestKey: null })

  return {
    totalInteractions: logsRes.totalItems,
    pendingInsights: pendingInsightsRes.totalItems,
    totalExecutions: totalExecsRes.totalItems,
    successExecutions: successExecsRes.totalItems,
  }
}

export const resolveInsight = async (id: string) => {
  return pb.collection('market_insights').update(id, { is_resolved: true })
}

export const createActionExecution = async (data: Partial<ActionExecution>) => {
  return pb.collection('action_executions').create(data)
}
