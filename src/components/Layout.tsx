import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { LiveChat } from './LiveChat'
import { trackEvent } from '@/lib/analytics'

export default function Layout() {
  const location = useLocation()

  // Scroll to top on route change and track page view
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    trackEvent('page_view', { page_path: location.pathname })
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <Header />
      <main className="flex-grow flex flex-col w-full animate-fade-in">
        <Outlet />
      </main>
      <Footer />
      <LiveChat />
    </div>
  )
}
