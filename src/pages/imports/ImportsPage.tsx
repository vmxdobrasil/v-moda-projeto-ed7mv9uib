import { useState, useEffect } from 'react'
import { Upload, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ImportLeadsDialog from '@/pages/dashboard/components/ImportLeadsDialog'
import ImportHistoryTab from '@/pages/dashboard/components/ImportHistoryTab'
import pb from '@/lib/pocketbase/client'

export default function ImportsPage() {
  const [importOpen, setImportOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = pb.authStore.record?.id
        if (!userId) return
        try {
          const sub = await pb.collection('subscriptions').getFirstListItem(`user = "${userId}"`)
          setSubscription(sub)
        } catch {
          /* intentionally ignored */
        }
        try {
          const res = await pb.collection('customers').getList(1, 1, {
            filter: `manufacturer = "${userId}"`,
          })
          setCustomerCount(res.totalItems)
        } catch {
          /* intentionally ignored */
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadData()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in-up p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-navy dark:text-white">
            Importação de Leads
          </h1>
          <p className="text-muted-foreground mt-2">
            Importe seus leads em massa a partir de um arquivo CSV e acompanhe o histórico de
            importações.
          </p>
        </div>
        <Button
          onClick={() => setImportOpen(true)}
          className="gap-2"
          size="lg"
          disabled={isImporting}
        >
          <Upload className="w-5 h-5" />
          Importar Dados
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Histórico de Importações
        </h2>
        <ImportHistoryTab />
      </div>

      <ImportLeadsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportStateChange={setIsImporting}
        onImportComplete={() => {}}
        subscription={subscription}
        customerCount={customerCount}
      />
    </div>
  )
}
