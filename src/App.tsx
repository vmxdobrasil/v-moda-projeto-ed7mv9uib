import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard, PublicRoute, ManufacturerGuard } from '@/components/AuthGuard'

// Existing Pages
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import ManufacturerLayout from '@/pages/manufacturer/Layout'
import ManufacturerDashboard from '@/pages/manufacturer/Dashboard'
import ManufacturerCatalog from '@/pages/manufacturer/Catalog'
import ManufacturerLeads from '@/pages/manufacturer/Leads'
import ManufacturerMessages from '@/pages/manufacturer/Messages'
import ManufacturerLogistics from '@/pages/manufacturer/Logistics'
import ManufacturerSettings from '@/pages/manufacturer/Settings'
import ManufacturerNegotiationHub from '@/pages/manufacturer/NegotiationHub'
import DashboardHub from '@/pages/dashboard/DashboardHub'
import DashboardLogistics from '@/pages/dashboard/Logistics'
import ManufacturersHub from '@/pages/dashboard/Manufacturers'
import VideoNegotiation from '@/pages/VideoNegotiation'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center animate-fade-in-up">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <div className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Esta seção do painel de administração está em desenvolvimento e será disponibilizada em
        breve.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route
                path="/forgot-password"
                element={<PlaceholderPage title="Recuperar Senha" />}
              />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Manufacturer Routes */}
            <Route element={<ManufacturerGuard />}>
              <Route path="/manufacturer" element={<ManufacturerLayout />}>
                <Route index element={<ManufacturerDashboard />} />
                <Route path="catalog" element={<ManufacturerCatalog />} />
                <Route path="leads" element={<ManufacturerLeads />} />
                <Route path="messages" element={<ManufacturerMessages />} />
                <Route path="logistics" element={<ManufacturerLogistics />} />
                <Route path="settings" element={<ManufacturerSettings />} />
                <Route path="negotiation/:customerId" element={<ManufacturerNegotiationHub />} />
              </Route>
            </Route>

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/negotiation/video/:sessionId" element={<VideoNegotiation />} />
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<DashboardHub />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />

                {/* Placeholder Routes for missing pages */}
                <Route path="customers" element={<PlaceholderPage title="Leads / Clientes" />} />
                <Route
                  path="customers/:id"
                  element={<PlaceholderPage title="Detalhes do Cliente" />}
                />
                <Route path="products" element={<PlaceholderPage title="Projetos" />} />
                <Route path="admin-products" element={<PlaceholderPage title="Admin Produtos" />} />
                <Route path="messages" element={<PlaceholderPage title="Mensagens" />} />
                <Route path="manufacturers" element={<ManufacturersHub />} />
                <Route path="affiliates" element={<PlaceholderPage title="Afiliados" />} />
                <Route path="magazine" element={<PlaceholderPage title="Revista" />} />
                <Route element={<ManufacturerGuard />}>
                  <Route path="logistics" element={<DashboardLogistics />} />
                </Route>
                <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
                <Route path="media-kit" element={<PlaceholderPage title="Media Kit" />} />
                <Route path="settings" element={<PlaceholderPage title="Configurações" />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
