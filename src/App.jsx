
import './index.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import CarListing from './pages/CarListing'
import CarDetail from './pages/CarDetail'
import Dealers from './pages/Dealers'
import DealerDetail from './pages/DealerDetail'
import SignIn from './pages/SignIn'

// Layouts
import AdminLayout from './layouts/Adminlayout'
import DealerStaffLayout from './layouts/DealerStaffLayout'
import DealerManagerLayout from './layouts/DealerManagerLayout'
import EVMStaffLayout from './layouts/EVMStaffLayout'

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard'
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
import CreateQuote from './pages/dealerStaff/CreateQuote'
import AddCustomer from './pages/dealerStaff/dealer-staff/AddCustomer'
import Inventory from './pages/dealerStaff/Inventory'
import TestDriveSchedule from './pages/dealerStaff/dealer-staff/TestDriveSchedule'
import SalesQuoteManagement from './pages/dealerStaff/dealer-staff/SalesQuoteManagement'
import OrderManagement from './pages/dealerStaff/dealer-staff/OrderManagement'
import PaymentManagement from './pages/dealerStaff/dealer-staff/PaymentManagement'
import CarComparison from './pages/dealerStaff/CarComparison'
import FeedbackManagement from './pages/dealerStaff/FeedbackManagement'

// EVM Staff Sub Pages
import ProductManagement from './pages/EvmStaff/ProductManagement'
import InventoryManagement from './pages/EvmStaff/InventoryManagement'
import DealerManagement from './pages/EvmStaff/DealerManagement'
import ContractManagement from './pages/EvmStaff/ContractManagement'
import PricingManagement from './pages/EvmStaff/PricingManagement'
import SalesReport from './pages/EvmStaff/SalesReport'

// Admin Sub Pages
import Monitoring from './pages/admin/Monitoring'
import StoreManagement from './pages/admin/StoreManagement'
import UserManagement from './pages/admin/UserManagement'
import SystemConfig from './pages/admin/SystemConfig'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Header and Footer */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <CarListing />
            <Footer />
          </div>
        } />
        <Route path="/car/:model" element={
          <div className="bg-white">
            <Navbar />
            <CarDetail />
            <Footer />
          </div>
        } />
        <Route path="/dealers" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <Dealers />
            <Footer />
          </div>
        } />
        <Route path="/dealers/:id" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <DealerDetail />
            <Footer />
          </div>
        } />
        
        {/* Login Route without Header/Footer */}
        <Route path="/signin" element={<SignIn />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="store-management" element={<StoreManagement />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="system-config" element={<SystemConfig />} />
          <Route path="profile" element={<CommonProfile />} />
          <Route path="settings" element={<CommonSettings />} />
          <Route path="help" element={<CommonHelp />} />
        </Route>

        {/* Dealer Staff Routes */}
        <Route path="/dealer-staff" element={<DealerStaffLayout />}>
          <Route index element={<DealerStaffDashboard />} />
          <Route path="create-quote" element={<CreateQuote />} />
          <Route path="quote-order-management" element={<QuoteOrderManagement />} />
          <Route path="view-orders" element={<ViewOrders />} />
          <Route path="add-customer" element={<AddCustomer />} />
          <Route path="test-drive-schedule" element={<TestDriveSchedule />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="payment-management" element={<PaymentManagement />} />
          <Route path="feedback-management" element={<FeedbackManagement />} />
          <Route path="car-comparison" element={<CarComparison />} />
          <Route path="profile" element={<CommonProfile />} />
          <Route path="settings" element={<CommonSettings />} />
          <Route path="help" element={<CommonHelp />} />
        </Route>

        {/* Dealer Manager Routes */}
        <Route path="/dealer-manager" element={<DealerManagerLayout />}>
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

        {/* EVM Staff Routes */}
        <Route path="/evm-staff" element={<EVMStaffLayout />}>
          <Route index element={<EVMDashboard />} />
          <Route path="product-management" element={<ProductManagement />} />
          <Route path="inventory-management" element={<InventoryManagement />} />
          <Route path="dealer-management" element={<DealerManagement />} />
          <Route path="contract-management" element={<ContractManagement />} />
          <Route path="pricing-management" element={<PricingManagement />} />
          <Route path="sales-report" element={<SalesReport />} />
          <Route path="profile" element={<CommonProfile />} />
          <Route path="settings" element={<CommonSettings />} />
          <Route path="help" element={<CommonHelp />} />
        </Route>
        
        <Route path="*" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <p className="text-sm text-gray-400">Current URL: {window.location.pathname}</p>
              </div>
            </div>
            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
