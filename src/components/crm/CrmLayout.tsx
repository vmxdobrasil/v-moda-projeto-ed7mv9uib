import { Outlet } from 'react-router-dom'
import { GlassSidebar } from '@/components/crm/GlassSidebar'
import { GlassHeader } from '@/components/crm/GlassHeader'
import { ClientInsightPanel } from '@/components/crm/ClientInsightPanel'
import { BreadcrumbNav } from '@/components/dashboard/BreadcrumbNav'

export function CrmLayout() {
  return (
    <div className="crm-page-bg min-h-screen p-4 flex gap-4">
      <GlassSidebar />
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <GlassHeader />
        <BreadcrumbNav className="px-2 text-white/60" />
        <div className="flex gap-4 flex-1 min-h-0">
          <main className="flex-1 overflow-y-auto crm-content-scroll pr-1">
            <Outlet />
          </main>
          <ClientInsightPanel />
        </div>
      </div>
    </div>
  )
}
