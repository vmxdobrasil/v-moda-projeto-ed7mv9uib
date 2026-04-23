import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { VideoCallListener } from '@/components/VideoCallListener'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthProvider } from '@/hooks/use-auth'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard, PublicRoute } from '@/components/AuthGuard'

// Pages
import AdminLayout from '@/pages/admin/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import Customers from '@/pages/admin/Customers'
import Products from '@/pages/admin/Products'
import Login from '@/pages/Login'
import Index from '@/pages/Index'

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

              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<Login />} />
                </Route>

                <Route element={<AuthGuard />}>
                  <Route path="/" element={<Navigate to="/admin" replace />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="clientes" element={<Customers />} />
                    <Route path="produtos" element={<Products />} />
                    {/* Fallback for unhandled admin routes */}
                    <Route path="*" element={<Index />} />
                  </Route>
                </Route>

                {/* Catch all to redirect to root/dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
