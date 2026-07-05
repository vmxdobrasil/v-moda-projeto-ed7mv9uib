import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  fetchCrmMetrics,
  fetchFunnelData,
  fetchInteractions,
  type CrmMetrics,
  type FunnelStage,
  type Interaction,
} from '@/services/crm-data'
import { CrmMetricCards } from '@/components/crm/CrmMetricCards'
import { CrmFunnel } from '@/components/crm/CrmFunnel'
import { CrmInteractionGrid } from '@/components/crm/CrmInteractionGrid'

export default function CrmDashboard() {
  const [metrics, setMetrics] = useState<CrmMetrics | null>(null)
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [m, f, i] = await Promise.all([
        fetchCrmMetrics(),
        fetchFunnelData(),
        fetchInteractions(),
      ])
      setMetrics(m)
      setStages(f)
      setInteractions(i)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('customers', loadData)
  useRealtime('orders', loadData)
  useRealtime('leads_venda', loadData)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Painel CRM</h1>
        <p className="text-white/40 mt-1">Visão geral do ecossistema V MODA BRASIL</p>
      </div>

      <CrmMetricCards metrics={metrics} loading={loading} />
      <CrmFunnel stages={stages} loading={loading} />
      <CrmInteractionGrid interactions={interactions} loading={loading} />
    </div>
  )
}
