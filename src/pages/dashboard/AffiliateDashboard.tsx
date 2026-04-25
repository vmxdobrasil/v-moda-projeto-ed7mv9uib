import { useState, useEffect } from 'react'
import { getReferrals, type Referral } from '@/services/referrals'
import { getReferredCustomers, type Customer } from '@/services/customers'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Navigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgentOverview } from './components/AgentOverview'
import { AgentCustomers } from './components/AgentCustomers'

export default function AffiliateDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const isAdmin = user?.email === 'valterpmendonca@gmail.com' || user?.role === 'admin'

  const loadData = async () => {
    try {
      const [refData, custData] = await Promise.all([getReferrals(), getReferredCustomers()])
      setReferrals(refData)
      setCustomers(custData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('referrals', () => loadData())
  useRealtime('customers', () => loadData())

  if (user?.role !== 'affiliate' && !isAdmin) {
    return <Navigate to="/" replace />
  }

  const affiliateLink = `${window.location.origin}/?ref=${user?.affiliate_code || ''}`

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    toast({ title: 'Link de agente copiado!' })
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-fade-in">
        Carregando painel do agente...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Agente Credenciado</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho, gerencie sua carteira de clientes e comissões.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral & Comissões</TabsTrigger>
          <TabsTrigger value="customers">Meus Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-0">
          <AgentOverview
            user={user}
            referrals={referrals}
            customers={customers}
            onCopy={handleCopy}
            copied={copied}
          />
        </TabsContent>
        <TabsContent value="customers" className="mt-0">
          <AgentCustomers />
        </TabsContent>
      </Tabs>
    </div>
  )
}
