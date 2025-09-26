
import './index.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Listing from './pages/Listing'
import Shop from './pages/Shop'
import Contact from './pages/Contact'
import SignIn from './pages/SignIn'
import AddCar from './pages/AddCar'
import DealerStaffDashboard from './pages/dashboard/DealerStaffDashboard'
import DealerManagerDashboard from './pages/dashboard/DealerManagerDashboard'
import EVMDashboard from './pages/dashboard/EVMDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import VehicleDetail from './pages/VehicleDetail'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

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
        <Route path="/about" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <About />
            <Footer />
          </div>
        } />
        <Route path="/listing" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <Listing />
            <Footer />
          </div>
        } />
        <Route path="/shop" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <Shop />
            <Footer />
          </div>
        } />
        <Route path="/contact" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <Contact />
            <Footer />
          </div>
        } />
        <Route path="/add-car" element={
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <AddCar />
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
