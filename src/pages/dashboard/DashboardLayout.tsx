import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
