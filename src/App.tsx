import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom'
import {
  AuthGuard,
  PublicRoute,
  ManufacturerGuard,
  AdminGuard,
  CrmGuard,
  RetailerGuard,
  AgentGuard,
  AgentOrTransporterGuard,
} from '@/components/AuthGuard'
import { AiAssistantProvider, LiveChat } from '@/components/LiveChat'
import { PublicLayout } from '@/components/PublicLayout'
import { PwaProvider } from '@/components/pwa/PwaProvider'
import { PwaUpdateBanner } from '@/components/pwa/PwaUpdateBanner'
import { PwaOnboarding } from '@/components/pwa/PwaOnboarding'
import { RootRoute } from '@/components/RootRoute'
import ProfilePage from '@/pages/dashboard/Profile'
import AdminSubscriptions from '@/pages/admin/AdminSubscriptions'
import AdminImportLogs from '@/pages/admin/AdminImportLogs'
import AdminAgents from '@/pages/admin/AdminAgents'

// Normalize backend API calls to use absolute URL and prevent returning HTML
const originalFetch = window.fetch
window.fetch = async (input, init) => {
  let urlStr = ''
  if (typeof input === 'string') {
    urlStr = input
  } else if (input instanceof URL) {
    urlStr = input.toString()
  } else if (input instanceof Request) {
    urlStr = input.url
  }

  if (urlStr.startsWith('/api/') || urlStr.startsWith('/backend/')) {
    const absoluteUrl = `${import.meta.env.VITE_POCKETBASE_URL}${urlStr}`
    if (typeof input === 'string' || input instanceof URL) {
      input = absoluteUrl
    } else if (input instanceof Request) {
      input = new Request(absoluteUrl, input)
    }
  }
  return originalFetch(input, init)
}

// Existing Pages
import Index from '@/pages/Index'
import DashboardLayout from '@/pages/dashboard/DashboardLayout'
import ManufacturerLayout from '@/pages/manufacturer/Layout'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminTopBrands from '@/pages/admin/AdminTopBrands'
import AdminManufacturers from '@/pages/admin/AdminManufacturers'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminCategories from '@/pages/admin/AdminCategories'
import AdminMarketing from '@/pages/admin/AdminMarketing'
import AdminPricing from '@/pages/admin/AdminPricing'
import AdminCatalog from '@/pages/admin/AdminCatalog'
import AdminManufacturerCRM from '@/pages/admin/AdminManufacturerCRM'
import Customers from '@/pages/admin/Customers'
import ManufacturerDashboard from '@/pages/manufacturer/Dashboard'
import ManufacturerCRM from '@/pages/manufacturer/ManufacturerCRM'
import ManufacturerCatalog from '@/pages/manufacturer/Catalog'
import ManufacturerLeads from '@/pages/manufacturer/Leads'
import ManufacturerMessages from '@/pages/manufacturer/Messages'
import ManufacturerLogistics from '@/pages/manufacturer/Logistics'
import ManufacturerSettings from '@/pages/manufacturer/Settings'
import ManufacturerTeam from '@/pages/manufacturer/Team'
import ManufacturerNegotiationHub from '@/pages/manufacturer/NegotiationHub'

