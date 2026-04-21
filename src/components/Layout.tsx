import { Outlet, useLocation, useSearchParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { LiveChat } from './LiveChat'
import { trackEvent } from '@/lib/analytics'
import useAuthStore from '@/stores/useAuthStore'
import { Gift } from 'lucide-react'
import { NotificationsBell } from './NotificationsBell'

export default function Layout() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isEmbed = searchParams.get('embed') === 'true'
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Scroll to top on route change and track page view
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    trackEvent('page_view', { page_path: location.pathname })
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      {!isEmbed && <Header />}
      <main className="flex-grow flex flex-col w-full animate-fade-in">
        <Outlet />
      </main>
      {!isEmbed && <Footer />}
      {!isEmbed && <LiveChat />}
      {isAuthenticated && !isEmbed && (
        <div className="fixed bottom-24 right-6 flex flex-col gap-4 items-end z-50 animate-fade-in-up">
          <NotificationsBell />
          <Link
            to="/beneficios"
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Gift className="w-5 h-5" />
            <span className="font-semibold hidden md:inline">Benefícios & CRM</span>
          </Link>
        </div>
      )}
    </div>
  )
}
