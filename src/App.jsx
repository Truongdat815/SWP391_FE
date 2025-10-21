import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import CarListing from './pages/CarListing'
import CarDetail from './pages/CarDetail'
import Dealers from './pages/Dealers'
import DealerDetail from './pages/DealerDetail'
import SignIn from './pages/SignIn'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import Snackbar from './components/Snackbar'

// Layouts
import AdminLayout from './layouts/Adminlayout'
import DealerStaffLayout from './layouts/DealerStaffLayout'
import DealerManagerLayout from './layouts/DealerManagerLayout'
import EVMStaffLayout from './layouts/EVMStaffLayout'

// Dashboard Pages
import DealerStaffDashboard from './pages/dealerStaff/DealerStaffDashboard'
import DealerManagerDashboard from './pages/dealerManager/DealerManagerDashboard'
import EVMDashboard from './pages/EvmStaff/EVMDashboard'

// Common sub pages
import CommonProfile from './pages/CommonProfile'
import CommonSettings from './pages/CommonSettings'
import CommonHelp from './pages/CommonHelp'

// Dealer Manager Sub Pages
import TaoBaoCao from './pages/dealerManager/TaoBaoCao'
import BaoCaoDoanhSo from './pages/dealerManager/BaoCaoDoanhSo'
import XuatBaoCao from './pages/dealerManager/XuatBaoCao'
import QuanLyNhanVien from './pages/dealerManager/QuanLyNhanVien'
import QuanLyCongNo from './pages/dealerManager/QuanLyCongNo'
import TestPage from './pages/dealerManager/TestPage'

// Dealer Staff Sub Pages
import QuoteOrderManagement from './pages/dealerStaff/QuoteOrderManagement'
import ViewOrders from './pages/dealerStaff/ViewOrders'
import CreateContract from './pages/dealerStaff/CreateContract'
import CreateOrder from './pages/dealerStaff/CreateOrder'
import AddCustomer from './pages/dealerStaff/AddCustomer'
import CustomerManagement from './pages/dealerStaff/CustomerManagement'
import Inventory from './pages/dealerStaff/Inventory'
import TestDriveSchedule from './pages/dealerStaff/TestDriveSchedule'
import PaymentManagement from './pages/dealerStaff/PaymentManagement'
import CarComparison from './pages/dealerStaff/CarComparison'
import FeedbackManagement from './pages/dealerStaff/FeedbackManagement'

// EVM Staff Sub Pages
import ProductManagement from './pages/EvmStaff/ProductManagement'
import InventoryManagement from './pages/EvmStaff/InventoryManagement'
import DealerManagement from './pages/EvmStaff/DealerManagement'
import ContractManagement from './pages/EvmStaff/ContractManagement'
import PricingManagement from './pages/EvmStaff/PricingManagement'
import SalesReport from './pages/EvmStaff/SalesReport'
import ColorManagementPage from './components/ColorManagement'

// Admin Sub Pages
import StoreManagement from './pages/admin/StoreManagement'
import UserManagement from './pages/admin/UserManagement'
import OrderManagement from './pages/admin/OrderManagement'
import PromotionManagement from './pages/admin/PromotionManagement'

import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './components/Animated'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          {/* Public Routes with Header and Footer */}
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/cars" element={
            <PageTransition className="min-h-screen bg-white flex flex-col">
              <Navbar />
              <CarListing />
              <Footer />
            </PageTransition>
          } />
          <Route path="/car/:modelId" element={
            <PageTransition className="bg-white">
              <Navbar />
              <CarDetail />
              <Footer />
            </PageTransition>
          } />
          <Route path="/dealers" element={
            <PageTransition className="min-h-screen bg-white flex flex-col">
              <Navbar />
              <Dealers />
              <Footer />
            </PageTransition>
          } />
          <Route path="/dealers/:id" element={
            <PageTransition className="min-h-screen bg-white flex flex-col">
              <Navbar />
              <DealerDetail />
              <Footer />
            </PageTransition>
          } />
          
          {/* Login Route without Header/Footer */}
          <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StoreManagement />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="order-management" element={<OrderManagement />} />
            <Route path="promotion-management" element={<PromotionManagement />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<CommonSettings />} />
            <Route path="help" element={<CommonHelp />} />
          </Route>

          {/* Dealer Staff Routes - Protected */}
          <Route path="/dealer-staff" element={
            <ProtectedRoute requiredRole="dealer-staff">
              <DealerStaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DealerStaffDashboard />} />
            <Route path="create-order" element={<CreateOrder />} />
            <Route path="quote-order-management" element={<QuoteOrderManagement />} />
            <Route path="view-orders" element={<ViewOrders />} />
            <Route path="add-customer" element={<AddCustomer />} />
            <Route path="customer-management" element={<CustomerManagement />} />
            <Route path="test-drive-schedule" element={<TestDriveSchedule />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="payment-management" element={<PaymentManagement />} />
            <Route path="feedback-management" element={<FeedbackManagement />} />
            <Route path="car-comparison" element={<CarComparison />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<CommonSettings />} />
            <Route path="help" element={<CommonHelp />} />
          </Route>

          {/* Dealer Manager Routes - Protected */}
          <Route path="/dealer-manager" element={
            <ProtectedRoute requiredRole="dealer-manager">
              <DealerManagerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DealerManagerDashboard />} />
            <Route path="tao-bao-cao" element={<TaoBaoCao />} />
            <Route path="bao-cao-doanh-so" element={<BaoCaoDoanhSo />} />
            <Route path="quan-ly-nhan-vien" element={<QuanLyNhanVien />} />
            <Route path="quan-ly-cong-no" element={<QuanLyCongNo />} />
            <Route path="xuat-bao-cao" element={<XuatBaoCao />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<CommonSettings />} />
            <Route path="help" element={<CommonHelp />} />
            <Route path="test" element={<TestPage />} />
          </Route>

          {/* EVM Staff Routes - Protected */}
          <Route path="/evm-staff" element={
            <ProtectedRoute requiredRole="evm-staff">
              <EVMStaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<EVMDashboard />} />
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="inventory-management" element={<InventoryManagement />} />
            <Route path="dealer-management" element={<DealerManagement />} />
            <Route path="contract-management" element={<ContractManagement />} />
            <Route path="pricing-management" element={<PricingManagement />} />
            <Route path="color-management" element={<ColorManagementPage />} />
            <Route path="sales-report" element={<SalesReport />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<CommonSettings />} />
            <Route path="help" element={<CommonHelp />} />
          </Route>
          
          <Route path="*" element={
            <PageTransition className="min-h-screen bg-white flex flex-col">
              <Navbar />
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                  <p className="text-sm text-gray-400">Current URL: {window.location.pathname}</p>
                </div>
              </div>
              <Footer />
            </PageTransition>
          } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
      <Snackbar />
    </AuthProvider>
  );
}

export default App;