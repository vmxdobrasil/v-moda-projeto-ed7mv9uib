import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Collections from './pages/Collections'
import ProductDetail from './pages/ProductDetail'
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
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
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

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
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
          <Route path="configuracoes" element={<AdminSettings />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/colecoes" element={<Collections />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/favoritos" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/recuperar-senha" element={<ForgotPassword />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/finalizar-compra" element={<Checkout />} />
          <Route path="/pedido-realizado" element={<OrderConfirmation />} />
          <Route path="/meus-pedidos" element={<Orders />} />
          <Route path="/sobre-nos" element={<AboutUs />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
