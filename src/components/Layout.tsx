import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

export default function Layout() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <Header />
      <main className="flex-grow flex flex-col w-full animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
