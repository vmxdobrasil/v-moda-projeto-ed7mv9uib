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
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import DashboardHub from '@/pages/dashboard/DashboardHub'
import Customers from '@/pages/dashboard/CRM'
import CustomerDetails from '@/pages/dashboard/CustomerDetails'
import Projects from '@/pages/dashboard/Projects'
import Login from '@/pages/Login'
import Messages from '@/pages/dashboard/Messages'
import Settings from '@/pages/dashboard/Settings'
import Manufacturers from '@/pages/dashboard/Manufacturers'
import Affiliates from '@/pages/dashboard/Affiliates'
import Magazine from '@/pages/dashboard/Magazine'
import Logistics from '@/pages/dashboard/Logistics'
import Analytics from '@/pages/dashboard/Analytics'
import MediaKit from '@/pages/dashboard/MediaKit'

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
                  <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                </Route>

                <Route element={<AuthGuard />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHub />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="customers/:id" element={<CustomerDetails />} />
                    <Route path="products" element={<Projects />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="manufacturers" element={<Manufacturers />} />
                    <Route path="affiliates" element={<Affiliates />} />
                    <Route path="magazine" element={<Magazine />} />
                    <Route path="logistics" element={<Logistics />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="media-kit" element={<MediaKit />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>

                {/* Catch all unmatched routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TooltipProvider>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
