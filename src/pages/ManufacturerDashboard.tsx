import { Navigate } from 'react-router-dom'
import useAuthStore from '@/stores/useAuthStore'
import { useManufacturerStore } from '@/stores/useManufacturerStore'
import { useState } from 'react'
import {
  Package,
  Settings,
  BarChart,
  ShoppingBag,
  Users,
  Bell,
  MessageSquare,
  Boxes,
  Bot,
} from 'lucide-react'
import { SettingsTab } from './manufacturer/SettingsTab'
import { ReportsTab } from './manufacturer/ReportsTab'
import { ProductsTab } from './manufacturer/ProductsTab'
import { InventoryTab } from './manufacturer/InventoryTab'
import { LoyaltyTab } from './manufacturer/LoyaltyTab'
import { CommunicationsTab } from './manufacturer/CommunicationsTab'
import { AICustomerServiceTab } from './manufacturer/AICustomerServiceTab'
import { cn } from '@/lib/utils'

export default function ManufacturerDashboard() {
  const { user } = useAuthStore()
  const { manufacturers } = useManufacturerStore()
  const [activeTab, setActiveTab] = useState('settings')

  // Fallback to 'm1' if manufacturerId is not set for demo purposes
  const mId = user?.manufacturerId || 'm1'
  const manufacturer = manufacturers.find((m) => m.id === mId)

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect if not a manufacturer
  if (user.type !== 'Lojista Fabricante') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Fabricante</h1>
          <p className="text-muted-foreground">Gerencie as operações da sua marca no atacado</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 lg:w-64 shrink-0">
          <nav className="flex flex-col gap-1">
            {[
              { id: 'settings', label: 'Configurações', icon: Settings },
              { id: 'reports', label: 'Relatórios', icon: BarChart },
              { id: 'products', label: 'Meus Produtos', icon: ShoppingBag },
              { id: 'inventory', label: 'Estoque', icon: Boxes },
              { id: 'loyalty', label: 'Fidelidade', icon: Users },
              { id: 'communications', label: 'Comunicados', icon: Bell },
              { id: 'ai-service', label: 'Atendimento IA', icon: Bot },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-hidden min-h-[500px]">
          {activeTab === 'settings' && <SettingsTab manufacturerId={mId} />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'products' && <ProductsTab manufacturerName={manufacturer?.name || ''} />}
          {activeTab === 'inventory' && (
            <InventoryTab manufacturerName={manufacturer?.name || ''} />
          )}
          {activeTab === 'loyalty' && <LoyaltyTab />}
          {activeTab === 'communications' && <CommunicationsTab />}
          {activeTab === 'ai-service' && <AICustomerServiceTab />}
        </main>
      </div>
    </div>
  )
}
