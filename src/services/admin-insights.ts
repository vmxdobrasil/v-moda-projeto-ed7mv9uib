import pb from '@/lib/pocketbase/client'

export async function getDashboardStats() {
  const [logsCount, pendingInsights, allExecutions, successExecutions] = await Promise.all([
    pb.collection('user_behavior_logs').getList(1, 1),
    pb.collection('market_insights').getList(1, 1, { filter: 'is_resolved = false' }),
    pb.collection('action_executions').getList(1, 1),
    pb.collection('action_executions').getList(1, 1, { filter: "status = 'success'" }),
  ])

  const successRate =
    allExecutions.totalItems > 0
      ? Math.round((successExecutions.totalItems / allExecutions.totalItems) * 100)
      : 0

  return {
    totalInteractions: logsCount.totalItems,
    pendingInsights: pendingInsights.totalItems,
    executionSuccessRate: successRate,
  }
}

export async function getRecentLogs(limit = 50) {
  return pb.collection('user_behavior_logs').getList(1, limit, {
    sort: '-created',
    expand: 'user',
  })
}

export async function getPendingInsightsList() {
  return pb.collection('market_insights').getFullList({
    filter: 'is_resolved = false',
    sort: '-score,-created',
  })
}

export async function resolveInsight(id: string) {
  return pb.collection('market_insights').update(id, { is_resolved: true })
}

export async function createActionExecution(insightId: string, provider: string, adminId: string) {
  return pb.collection('action_executions').create({
    insight: insightId,
    admin_user: adminId,
    service_provider: provider,
    status: 'pending',
  })
}
