import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Collections from './pages/Collections'
import ProductDetail from './pages/ProductDetail'
import CourseDetail from './pages/CourseDetail'
import Wishlist from './pages/Wishlist'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import AboutUs from './pages/AboutUs'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Revista from './pages/Revista'
import ResellerApplication from './pages/ResellerApplication'
import FashionGuide from './pages/FashionGuide'
import ManufacturerDashboard from './pages/ManufacturerDashboard'
import RetailerDashboard from './pages/RetailerDashboard'
import Academy from './pages/Academy'
import CreditoModa from './pages/CreditoModa'
import Layout from './components/Layout'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminProducts from './pages/admin/Products'
import AdminLogin from './pages/admin/Login'
import AdminCustomers from './pages/admin/Customers'
import AdminReports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'
import AdminReviews from './pages/admin/Reviews'
import AdminMarketing from './pages/admin/Marketing'
import AdminCategories from './pages/admin/Categories'
import AdminAffiliates from './pages/admin/Affiliates'
import AdminMedia from './pages/admin/Media'
import ZoopProposal from './pages/admin/ZoopProposal'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import CRM from './pages/dashboard/CRM'
import MediaKit from './pages/dashboard/MediaKit'
import Analytics from './pages/dashboard/Analytics'
import Billing from './pages/dashboard/Billing'
import Performance from './pages/dashboard/Performance'
import WhatsappSettings from './pages/dashboard/WhatsappSettings'
import AffiliateDashboard from './pages/dashboard/AffiliateDashboard'
import Affiliates from './pages/Affiliates'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import BrandProfile from './pages/BrandProfile'
import { GlobalTracking } from './components/GlobalTracking'
import AffiliateLeadForm from './pages/AffiliateLeadForm'
import BenefitsHub from './pages/BenefitsHub'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <GlobalTracking />
    <FavoritesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="clientes" element={<AdminCustomers />} />
            <Route path="relatorios" element={<AdminReports />} />
            <Route path="avaliacoes" element={<AdminReviews />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="afiliados" element={<AdminAffiliates />} />
            <Route path="midia" element={<AdminMedia />} />
            <Route path="configuracoes" element={<AdminSettings />} />
            <Route path="proposta-zoop" element={<ZoopProposal />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/crm" replace />} />
            <Route path="crm" element={<CRM />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="billing" element={<Billing />} />
            <Route path="performance" element={<Performance />} />
            <Route path="settings/whatsapp" element={<WhatsappSettings />} />
            <Route path="affiliate" element={<AffiliateDashboard />} />
            <Route path="media-kit" element={<MediaKit />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/marcas/:id" element={<BrandProfile />} />
            <Route path="/colecoes" element={<Collections />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/favoritos" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/recuperar-senha" element={<ForgotPassword />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/finalizar-compra" element={<Checkout />} />
            <Route path="/pedido-realizado" element={<OrderConfirmation />} />
            <Route path="/meus-pedidos" element={<Orders />} />
            <Route path="/revista" element={<Revista />} />
            <Route path="/conhecimento" element={<Academy />} />
            <Route path="/curso/:id" element={<CourseDetail />} />
            <Route path="/sobre-nos" element={<AboutUs />} />
            <Route path="/contato" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/guia-de-moda" element={<FashionGuide />} />
            <Route path="/revenda" element={<ResellerApplication />} />
            <Route path="/afiliados" element={<Affiliates />} />
            <Route path="/parceiro" element={<AffiliateLeadForm />} />
            <Route path="/painel-fabricante" element={<ManufacturerDashboard />} />
            <Route path="/meu-painel" element={<RetailerDashboard />} />
            <Route path="/credito-moda" element={<Navigate to="/" replace />} />
            <Route path="/beneficios" element={<BenefitsHub />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </FavoritesProvider>
  </BrowserRouter>
)

export default App
