
import './index.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import CarListing from './pages/CarListing'
import CarDetail from './pages/CarDetail'
import SignIn from './pages/SignIn'
import DealerStaffDashboard from './pages/dashboard/DealerStaffDashboard'
import DealerManagerDashboard from './pages/dashboard/DealerManagerDashboard'
import EVMDashboard from './pages/dashboard/EVMDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import CreateQuote from './pages/dashboard/dealer-staff/CreateQuote'
import AddCustomer from './pages/dashboard/dealer-staff/AddCustomer'
import OrderFromManufacturer from './pages/dashboard/dealer-staff/OrderFromManufacturer'
import TestDriveSchedule from './pages/dashboard/dealer-staff/TestDriveSchedule'
import CreateOrder from './pages/dashboard/dealer-staff/CreateOrder'
import SalesQuoteManagement from './pages/dashboard/dealer-staff/SalesQuoteManagement'
import OrderManagement from './pages/dashboard/dealer-staff/OrderManagement'
import PaymentManagement from './pages/dashboard/dealer-staff/PaymentManagement'
import VehicleDetail from './pages/VehicleDetail'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AboutVinfast from './components/AboutVinfast'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Header and Footer */}
        <Route path="/" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <Home />
            <Footer />
          </div>
        } />
        <Route path="/cars" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <CarListing />
            <Footer />
          </div>
        } />
        <Route path="/car/:model" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <CarDetail />
            <Footer />
          </div>
        } />
        
        {/* Login Route without Header/Footer */}
        <Route path="/signin" element={<SignIn />} />
        
        {/* Dashboard Routes without Header/Footer */}
        <Route path="/dashboard/dealer-staff" element={<DealerStaffDashboard />} />
        <Route path="/dashboard/dealer-staff/create-quote" element={<CreateQuote />} />
        <Route path="/dashboard/dealer-staff/add-customer" element={<AddCustomer />} />
        <Route path="/dashboard/dealer-staff/order-from-manufacturer" element={<OrderFromManufacturer />} />
        <Route path="/dashboard/dealer-staff/test-drive-schedule" element={<TestDriveSchedule />} />
        <Route path="/dashboard/dealer-staff/create-order" element={<CreateOrder />} />
        <Route path="/dashboard/dealer-staff/sales-quote" element={<SalesQuoteManagement />} />
        <Route path="/dashboard/dealer-staff/order-management" element={<OrderManagement />} />
        <Route path="/dashboard/dealer-staff/payment-management" element={<PaymentManagement />} />
        <Route path="/dashboard/dealer-manager" element={<DealerManagerDashboard />} />
        <Route path="/dashboard/evm-staff" element={<EVMDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        
        {/* Vehicle Detail Routes */}
        <Route path="/vehicle/:model" element={<VehicleDetail />} />
        
        <Route path="*" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <Home />
            <Footer />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
