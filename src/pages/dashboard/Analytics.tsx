import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import AnalyticsTab from './components/AnalyticsTab'
import { Loader2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export default function DashboardAnalytics() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const records = await pb.collection('customers').getFullList({
        sort: '-created',
      })
      setCustomers(records)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('customers', loadData)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics de Captação</h1>
        <p className="text-muted-foreground">
          Monitoramento visual de origens, performance das lojas/marcas e volume de leads extraídos.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <AnalyticsTab customers={customers} />
      )}
    </div>
  )
}
