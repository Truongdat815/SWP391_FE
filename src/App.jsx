import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/public/Home'
import CarListing from './pages/public/CarListing'
import CarDetail from './pages/public/CarDetail'
import Dealers from './pages/public/Dealers'
import DealerDetail from './pages/public/DealerDetail'
import SignIn from './pages/auth/SignIn'
import ChangePassword from './pages/auth/ChangePassword'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import Snackbar from './components/Snackbar'

// Layouts
import AdminLayout from './layouts/Adminlayout'
import DealerStaffLayout from './layouts/DealerStaffLayout'
import DealerManagerLayout from './layouts/DealerManagerLayout'
import EVMStaffLayout from './layouts/EVMStaffLayout'

// Common sub pages
import CommonProfile from './pages/common/CommonProfile'
import CommonSettings from './pages/common/CommonSettings'
import CommonHelp from './pages/common/CommonHelp'

// Dealer Manager Sub Pages
import DealerManagerDashboard from './pages/dealerManager/DealerManagerDashboard'
import BaoCaoDoanhSo from './pages/dealerManager/BaoCaoDoanhSo'
import EmployeeManagement from './pages/dealerManager/EmployeeManagement'
import DealerManagerInventory from './pages/dealerManager/InventoryManagement'
import DealerManagerSettings from './pages/dealerManager/DealerManagerSettings'
import DealerManagerOrders from './pages/dealerManager/OrderManagement'
import PromotionManagement from './pages/dealerManager/PromotionManagement'
import DealerManagerUserGuide from './pages/dealerManager/UserGuide'
import DealerManagerFAQ from './pages/dealerManager/FAQ'

// Dealer Staff Sub Pages
import DealerStaffDashboard from './pages/dealerStaff/DealerStaffDashboard'
import QuoteOrderManagement from './pages/dealerStaff/QuoteOrderManagement'
import ViewOrders from './pages/dealerStaff/ViewOrders'
import CreateOrder from './pages/dealerStaff/CreateOrder'
import AddOrderDetails from './pages/dealerStaff/AddOrderDetails'
import OrderSummary from './pages/dealerStaff/OrderSummary'
import AddCustomer from './pages/dealerStaff/AddCustomer'
import CustomerManagement from './pages/dealerStaff/CustomerManagement'
import ContractManagement from './pages/dealerStaff/ContractManagement'
import ViewContracts from './pages/dealerStaff/ViewContracts'
import OrderManagement from './pages/dealerStaff/OrderManagement'
import Inventory from './pages/dealerStaff/Inventory'
import TestDriveSchedule from './pages/dealerStaff/TestDriveSchedule'
import PaymentManagement from './pages/dealerStaff/PaymentManagement'
import CarComparison from './pages/dealerStaff/CarComparison'
import FeedbackManagement from './pages/dealerStaff/FeedbackManagement'
import UserGuide from './pages/dealerStaff/UserGuide'
import FAQ from './pages/dealerStaff/FAQ'

// EVM Staff Sub Pages
import EVMStaffDashboard from './pages/EvmStaff/EVMStaffDashboard'
import ProductManagement from './pages/EvmStaff/ProductManagement'
import VehicleManagement from './pages/EvmStaff/VehicleManagement'
import DealerOrderManagement from './pages/EvmStaff/DealerOrderManagement'
import SalesReport from './pages/EvmStaff/SalesReport'
import ColorManagementPage from './components/ColorManagement'
import EVMStaffUserGuide from './pages/EvmStaff/UserGuide'

// Admin Sub Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import StoreManagement from './pages/admin/StoreManagement'
import UserManagement from './pages/admin/UserManagement'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUserGuide from './pages/admin/UserGuide'

import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PageTransition } from './components/Animated'

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence initial={false}>
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
          
          {/* Change Password Route - Protected (requires authentication) */}
          <Route path="/change-password" element={
            <ProtectedRoute>
              <PageTransition><ChangePassword /></PageTransition>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="store-management" element={<StoreManagement />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="help" element={<CommonHelp />} />
            <Route path="user-guide" element={<AdminUserGuide />} />
          </Route>

          {/* Dealer Staff Routes - Protected */}
          <Route path="/dealer-staff" element={
            <ProtectedRoute requiredRole="dealer-staff">
              <DealerStaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dealer-staff/dashboard" replace />} />
            <Route path="dashboard" element={<DealerStaffDashboard />} />
            <Route path="order-management" element={<OrderManagement />} />
            <Route path="create-order" element={<CreateOrder />} />
            {/* Legacy routes - redirect to new combined pages */}
            <Route path="view-orders" element={<Navigate to="/dealer-staff/order-management?tab=view" replace />} />
            <Route path="view-contracts" element={<Navigate to="/dealer-staff/contract-management" replace />} />
            <Route path="add-order-details/:orderId" element={<AddOrderDetails />} />
            <Route path="order-summary/:orderId" element={<OrderSummary />} />
            <Route path="quote-order-management" element={<QuoteOrderManagement />} />
            <Route path="add-customer" element={<AddCustomer />} />
            <Route path="customer-management" element={<CustomerManagement />} />
            <Route path="contract-management" element={<ContractManagement />} />
            <Route path="test-drive-schedule" element={<TestDriveSchedule />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="payment-management" element={<PaymentManagement />} />
            <Route path="feedback-management" element={<FeedbackManagement />} />
            <Route path="car-comparison" element={<CarComparison />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<CommonSettings />} />
            <Route path="help" element={<CommonHelp />} />
            <Route path="user-guide" element={<UserGuide />} />
            <Route path="faq" element={<FAQ />} />
          </Route>

          {/* Dealer Manager Routes - Protected */}
          <Route path="/dealer-manager" element={
            <ProtectedRoute requiredRole="dealer-manager">
              <DealerManagerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dealer-manager/dashboard" replace />} />
            <Route path="dashboard" element={<DealerManagerDashboard />} />
            <Route path="inventory" element={<DealerManagerInventory />} />
            <Route path="orders" element={<DealerManagerOrders />} />
            <Route path="promotion-management" element={<PromotionManagement />} />
            <Route path="bao-cao-doanh-so" element={<BaoCaoDoanhSo />} />
            <Route path="quan-ly-nhan-vien" element={<EmployeeManagement />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="settings" element={<DealerManagerSettings />} />
            <Route path="help" element={<CommonHelp />} />
            <Route path="user-guide" element={<DealerManagerUserGuide />} />
            <Route path="faq" element={<DealerManagerFAQ />} />
          </Route>

          {/* EVM Staff Routes - Protected */}
          <Route path="/evm-staff" element={
            <ProtectedRoute requiredRole="evm-staff">
              <EVMStaffLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/evm-staff/dashboard" replace />} />
            <Route path="dashboard" element={<EVMStaffDashboard />} />
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="vehicle-management" element={<VehicleManagement />} />
            <Route path="dealer-orders" element={<DealerOrderManagement />} />
            <Route path="color-management" element={<ColorManagementPage />} />
            <Route path="sales-report" element={<SalesReport />} />
            <Route path="profile" element={<CommonProfile />} />
            <Route path="help" element={<CommonHelp />} />
            <Route path="user-guide" element={<EVMStaffUserGuide />} />
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