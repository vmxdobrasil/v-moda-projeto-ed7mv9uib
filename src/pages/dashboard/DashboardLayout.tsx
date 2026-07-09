import { useEffect, useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { BreadcrumbNav } from '@/components/dashboard/BreadcrumbNav'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalLeads: 0 })
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    async function loadStats() {
      try {
        // High-performance limit:1 query correctly avoids the
        // DashboardLayout getFullList OOM bug on 31,000+ leads
        const res = await pb.collection('customers').getList(1, 1, {
          fields: 'id',
        })
        setStats({ totalLeads: res.totalItems })
      } catch (err) {
        console.error('Failed to load stats', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (location.pathname === '/') {
    return <Navigate to="/customers" replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
          <SidebarTrigger />
          <BreadcrumbNav className="flex-1 min-w-0" />
          <div className="hidden md:flex items-center gap-2 text-sm shrink-0">
            <span className="text-muted-foreground">Leads:</span>
            <span className="font-medium text-foreground">{stats.totalLeads}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground hidden sm:block truncate max-w-[150px]">
              {user?.name || user?.email}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-muted/10 relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
