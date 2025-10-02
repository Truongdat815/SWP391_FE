
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

// Dealer Manager Sub Pages
import TaoBaoCao from './pages/dealerManager/TaoBaoCao'
import BaoCaoDoanhSo from './pages/dealerManager/BaoCaoDoanhSo'
import QuanLyNhanVien from './pages/dealerManager/QuanLyNhanVien'
import QuanLyCongNo from './pages/dealerManager/QuanLyCongNo'
import XuatBaoCao from './pages/dealerManager/XuatBaoCao'
import TestPage from './pages/dealerManager/TestPage'

// Dealer Staff Sub Pages
import CreateQuote from './pages/dealerStaff/dealer-staff/CreateQuote'
import AddCustomer from './pages/dealerStaff/dealer-staff/AddCustomer'
import OrderFromManufacturer from './pages/dealerStaff/dealer-staff/OrderFromManufacturer'
import TestDriveSchedule from './pages/dealerStaff/dealer-staff/TestDriveSchedule'
import CreateOrder from './pages/dealerStaff/dealer-staff/CreateOrder'
import SalesQuoteManagement from './pages/dealerStaff/dealer-staff/SalesQuoteManagement'
import OrderManagement from './pages/dealerStaff/dealer-staff/OrderManagement'
import PaymentManagement from './pages/dealerStaff/dealer-staff/PaymentManagement'

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
        </Route>

        {/* Dealer Staff Routes */}
        <Route path="/dealer-staff" element={<DealerStaffLayout />}>
          <Route index element={<DealerStaffDashboard />} />
          <Route path="create-quote" element={<CreateQuote />} />
          <Route path="add-customer" element={<AddCustomer />} />
          <Route path="order-from-manufacturer" element={<OrderFromManufacturer />} />
          <Route path="test-drive-schedule" element={<TestDriveSchedule />} />
          <Route path="create-order" element={<CreateOrder />} />
          <Route path="sales-quote" element={<SalesQuoteManagement />} />
          <Route path="order-management" element={<OrderManagement />} />
          <Route path="payment-management" element={<PaymentManagement />} />
        </Route>

        {/* Dealer Manager Routes */}
        <Route path="/dealer-manager" element={<DealerManagerLayout />}>
          <Route index element={<DealerManagerDashboard />} />
          <Route path="tao-bao-cao" element={<TaoBaoCao />} />
          <Route path="bao-cao-doanh-so" element={<BaoCaoDoanhSo />} />
          <Route path="quan-ly-nhan-vien" element={<QuanLyNhanVien />} />
          <Route path="quan-ly-cong-no" element={<QuanLyCongNo />} />
          <Route path="xuat-bao-cao" element={<XuatBaoCao />} />
          <Route path="test" element={<TestPage />} />
        </Route>

        {/* EVM Staff Routes */}
        <Route path="/evm-staff" element={<EVMStaffLayout />}>
          <Route index element={<EVMDashboard />} />
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
