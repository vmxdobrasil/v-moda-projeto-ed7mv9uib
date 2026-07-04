import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/AppSidebar'
import { Header } from '@/components/Header'

export default function ManufacturerLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/30">
        <Header />
        <div className="flex flex-1 pt-20">
          <AppSidebar />
          <SidebarInset className="flex flex-col min-h-screen">
            <header className="sticky top-20 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
              <SidebarTrigger />
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-8 bg-muted/10 relative">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function ManufacturerLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/30">
        <Header />
        <div className="flex flex-1 pt-20">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mb-4 md:hidden">
              <SidebarTrigger />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
