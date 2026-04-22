import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { VideoCallListener } from '@/components/VideoCallListener'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppRouter } from '@/Router'
import { AuthProvider } from '@/hooks/use-auth'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <VideoCallListener />
              <AppRouter />
            </TooltipProvider>
          </FavoritesProvider>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
