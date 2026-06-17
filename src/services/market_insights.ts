import pb from '@/lib/pocketbase/client'

export interface MarketInsight {
  id: string
  entity_type: 'brand' | 'product' | 'region'
  entity_id: string
  insight_type: 'low_conversion' | 'stock_out_risk' | 'trending_up' | 'performance_alert'
  score?: number
  suggested_action?: string
  is_resolved?: boolean
  created: string
  updated: string
}

export const getMarketInsights = () =>
  pb.collection('market_insights').getFullList<MarketInsight>({
    sort: '-created',
  })

export const updateMarketInsight = (id: string, data: Partial<MarketInsight>) =>
  pb.collection('market_insights').update<MarketInsight>(id, data)