import Signup from '@/pages/Signup'
import JoinGuide from '@/pages/join/Guide'
import JoinInfluencer from '@/pages/join/Influencer'
import JoinAgent from '@/pages/join/Agent'
import AdminLayout from '@/pages/admin/AdminLayout'
import AdminCRMGlobal from '@/pages/admin/AdminCRMGlobal'
import AdminCommissions from '@/pages/admin/Commissions'
import AdminInsights from '@/pages/admin/AdminInsights'
import AdminPartners from '@/pages/admin/Partners'
import ZoopProposal from '@/pages/admin/ZoopProposal'
import DashboardHub from '@/pages/dashboard/DashboardHub'
import DashboardLogistics from '@/pages/dashboard/Logistics'
import DashboardCustomers from '@/pages/dashboard/Customers'
import DashboardAnalytics from '@/pages/dashboard/Analytics'
import ManufacturersHub from '@/pages/dashboard/Manufacturers'
import CustomerDetails from '@/pages/dashboard/CustomerDetails'
import AffiliateDashboard from '@/pages/dashboard/AffiliateDashboard'
import GuiaDeModa from '@/pages/GuiaDeModa'
import AgentDashboard from '@/pages/agent/AgentDashboard'
import AdminVClub from '@/pages/admin/AdminVClub'
import ManufacturerVClub from '@/pages/manufacturer/ManufacturerVClub'
import VClubWallet from '@/pages/dashboard/VClubWallet'
import DashboardProjects from '@/pages/dashboard/Projects'
import Resources from '@/pages/dashboard/Resources'
import Magazine from '@/pages/dashboard/Magazine'
import VideoNegotiation from '@/pages/VideoNegotiation'
import WhatsappSettings from '@/pages/dashboard/WhatsappSettings'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import VallenIA from '@/pages/dashboard/VallenIA'
import SalesMachine from '@/pages/dashboard/SalesMachine'
import RevendaDashboard from '@/pages/dashboard/RevendaDashboard'
import Academy from '@/pages/dashboard/Academy'
import VallenConsultora from '@/pages/dashboard/VallenConsultora'
import AdminZones from '@/pages/admin/AdminZones'
import AdminFinance from '@/pages/admin/AdminFinance'
import AdminInfluencers from '@/pages/admin/AdminInfluencers'
import AdminNotifications from '@/pages/admin/AdminNotifications'
import LojasFabricantes from '@/pages/LojasFabricantes'
import RetailerLanding from '@/pages/RetailerLanding'
import RetailerOnboarding from '@/pages/RetailerOnboarding'
import AdminGeographic from '@/pages/admin/AdminGeographic'
import Empreenda from '@/pages/Empreenda'
import ResellerDashboard from '@/pages/dashboard/ResellerDashboard'
import AdminResellers from '@/pages/admin/AdminResellers'
import { StoreManagement } from '@/components/manufacturer/StoreManagement'
import useCartStore from '@/stores/useCartStore'
import RetailCRM from '@/pages/dashboard/RetailCRM'
import ConsultantCRM from '@/pages/dashboard/ConsultantCRM'
import InventoryManagement from '@/pages/dashboard/InventoryManagement'
import { trackEvent } from '@/lib/tracking'
import { captureAffiliateRef } from '@/lib/affiliate-tracking'

import Catalog from '@/pages/Catalog'
import CartPage from '@/pages/Cart'
import OrderView from '@/pages/OrderView'
import SellerOrders from '@/pages/dashboard/SellerOrders'
import { ShoppingCart } from 'lucide-react'
import CRMHub from '@/pages/CRMHub'
import TopMarcas from '@/pages/TopMarcas'
import GuiaCompras from '@/pages/GuiaCompras'
import LogisticaTransportadoras from '@/pages/LogisticaTransportadoras'
import FinanceiroHub from '@/pages/FinanceiroHub'

function FloatingCart() {
  const items = useCartStore((state) => state.items)
  if (items.length === 0) return null
  return (
    <Link
      to="/cart"
      className="fixed bottom-24 md:bottom-6 right-6 z-50 bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center animate-fade-in-up"
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
        {items.length}
      </span>
    </Link>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center animate-fade-in-up">
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <div className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        Esta seção do sistema está em desenvolvimento e será disponibilizada em breve.
      </p>
    </div>
  )
}

function AppRoot() {
  return (
    <PwaProvider>
      <Outlet />
      <LiveChat />
      <PwaUpdateBanner />
      <PwaOnboarding />
    </PwaProvider>
  )
}

