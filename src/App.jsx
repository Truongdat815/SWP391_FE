
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
