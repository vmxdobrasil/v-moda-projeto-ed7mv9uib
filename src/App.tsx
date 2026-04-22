import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { VideoCallListener } from '@/components/VideoCallListener'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/Router'
import { AuthProvider } from '@/hooks/use-auth'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <FavoritesProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <VideoCallListener />
              <AppRouter />
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