export default function App() {
  useEffect(() => {
    captureAffiliateRef()
    const handleBeforeUnload = () => {
      const cartItems = useCartStore.getState().items
      if (cartItems.length > 0 && !window.location.pathname.includes('/finalizar-compra')) {
        const cartValue = cartItems.reduce((acc, item) => {
          return acc + item.product.price * item.quantity
        }, 0)

        trackEvent(
          'abandoned_cart',
          {
            itemsCount: cartItems.length,
            cartValue,
          },
          true,
        )
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <AiAssistantProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <FloatingCart />

            <Routes>
              {/* Routes with LiveChat */}
              <Route element={<AppRoot />}>
                {/* Public Auth Routes */}
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/join/guide" element={<JoinGuide />} />
                  <Route path="/join/influencer" element={<JoinInfluencer />} />
                  <Route path="/join/agent" element={<JoinAgent />} />
                  <Route path="customers/:id" element={<CustomerDetails />} />{' '}
                  <Route path="/admin/login" element={<Login />} />
                </Route>

                {/* Public Marketing Pages */}
                <Route element={<PublicLayout />}>
                  <Route index element={<RootRoute />} />
                  <Route path="colecoes" element={<Catalog />} />
                  <Route path="lojas-fabricantes" element={<LojasFabricantes />} />
                  <Route path="central-de-abastecimento" element={<RetailerLanding />} />
                  <Route path="guia-de-moda" element={<GuiaDeModa />} />
                  <Route path="conhecimento" element={<PlaceholderPage title="Conhecimento" />} />
                  <Route path="revista" element={<Magazine />} />
                  <Route path="sobre-nos" element={<PlaceholderPage title="Sobre Nós" />} />
                  <Route path="contato" element={<PlaceholderPage title="Contato" />} />
                  <Route path="revenda" element={<RetailerLanding />} />
                  <Route path="empreenda" element={<Empreenda />} />
                  <Route path="faq" element={<PlaceholderPage title="FAQ" />} />
                  <Route path="favoritos" element={<PlaceholderPage title="Lista de Desejos" />} />
                  <Route
                    path="finalizar-compra"
                    element={<PlaceholderPage title="Finalizar Compra" />}
                  />
                  <Route path="orders/view/:id" element={<OrderView />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="top-marcas" element={<TopMarcas />} />
                  <Route path="guia-compras" element={<GuiaCompras />} />
                </Route>

                {/* Manufacturer Routes */}
                <Route element={<ManufacturerGuard />}>
                  <Route path="/manufacturer" element={<ManufacturerLayout />}>
                    <Route index element={<ManufacturerDashboard />} />
                    <Route path="catalog" element={<ManufacturerCatalog />} />
                    <Route path="stores" element={<StoreManagement />} />
                    <Route path="leads" element={<ManufacturerLeads />} />
                    <Route path="messages" element={<ManufacturerMessages />} />
                    <Route path="logistics" element={<ManufacturerLogistics />} />
                    <Route path="settings" element={<ManufacturerSettings />} />
                    <Route path="team" element={<ManufacturerTeam />} />
                    <Route path="v-club" element={<ManufacturerVClub />} />
                    <Route path="crm" element={<ManufacturerCRM />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route
                      path="negotiation/:customerId"
                      element={<ManufacturerNegotiationHub />}
                    />
                  </Route>
                </Route>

                {/* Protected Dashboard/User Pages */}
                <Route element={<AuthGuard />}>
                  <Route path="/onboarding" element={<RetailerOnboarding />} />
                  <Route path="/negotiation/video/:sessionId" element={<VideoNegotiation />} />

                  {/* Wrapped inside DashboardLayout to keep sidebar/header */}
                  <Route path="/" element={<DashboardLayout />}>
                    <Route path="dashboard" element={<DashboardAnalytics />} />
                    <Route path="perfil" element={<ProfilePage />} />
                    <Route path="meus-pedidos" element={<PlaceholderPage title="Meus Pedidos" />} />
                    <Route path="vallen-ia" element={<VallenIA />} />
                    <Route path="maquina-vendas" element={<SalesMachine />} />
                    <Route path="customers" element={<DashboardCustomers />} />
                    <Route path="customers/:id" element={<CustomerDetails />} />
                    <Route path="products" element={<DashboardProjects />} />
                    <Route
                      path="admin-products"
                      element={<PlaceholderPage title="Admin Produtos" />}
                    />
                    <Route path="messages" element={<PlaceholderPage title="Mensagens" />} />
                    <Route path="manufacturers" element={<ManufacturersHub />} />
                    <Route path="affiliates" element={<AffiliateDashboard />} />
                    <Route path="agente" element={<AgentDashboard />} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="analytics" element={<DashboardAnalytics />} />
                    <Route path="v-club" element={<VClubWallet />} />
                    <Route path="media-kit" element={<PlaceholderPage title="Media Kit" />} />
                    <Route path="revenda" element={<RevendaDashboard />} />
                    <Route path="revendedora-dashboard" element={<ResellerDashboard />} />
                    <Route path="academy" element={<Academy />} />
                    <Route path="vallen-consultora" element={<VallenConsultora />} />
                    <Route path="retail-crm" element={<RetailCRM />} />
                    <Route path="consultant-crm" element={<ConsultantCRM />} />
                    <Route path="inventory" element={<InventoryManagement />} />
                    <Route path="seller-orders" element={<SellerOrders />} />

                    {/* Official Route Map — Fashion Tech Navigation */}
                    <Route element={<CrmGuard />}>
                      <Route path="crm" element={<CRMHub />} />
                    </Route>

                    <Route element={<AgentOrTransporterGuard />}>
                      <Route
                        path="logistica-transportadoras"
                        element={<LogisticaTransportadoras />}
                      />
                    </Route>

                    <Route path="financeiro" element={<FinanceiroHub />} />

                    <Route element={<ManufacturerGuard />}>
                      <Route path="fabricantes" element={<Navigate to="/manufacturer" replace />} />
                    </Route>

                    <Route element={<RetailerGuard />}>
                      <Route path="lojistas" element={<Navigate to="/revenda" replace />} />
                    </Route>

                    <Route
                      path="revendedoras"
                      element={<Navigate to="/revendedora-dashboard" replace />}
                    />

                    <Route element={<AgentGuard />}>
                      <Route path="agentes" element={<Navigate to="/agente" replace />} />
                    </Route>

                    {/* Protected Manufacturer specifics inside DashboardLayout */}
                    <Route element={<ManufacturerGuard />}>
                      <Route path="logistics" element={<DashboardLogistics />} />
                      <Route path="settings" element={<WhatsappSettings />} />
                    </Route>
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<AdminGuard />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="hub" element={<DashboardHub />} />
                      <Route path="crm-global" element={<AdminCRMGlobal />} />
                      <Route path="comissoes" element={<AdminCommissions />} />
                      <Route path="v-club" element={<AdminVClub />} />
                      <Route path="afiliados" element={<AdminPartners defaultTab="affiliate" />} />
                      <Route path="parceiros" element={<AdminPartners />} />
                      <Route path="agentes" element={<AdminAgents />} />
                      <Route path="financeiro" element={<AdminFinance />} />
                      <Route path="influencers" element={<AdminInfluencers />} />
                      <Route path="notificacoes" element={<AdminNotifications />} />
                      <Route
                        path="inteligencia"
                        element={<Navigate to="/admin/insights" replace />}
                      />
                      <Route path="insights" element={<AdminInsights />} />
                      <Route path="geografico" element={<AdminGeographic />} />
                      <Route path="revendedoras" element={<AdminResellers />} />
                      <Route path="zonas" element={<AdminZones />} />
                      <Route path="pedidos" element={<PlaceholderPage title="Pedidos" />} />
                      <Route path="top-marcas" element={<AdminTopBrands />} />
                      <Route path="guia-de-marcas" element={<AdminManufacturers />} />
                      <Route
                        path="fabricantes"
                        element={<Navigate to="/admin/top-marcas" replace />}
                      />
                      <Route
                        path="guia-marcas"
                        element={<Navigate to="/admin/guia-de-marcas" replace />}
                      />
                      <Route path="produtos" element={<AdminProducts />} />
                      <Route path="catalogo" element={<AdminCatalog />} />
                      <Route path="clientes" element={<Customers />} />
                      <Route path="logistica" element={<PlaceholderPage title="Logística" />} />
                      <Route path="marketing" element={<AdminMarketing />} />
                      <Route path="precificacao" element={<AdminPricing />} />
                      <Route path="guia-crm" element={<AdminManufacturerCRM />} />
                      <Route path="categorias" element={<AdminCategories />} />
                      <Route path="colecoes" element={<PlaceholderPage title="Coleções" />} />
                      <Route path="midia" element={<PlaceholderPage title="Mídia" />} />
                      <Route path="assinaturas" element={<AdminSubscriptions />} />
                      <Route path="logs-importacao" element={<AdminImportLogs />} />
                      <Route path="relatorios" element={<PlaceholderPage title="Relatórios" />} />
                      <Route path="inventory" element={<InventoryManagement />} />
                      <Route path="retail-crm" element={<RetailCRM />} />
                      <Route path="consultant-crm" element={<ConsultantCRM />} />
                      <Route
                        path="configuracoes"
                        element={<PlaceholderPage title="Configurações" />}
                      />
                      <Route path="partnerships/zoop" element={<ZoopProposal />} />
                    </Route>
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </AiAssistantProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
